import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import Legend from "../Legend/Legend";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function Map({
  longitude,
  latitude,
  color,
  title,
  onTitleChange,
}: {
  longitude: number;
  latitude: number;
  color: string;
  title: string;
  onTitleChange?: (newTitle: string) => void;
}) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

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

  const radius = 100;

  const handleSave = () => {
    if (onTitleChange) {
      onTitleChange(editedTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  return (
    <>
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
          <Popup>
            <div className="p-2 min-w-[200px]">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location name"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-center">{title}</h3>
                  {user && user.role === "admin" && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Edit Name
                    </button>
                  )}
                </div>
              )}
            </div>
          </Popup>
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
      <Legend />
    </>
  );
}
