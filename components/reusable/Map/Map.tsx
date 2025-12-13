import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Legend from "../Legend/Legend";
import { useState, useRef, useMemo, useEffect } from "react";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

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
  const [inputLat, setInputLat] = useState(latitude);
  const [inputLng, setInputLng] = useState(longitude);

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
      const lat = parseFloat(position.lat.toFixed(6));
      const lng = parseFloat(position.lng.toFixed(6));
      setMarkerPos([lat, lng]);
      setInputLat(lat);
      setInputLng(lng);

      const coordsRef = ref(database, "sensors/coordinates");
      await update(coordsRef, { latitude: lat, longitude: lng });

      fetchAddress(lat, lng);
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

  const handleGoToCoordinates = async () => {
    const lat = Number(inputLat);
    const lng = Number(inputLng);
    if (isNaN(lat) || isNaN(lng)) return alert("Invalid coordinates");
    setMarkerPos([lat, lng]);
    fetchAddress(lat, lng);

    const coordsRef = ref(database, "sensors/coordinates");
    await update(coordsRef, { latitude: lat, longitude: lng });
    toast.success(`Successfully saving coordinates.`);
  };

  useEffect(() => {
    fetchAddress(latitude, longitude);
  }, [latitude, longitude]);

  return (
    <>
      <div className="mb-8">
        <Legend />
      </div>
      {user && user.role === "admin" && (
        <div className="grid gap-2 mb-3 p-2 bg-primary/5 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2">
            <div className="grid gap-2">
              <label htmlFor="lat" className="font-semibold manrope text-sm">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={inputLat}
                onChange={(e) => setInputLat(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 w-40 focus:outline-none "
                placeholder="Latitude"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="long" className="font-semibold manrope text-sm">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={inputLng}
                onChange={(e) => setInputLng(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 w-40 focus:outline-none "
                placeholder="Longitude"
              />
            </div>
            <button
              onClick={handleGoToCoordinates}
              className="px-4 py-1 bg-primary self-end max-w-min text-white rounded-md hover:bg-secondary cursor-pointer transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={markerPos}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <RecenterMap lat={markerPos[0]} lng={markerPos[1]} />
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none "
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
                        Drag marker or input coordinates
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
    </>
  );
}
