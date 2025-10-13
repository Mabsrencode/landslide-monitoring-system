import cron from "node-cron";
import axios from "axios";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { nowISOString } from "@/utils/date";

const CRON_LOCK_DOC = "system/cronLock";
const ALERT_STATE_DOC = "system/lastAlertState";

async function acquireLock(
  lockId: string,
  timeoutMs: number = 120000
): Promise<boolean> {
  try {
    const lockRef = doc(db, CRON_LOCK_DOC);
    const lockSnap = await getDoc(lockRef);

    const now = Date.now();
    const lockData = lockSnap.exists() ? lockSnap.data() : null;

    if (lockData && lockData.expiresAt > now) {
      return false;
    }

    await setDoc(lockRef, {
      lockId,
      acquiredAt: now,
      expiresAt: now + timeoutMs,
      instance: process.env.VERCEL_URL || "unknown",
    });

    return true;
  } catch (error) {
    console.error("Error acquiring lock:", error);
    return false;
  }
}

async function releaseLock(lockId: string): Promise<void> {
  try {
    const lockRef = doc(db, CRON_LOCK_DOC);
    const lockSnap = await getDoc(lockRef);

    if (lockSnap.exists()) {
      const lockData = lockSnap.data();
      if (lockData.lockId === lockId) {
        await setDoc(
          lockRef,
          {
            releasedAt: Date.now(),
          },
          { merge: true }
        );
      }
    }
  } catch (error) {
    console.error("Error releasing lock:", error);
  }
}

async function renewLock(
  lockId: string,
  timeoutMs: number = 120000
): Promise<boolean> {
  try {
    const lockRef = doc(db, CRON_LOCK_DOC);
    const lockSnap = await getDoc(lockRef);

    if (lockSnap.exists()) {
      const lockData = lockSnap.data();
      if (lockData.lockId === lockId) {
        await setDoc(
          lockRef,
          {
            expiresAt: Date.now() + timeoutMs,
          },
          { merge: true }
        );
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error renewing lock:", error);
    return false;
  }
}

export function startSensorCron() {
  console.log("🌋 Sensor monitoring cron initialized.");

  cron.schedule("0 */30 * * * *", async () => {
    const lockId = uuidv4();
    let lockAcquired = false;

    try {
      lockAcquired = await acquireLock(lockId, 120000);

      if (!lockAcquired) {
        console.log("⏳ Cron job locked by another instance, skipping...");
        return;
      }

      console.log("🔒 Lock acquired, processing sensor data...");

      const snapshot = await get(ref(database, "sensors/"));
      const latestData = snapshot.val();
      if (!latestData) {
        console.log("No sensor data found.");
        return;
      }

      const color = latestData.warningLevel?.color?.toUpperCase();
      if (!color) return;

      const stateRef = doc(db, ALERT_STATE_DOC);
      const stateSnap = await getDoc(stateRef);
      const stateData = stateSnap.exists() ? stateSnap.data() : null;

      const lastAlertColor = stateData?.color ?? null;
      const lastUpdated = stateData?.updatedAt
        ? new Date(stateData.updatedAt)
        : null;
      const now = new Date();

      console.log(`Current: ${color}, Last: ${lastAlertColor}`);

      await renewLock(lockId);

      if (
        lastUpdated &&
        now.getTime() - lastUpdated.getTime() < 2 * 60 * 1000
      ) {
        console.log("⏳ Skipping - alert sent recently (2min cooldown).");
        return;
      }

      if (color === "GREEN") {
        if (lastAlertColor !== "GREEN") {
          console.log("✅ Status returned to GREEN — resetting alert state.");
          await setDoc(
            stateRef,
            { color: "GREEN", updatedAt: nowISOString() },
            { merge: true }
          );
        }
        return;
      } else if (color === "YELLOW") {
        if (lastAlertColor !== "YELLOW") {
          console.log("✅ Status returned to YELLOW — resetting alert state.");
          await setDoc(
            stateRef,
            { color: "YELLOW", updatedAt: nowISOString() },
            { merge: true }
          );
        }
        return;
      }

      if (color === "ORANGE" && lastAlertColor === "RED") {
        console.log(
          "🛑 Skipping ORANGE alert — previous state was RED (downgrade prevention)"
        );
        await setDoc(
          stateRef,
          { color: "ORANGE", updatedAt: nowISOString() },
          { merge: true }
        );
        return;
      }

      await renewLock(lockId);

      if ((color === "ORANGE" || color === "RED") && lastAlertColor !== color) {
        console.log(`🚨 ${color} warning detected! Sending SMS broadcast...`);

        const formattedDate = now
          .toLocaleString("en-PH", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(" ", "");

        const alertMessages = {
          ORANGE: `Bantay Landslide (${formattedDate}): Orange Warning Alert - High risk of landslide due to heavy rainfall and unstable soil. Affected Area: Zone 1 Be prepared for possible evacuation and avoid landslide-prone areas.`,
          RED: `Bantay Landslide (${formattedDate}): Red Warning Alert - Very high risk of landslide!, Affected Area: Zone 1, Immediate evacuation required. Do not stay in landslide-prone areas.`,
        };

        await setDoc(doc(db, "incidents", uuidv4()), {
          type: "Landslide Warning",
          message: latestData.warningLevel.message,
          level: color,
          createdAt: nowISOString(),
        });

        await setDoc(
          stateRef,
          { color, updatedAt: nowISOString() },
          { merge: true }
        );

        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sms`, {
          message: alertMessages[color as "ORANGE" | "RED"],
        });

        console.log(`✅ ${color} SMS broadcast sent and state saved.`);
      } else {
        console.log(
          `ℹ️ ${color} alert - no change from previous state (${lastAlertColor})`
        );
      }

      await setDoc(doc(db, "sensorHistory", uuidv4()), {
        ...latestData,
        createdAt: nowISOString(),
      });
    } catch (error) {
      console.error("❌ Error in landslide monitoring cron:", error);
    } finally {
      if (lockAcquired) {
        await releaseLock(lockId);
        console.log("🔓 Lock released");
      }
    }
  });
}
