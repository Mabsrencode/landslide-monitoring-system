import { collection, db, doc, getDocs, updateDoc } from "@/lib/firebase/config";
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
}

export default MonitorService;
