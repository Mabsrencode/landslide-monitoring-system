import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";

export default function Map({
  longitude,
  latitude,
  color,
  title,
}: {
  longitude: number;
  latitude: number;
  color: string;
  title: string;
}) {
  let marker: string;
  switch (color.toUpperCase()) {
    case "RED":
      marker = "/assets/markers/red-marker.png";
      break;
    case "ORANGE":
      marker = "/assets/markers/orange-marker.png";
      break;
    case "YELLOW":
      marker = "/assets/markers/yellow-marker.png";
      break;
    case "GREEN":
      marker = "/assets/markers/green-marker.png";
      break;
    default:
      marker = "/assets/markers/green-marker.png";
      break;
  }

  const colorMap: Record<string, string> = {
    RED: "#FF0000",
    ORANGE: "#FFA500",
    YELLOW: "#FFFF00",
    GREEN: "#00FF00",
  };

  const circleColor = colorMap[color.toUpperCase()] || "#00FF00";

  const customIcon = new L.Icon({
    iconUrl: marker,
    iconSize: [40, 40],
  });

  const radius = 200;

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[latitude, longitude]} icon={customIcon}>
        <Popup>{title}</Popup>
      </Marker>

      <Circle
        center={[latitude, longitude]}
        radius={radius}
        pathOptions={{
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.3,
        }}
      />
    </MapContainer>
  );
}
