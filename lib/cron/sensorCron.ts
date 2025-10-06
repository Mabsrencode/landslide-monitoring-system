import cron from "node-cron";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { nowISOString } from "@/utils/date";
let cronStarted = false;
export function startSensorCron() {
  if (cronStarted) {
    console.log("Sensor cron already running.");
    return;
  }
  cronStarted = true;
  // */10 * * * * *
  cron.schedule("0 * * * *", async () => {
    try {
      const snapshot = await get(ref(database, "sensors/"));
      const latestData = snapshot.val();
      if (!latestData) {
        console.log("No sensor data found.");
        return;
      }
      if (
        latestData.warningLevel.color === "RED" ||
        latestData.warningLevel.color === "ORANGE"
      ) {
        await setDoc(doc(db, "incidents", uuidv4()), {
          type: "Landslide Warning",
          message: latestData.warningLevel.message,
          level: latestData.warningLevel.color,
          createdAt: nowISOString(),
        });
      }

      const id = uuidv4();
      await setDoc(doc(db, "sensorHistory", id), {
        ...latestData,
        createdAt: nowISOString(),
      });
    } catch (error) {
      console.error("Error saving sensor data:", error);
    }
  });
}
