import { useState } from "react";
import { updateShipPosition } from "../services/api";

interface Ship {
  id: string;
  name: string;
}

interface MovingModalProps {
  ships: Ship[];
  onMove: (id: string, lat: number, lng: number) => void;
}

export default function MovingModal({ ships, onMove }: MovingModalProps) {
  const [coordinates, setCoordinates] = useState<{
    [id: string]: { lat: string; lng: string };
  }>({});

  // Handle input changes
  const handleChange = (id: string, type: "lat" | "lng", value: string) => {
    setCoordinates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: value,
      },
    }));
  };

  // Handle moving the ship
  const handleMove = async (id: string, lat: number, lng: number) => {
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid coordinates");
      return;
    }

    try {
      const result = await updateShipPosition({
        ship_id: Number(id),
        latitude: lat,
        longitude: lng,
      });
      alert(result.message);
      onMove(id, lat, lng); // call parent callback if needed
    } catch (err) {
      console.error(err);
      alert("Error moving ship");
    }
  };

  return (
    <div className="space-y-4">
      {ships.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No ships to move</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ships.map((ship) => (
            <div
              key={ship.id}
              className="flex flex-col p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <span className="font-medium text-gray-800">{ship.name}</span>
              <div className="flex space-x-2 mt-2">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={coordinates[ship.id]?.lat || ""}
                  onChange={(e) => handleChange(ship.id, "lat", e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-24"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={coordinates[ship.id]?.lng || ""}
                  onChange={(e) => handleChange(ship.id, "lng", e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-24"
                />
                <button
                  onClick={() => {
                    const lat = parseFloat(coordinates[ship.id]?.lat || "");
                    const lng = parseFloat(coordinates[ship.id]?.lng || "");
                    handleMove(ship.id, lat, lng);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Move
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
