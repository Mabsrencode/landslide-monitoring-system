class MonitorService {
  private static instance: MonitorService;
  public static getInstance = () => {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService();
    }
    return MonitorService.instance;
  };

  
}

export default MonitorService;
