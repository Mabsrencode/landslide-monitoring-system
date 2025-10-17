interface SensorReading {
  value: number;
  timestamp: string;
}

interface SensorWarningLevel {
  color: string;
  message: string;
}

interface SensorHistoryItem {
  createdAt: string;
  moisture: SensorReading;
  rain: SensorReading;
  vibration: SensorReading;
  warningLevel: SensorWarningLevel;
}

interface ChartDataPoint {
  time: string;
  moisture: number;
  rain: number;
  vibration: number;
}

type RealtimeSensorData = {
  enable: boolean;
  uid: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  moisture: {
    value: number;
    timestamp: string;
  };
  rain: {
    value: number;
    timestamp: string;
  };
  vibration: {
    value: number;
    timestamp: string;
  };
  warningLevel: {
    color: string;
    message: string;
  };
  createdAt?: string;
} | null;
