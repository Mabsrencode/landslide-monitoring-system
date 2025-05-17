export function evaluateLandslideRisk(
  data: {
    moisture: { value: number; timestamp: string };
    rain: { value: number; timestamp: string };
    vibration: { value: number; timestamp: string };
    tilt: { value: number; timestamp: string };
    warningLevel: string;
  } | null
) {
  if (!data) {
    return "Good";
  }
  const { moisture, rain, tilt, vibration } = data;

  if (vibration.value > 1.5 || moisture.value > 80) {
    return "High";
  } else if (
    (vibration.value > 0.5 && vibration.value <= 1.5) ||
    (moisture.value > 60 && rain.value > 85) ||
    (tilt.value < 15 && moisture.value > 60)
  ) {
    return "Medium";
  } else if (moisture.value > 50 || rain.value > 70) {
    return "Low";
  } else {
    return "Good";
  }
}
