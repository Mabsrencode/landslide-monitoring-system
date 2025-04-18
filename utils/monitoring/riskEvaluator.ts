interface LandslideData {
  vibration: number;
  humidity: number;
  soilMoisture: number;
  temperature: number;
}

export function evaluateLandslideRisk(data: LandslideData) {
  const { vibration, humidity, soilMoisture, temperature } = data;

  if (vibration > 1.5 || soilMoisture > 80) {
    return "High";
  } else if (
    (vibration > 0.5 && vibration <= 1.5) ||
    (soilMoisture > 60 && humidity > 85) ||
    (temperature < 15 && soilMoisture > 60)
  ) {
    return "Medium";
  } else if (soilMoisture > 50 || humidity > 70) {
    return "Low";
  } else {
    return "Good";
  }
}
