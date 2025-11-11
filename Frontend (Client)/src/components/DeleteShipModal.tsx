import { useState } from "react";
import { deleteAllShip } from "../services/api";
import { Search } from "lucide-react";

interface Ship {
  id: number;
  name: string;
}

interface DeleteShipModalProps {
  ships: Ship[];
  onDelete?: (id: number) => void; // optional parent callback
}

export default function DeleteShipModal({
  ships,
  onDelete,
}: DeleteShipModalProps) {
  const [shipList, setShipList] = useState<Ship[]>(ships);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ship?"
    );
    if (!confirmDelete) return;

    try {
      setLoadingId(id);
      await deleteAllShip(id);
      window.alert(`Ship with ID ${id} deleted successfully.`);

      // Update UI locally
      setShipList((prev) => prev.filter((ship) => ship.id !== id));

      // Notify parent if needed
      if (onDelete) onDelete(id);
    } catch (error: any) {
      window.alert(`Error deleting ship: ${error.message || error}`);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredShips = shipList.filter((ship) =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex justify-center mb-4">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search ships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Ship list */}
      {filteredShips.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {searchTerm ? "No ships match your search" : "No ships to delete"}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredShips.map((ship) => (
            <div
              key={ship.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
            >
              <span className="font-medium text-gray-800">{ship.name}</span>
              <button
                onClick={() => handleDelete(ship.id)}
                disabled={loadingId === ship.id}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                  loadingId === ship.id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {loadingId === ship.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
