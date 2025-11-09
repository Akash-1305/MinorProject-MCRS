import { useState, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState(""); // Response message

  const filteredShips = useMemo(() => {
    if (!search) return ships;
    return ships.filter((ship) =>
      ship.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, ships]);

  const handleMove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedShip) {
      setMessage("Please select a ship");
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setMessage("Please enter valid coordinates");
      return;
    }

    try {
      const result = await updateShipPosition({
        ship_id: Number(selectedShip.id),
        latitude,
        longitude,
      });

      setMessage(result.message); // Show message
      onMove(selectedShip.id, latitude, longitude);

      // Reset only coordinates
      setLat("");
      setLng("");
    } catch (err) {
      console.error(err);
      setMessage("Error moving ship");
    }
  };

  return (
    <div className="flex space-x-8">
      <div className="flex-1 space-y-4">
        {ships.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No ships available</p>
        ) : (
          <>
            <div className="relative">
              <input
                type="text"
                placeholder="Search and select ship"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              {dropdownOpen && filteredShips.length > 0 && (
                <ul className="absolute top-full left-0 right-0 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 z-10">
                  {filteredShips.map((ship) => (
                    <li
                      key={ship.id}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setSelectedShip(ship);
                        setSearch(ship.name);
                        setDropdownOpen(false);
                        setMessage("");
                      }}
                    >
                      {ship.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedShip && (
              <div className="flex flex-col space-y-2 mt-2">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleMove}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Move
                </button>
              </div>
            )}
          </>
        )}
        <div className="flex-1 border border-gray-300 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
          <h3 className="font-semibold mb-2">Response</h3>
          {message ? (
            <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
          ) : (
            <p className="text-gray-400">Response will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}
