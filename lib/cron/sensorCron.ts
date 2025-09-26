import cron from "node-cron";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { nowISOString } from "@/utils/date";

export function startSensorCron() {

  cron.schedule("*/10 * * * * *", async () => {
    try {
      const snapshot = await get(ref(database, "sensors/"));
      const latestData = snapshot.val();
        console.log(latestData)
      if (!latestData) {
        console.log("No sensor data found.");
        return;
      }

      const id = uuidv4();
      await setDoc(doc(db, "sensorHistory", id), {
        ...latestData,
        createdAt: nowISOString(),
      });

      console.log("Sensor data saved:", latestData);
    } catch (error) {
      console.error("Error saving sensor data:", error);
    }
  });
}
