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
