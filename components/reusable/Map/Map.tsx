import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import Legend from "../Legend/Legend";
import { useState, useRef, useMemo, useEffect } from "react";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
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
  const [markerPos, setMarkerPos] = useState<[number, number]>([
    latitude,
    longitude,
  ]);
  const [address, setAddress] = useState<string>("Fetching address...");

  const markerRef = useRef<L.Marker | null>(null);

  const markerIcon = useMemo(() => {
    let markerUrl: string;
    switch (color.toUpperCase()) {
      case "RED":
        markerUrl = "/assets/markers/red-marker.png";
        break;
      case "ORANGE":
        markerUrl = "/assets/markers/orange-marker.png";
        break;
      case "YELLOW":
        markerUrl = "/assets/markers/yellow-marker.png";
        break;
      case "GREEN":
      default:
        markerUrl = "/assets/markers/green-marker.png";
    }
    return new L.Icon({
      iconUrl: markerUrl,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }, [color]);

  const colorMap: Record<string, string> = {
    RED: "#FF0000",
    ORANGE: "#FFA500",
    YELLOW: "#FFFF00",
    GREEN: "#00FF00",
  };

  const circleColor = colorMap[color.toUpperCase()] || "#00FF00";

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted);
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Failed to fetch address");
    }
  };

  const handleDragEnd = async () => {
    const marker = markerRef.current;
    if (marker) {
      const position = marker.getLatLng();
      const lat = position.lat.toFixed(6);
      const lng = position.lng.toFixed(6);

      setMarkerPos([Number(lat), Number(lng)]);

      const coordsRef = ref(database, "sensors/coordinates");
      await update(coordsRef, {
        latitude: lat,
        longitude: lng,
      });

      fetchAddress(Number(lat), Number(lng));
    }
  };

  const handleSave = () => {
    if (onTitleChange) onTitleChange(editedTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  useEffect(() => {
    fetchAddress(latitude, longitude);
  }, [fetchAddress, latitude, longitude]);

  return (
    <>
      <MapContainer
        center={markerPos}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={markerPos}
          icon={markerIcon}
          draggable={user?.role === "admin"}
          eventHandlers={{ dragend: handleDragEnd }}
          ref={markerRef}
        >
          <Popup>
            <div className="p-2 min-w-[220px]">
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
                  <div>
                    <div>
                      <span className="font-semibold">Lat:</span> {markerPos[0]}
                    </div>
                    <div>
                      <span className="font-semibold">Long:</span>{" "}
                      {markerPos[1]}
                    </div>
                    <div className="break-words">
                      <span className="font-semibold">Address:</span>{" "}
                      {address || "Fetching..."}
                    </div>
                  </div>

                  {user && user.role === "admin" && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        Edit Name
                      </button>
                      <p className="text-sm text-gray-600 text-center mt-2">
                        Drag marker to update coordinates
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </Popup>
        </Marker>

        <Circle
          center={markerPos}
          radius={100}
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
