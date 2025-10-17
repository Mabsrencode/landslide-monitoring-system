// /app/api/cron/sensor/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { ref, get as rdbGet } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { nowISOString } from "@/utils/date";

const CRON_LOCK_DOC = "system/cronLock";
const ALERT_STATE_DOC = "system/lastAlertState";

async function acquireLock(lockId: string, timeoutMs = 120000) {
  try {
    const lockRef = doc(db, CRON_LOCK_DOC);
    const lockSnap = await getDoc(lockRef);

    const now = Date.now();
    const lockData = lockSnap.exists() ? lockSnap.data() : null;

    if (lockData && (lockData.expiresAt ?? 0) > now) {
      return false;
    }

    await setDoc(lockRef, {
      lockId,
      acquiredAt: now,
      expiresAt: now + timeoutMs,
      instance: process.env.VERCEL_URL || "unknown",
    });

    return true;
  } catch (err) {
    console.error("Error acquiring lock:", err);
    return false;
  }
}

async function renewLock(lockId: string, timeoutMs = 120000) {
  try {
    const lockRef = doc(db, CRON_LOCK_DOC);
    const lockSnap = await getDoc(lockRef);
    if (!lockSnap.exists()) return false;
    const lockData = lockSnap.data();
    if (lockData.lockId !== lockId) return false;
    await setDoc(
      lockRef,
      { expiresAt: Date.now() + timeoutMs },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Error renewing lock:", err);
    return false;
  }
}

async function releaseLock(lockId: string) {
  try {
    const lockRef = doc(db, CRON_LOCK_DOC);
    const lockSnap = await getDoc(lockRef);
    if (!lockSnap.exists()) return;
    const lockData = lockSnap.data();
    if (lockData.lockId === lockId) {
      await setDoc(lockRef, { releasedAt: Date.now() }, { merge: true });
    }
  } catch (err) {
    console.error("Error releasing lock:", err);
  }
}

export async function GET() {
  const lockId = uuidv4();
  let lockAcquired = false;

  try {
    lockAcquired = await acquireLock(lockId, 120000);
    if (!lockAcquired) {
      console.log("⏳ Cron locked by another instance — skipping this run.");
      return NextResponse.json({ message: "locked" }, { status: 200 });
    }
    console.log("🔒 Lock acquired, running cron cycle...");

    const snapshot = await rdbGet(ref(database, "sensors/"));
    const latestData = snapshot.val();
    if (!latestData) {
      console.log("No sensor data found.");
      return NextResponse.json({ message: "no-data" }, { status: 200 });
    }

    if (latestData.enable === false) {
      console.log("🚫 Monitoring disabled — skipping this cycle.");
      return NextResponse.json({ message: "disabled" }, { status: 200 });
    }

    try {
      await setDoc(doc(db, "sensorHistory", uuidv4()), {
        ...latestData,
        createdAt: nowISOString(),
      });
    } catch (err) {
      console.error("Failed to write sensorHistory:", err);
    }

    const colorRaw = latestData.warningLevel?.color;
    const color = typeof colorRaw === "string" ? colorRaw.toUpperCase() : null;
    if (!color) {
      console.log("No warningLevel.color present — nothing to do.");
      return NextResponse.json({ message: "no-color" }, { status: 200 });
    }

    const stateRef = doc(db, ALERT_STATE_DOC);
    const stateSnap = await getDoc(stateRef);
    const stateData = stateSnap.exists() ? stateSnap.data() : null;
    const lastAlertColor = stateData?.color ?? null;
    const lastUpdated = stateData?.updatedAt
      ? new Date(stateData.updatedAt)
      : null;
    const now = new Date();

    console.log(`Current color: ${color}, Last color: ${lastAlertColor}`);

    if (lastUpdated && now.getTime() - lastUpdated.getTime() < 2 * 60 * 1000) {
      console.log("⏳ Cooldown active (2 min). Skipping this cycle.");
      return NextResponse.json({ message: "cooldown" }, { status: 200 });
    }

    if (color === "GREEN" || color === "YELLOW") {
      if (lastAlertColor !== color) {
        console.log(`Resetting lastAlertState to ${color}.`);
        await setDoc(
          stateRef,
          { color, updatedAt: nowISOString() },
          { merge: true }
        );
      }
      return NextResponse.json({ message: "reset-state" }, { status: 200 });
    }

    if (color === "ORANGE" && lastAlertColor === "RED") {
      console.log(
        "Downgrade from RED -> ORANGE detected. Recording state but not broadcasting."
      );
      await setDoc(
        stateRef,
        { color: "ORANGE", updatedAt: nowISOString() },
        { merge: true }
      );
      return NextResponse.json(
        { message: "downgrade-recorded" },
        { status: 200 }
      );
    }

    let zoneName = "Unknown Area";
    try {
      const zoneId = latestData.zoneId || "pBrGC519Ne5tAzyCQ2Ks";
      const zoneRef = doc(db, "sensor", zoneId);
      const zoneSnap = await getDoc(zoneRef);
      if (zoneSnap.exists())
        zoneName = (zoneSnap.data() as any).name || zoneName;
    } catch (err) {
      console.error("Failed to fetch zone name:", err);
    }

    if ((color === "ORANGE" || color === "RED") && lastAlertColor !== color) {
      console.log(
        `🚨 Color changed to ${color}. Preparing to broadcast SMS...`
      );

      await setDoc(
        stateRef,
        { color, updatedAt: nowISOString() },
        { merge: true }
      );

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

      const alertMessages: Record<string, string> = {
        ORANGE: `Bantay Landslide (${formattedDate}): Orange Warning Alert - High risk of landslide due to heavy rainfall and unstable soil. Affected Area: ${zoneName}. Be prepared for possible evacuation and avoid landslide-prone areas.`,
        RED: `Bantay Landslide (${formattedDate}): Red Warning Alert - Very high risk of landslide! Affected Area: ${zoneName}. Immediate evacuation required. Do not stay in landslide-prone areas.`,
      };

      try {
        await setDoc(doc(db, "incidents", uuidv4()), {
          type: "Landslide Warning",
          message: latestData.warningLevel?.message ?? alertMessages[color],
          level: color,
          createdAt: nowISOString(),
        });
      } catch (err) {
        console.error("Failed to write incident:", err);
      }

      await renewLock(lockId, 120000);

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/sms`,
          {
            message: alertMessages[color],
          },
          {
            timeout: 30_000,
          }
        );
        console.log("✅ SMS broadcast sent.");
      } catch (err) {
        console.error("Failed to call /api/sms:", err);
      }

      return NextResponse.json(
        { message: "alert-sent", level: color },
        { status: 200 }
      );
    } else {
      console.log("No alert change detected or already same as last state.");
      return NextResponse.json({ message: "no-change" }, { status: 200 });
    }
  } catch (err: any) {
    console.error("Cron error:", err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 }
    );
  } finally {
    if (lockAcquired) {
      try {
        await releaseLock(lockId);
        console.log("🔓 Lock released.");
      } catch (err) {
        console.error("Error releasing lock in finally:", err);
      }
    }
  }
}
