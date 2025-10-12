import {
  collection,
  db,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "@/lib/firebase/config";
import { errorRes, jsonRes } from "@/utils/auth/authApiResponse";
import { nowISOString } from "@/utils/date";

class MonitorService {
  private static instance: MonitorService;
  public static getInstance = () => {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService();
    }
    return MonitorService.instance;
  };

  public getIncidents = async () => {
    const response = await getDocs(collection(db, "incidents"));
    try {
      const data = response.docs;
      const formattedData = data.map((e) => e.data());
      return jsonRes(formattedData, 200);
    } catch (error) {
      console.log(error);
      return errorRes(error);
    }
  };

  public getSensorHistory = async () => {
    const response = await getDocs(collection(db, "sensorHistory"));
    try {
      const data = response.docs;
      const formattedData = data.map((e) => e.data());
      return jsonRes(formattedData, 200);
    } catch (error) {
      console.log(error);
      return errorRes(error);
    }
  };

  public getSensorName = async () => {
    try {
      const response = await getDoc(doc(db, "sensor", "pBrGC519Ne5tAzyCQ2Ks"));
      const data = response.data();
      return jsonRes(data, 200);
    } catch (error) {
      console.log(error);
      return errorRes(error);
    }
  };
  public updateSensorName = async (name: string) => {
    try {
      const sensorRef = doc(db, "sensor", "pBrGC519Ne5tAzyCQ2Ks");
      await updateDoc(sensorRef, {
        name: name,
        updatedAt: nowISOString(),
      });
      return jsonRes({ message: "Sensor name updated successfully" }, 200);
    } catch (error) {
      console.log(error);
      return errorRes(error);
    }
  };
}

export default MonitorService;
