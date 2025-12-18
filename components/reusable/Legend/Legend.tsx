import React from "react";
import "./style.css"
const Legend = () => {

  const legendData: { color: string; label: string; sensor: string; threshold: string }[] = [
    { color: "bg-green-500", label: "Stable (No risk detected)", sensor: "All", threshold: "Below thresholds" },
    { color: "bg-yellow-500", label: "Caution (Minor changes observed)", sensor: "Rain + Moisture (Combined)", threshold: "Rain 73-92% OR Moisture 73-90% (score 1-2)" },
    { color: "bg-orange-500", label: "Alert (Possible landslide signs)" , sensor: "Rain + Moisture (Combined)", threshold: "Rain > 92% AND Moisture > 90%" },
    { color: "bg-red-500", label: "Danger (High landslide risk)", sensor: "Rain + Moisture + Vibration (Combined)", threshold: "Rain > 92% AND Moisture > 90% AND Vibration Detected" },
  ]
  

  return (
    <div className="flex gap-8 w-full flex-wrap items-center justify-center mt-4">
      {legendData.map((data)=> (
        <div key={data.color} className="flex items-center gap-2 bg-accent/20 p-2 rounded-md relative legend-container">
        <div className="details">
          <p><span className="font-semibold">Sensor:</span> {data.sensor}</p>
          <p><span className="font-semibold">Threshold:</span> {data.threshold}</p>
        </div>
        <div className={`h-[15px] w-[15px] ${data.color} rounded`}></div>
        <h4 className="text-sm manrope font-semibold">
          {data.label}
        </h4>
      </div>
      ))}
    </div>
  );
};

export default Legend;
