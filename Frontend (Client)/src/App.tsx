import { useState, useEffect, useMemo } from "react";
import { Ship, Trash2, Navigation, Bell, Search } from "lucide-react";
import MapView from "./components/MapView";
import Modal from "./components/Modal";
import AddShipModal from "./components/AddShipModal";
import DeleteShipModal from "./components/DeleteShipModal";
import MovingModal from "./components/MovingModal";
import AlertModal from "./components/AlertModal";
import {
  getAllAllShips,
  createAllShip,
  getAllAlerts,
  getAllTriggeredAlerts,
  AlertResultBase,
} from "./services/api";
import { generateRandomShips } from "./utils/generateShips";

interface ShipData {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  type: string;
  speed: number;
  rotation_speed: number;
}

interface Alert {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: Date;
  source: "user" | "system";
}

type ModalType = "add" | "delete" | "moving" | "alert" | null;

function App() {
  const [ships, setShips] = useState<ShipData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const [triggeredAlerts, setTriggeredAlerts] = useState<AlertResultBase[]>([]);

  useEffect(() => {
    const fetchTriggered = async () => {
      try {
        const data = await getAllTriggeredAlerts();
        const activeAlerts = data.filter(
          (alert: any) => alert.status === true || alert.status === 1
        );
        setTriggeredAlerts(activeAlerts);
        setAlertCount(activeAlerts.length); // update alert badge count
      } catch (err) {
        console.error("Error fetching triggered alerts:", err);
      }
    };

    fetchTriggered();
  }, []);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const allShips = await getAllAllShips();
        const formattedShips: ShipData[] = allShips.map((ship) => ({
          id: ship.shipid.toString(),
          name: ship.name,
          position: { lat: ship.latitude, lng: ship.longitude },
          type: String(ship.type),
          speed: ship.ship_info?.speed ?? 0,
          rotation_speed: ship.ship_info?.rotation_speed ?? 0,
        }));
        setShips(formattedShips);
      } catch (error) {
        console.error("Failed to fetch ships:", error);
        addAlert("error", "Failed to update ships from server");
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchShips();
  }, []);

  const addAlert = (
    type: Alert["type"],
    message: string,
    source: "user" | "system" = "system"
  ) => {
    setAlerts((prev) => [
      {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date(),
        source,
      },
      ...prev,
    ]);
  };

  const handleAlertSelect = async (alert: {
    id: string;
    label: string;
    type: "info" | "warning" | "error";
  }) => {
    addAlert("info", `Alert "${alert.label}" triggered successfully.`, "user");

    // Refresh triggered alerts list (optional)
    try {
      const data = await getAllTriggeredAlerts();
      const activeAlerts = data.filter(
        (alert: any) => alert.status === true || alert.status === 1
      );
      setTriggeredAlerts(activeAlerts);
      setAlertCount(activeAlerts.length);
    } catch (error) {
      console.error("Failed to refresh triggered alerts:", error);
    }
  };

  const addShip = async (shipData: {
    name: string;
    lat: number;
    lng: number;
    type: number;
  }) => {
    try {
      const newShip = await createAllShip({
        name: shipData.name,
        type: shipData.type,
        longitude: shipData.lng,
        latitude: shipData.lat,
        mission: false,
      });

      const formattedShip: ShipData = {
        id: newShip.shipid.toString(),
        name: newShip.name,
        position: { lat: newShip.latitude, lng: newShip.longitude },
        type: String(newShip.type),
        speed: 0,
        rotation_speed: 0,
      };

      setShips((prev) => [...prev, formattedShip]);
      addAlert(
        "success",
        `New ship "${formattedShip.name}" added successfully`
      );
      setActiveModal(null);
    } catch (error) {
      console.error("Failed to add ship:", error);
      addAlert("error", "Failed to add ship");
    }
  };

  const deleteShip = (id: string) => {
    const ship = ships.find((s) => s.id === id);
    setShips(ships.filter((s) => s.id !== id));
    if (ship) addAlert("error", `Ship "${ship.name}" has been removed`);
  };

  const moveShip = (id: string, lat: number, lng: number) => {
    setShips(
      ships.map((ship) =>
        ship.id === id ? { ...ship, position: { lat, lng } } : ship
      )
    );
    const ship = ships.find((s) => s.id === id);
    if (ship) addAlert("info", `Ship "${ship.name}" has been moved`);
    setActiveModal(null);
  };

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /** 🔍 Filtered Ships (Memoized) */
  const filteredShips = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return ships;
    return ships.filter((ship) => ship.name.toLowerCase().includes(q));
  }, [ships, debouncedQuery]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
          </div>
          <input
            type="text"
            placeholder="Search for ships..."
            className="w-full pl-12 pr-12 py-3 rounded-full bg-white shadow-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 🔎 Search Dropdown */}
        {debouncedQuery && (
          <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto no-scrollbar">
            {filteredShips.length > 0 ? (
              filteredShips.map((ship) => (
                <div
                  key={ship.id}
                  className="p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100 transition"
                  onClick={() => {
                    alert(`Ship selected: ${ship.name}`);
                    setSearchQuery("");
                  }}
                >
                  <p className="font-semibold text-gray-800">{ship.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {ship.type} • Speed: {ship.speed} • Rotation:{" "}
                    {ship.rotation_speed}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {ship.position.lat.toFixed(3)}, Lng:{" "}
                    {ship.position.lng.toFixed(3)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 text-sm">No ships found</div>
            )}
          </div>
        )}
      </div>

      <div className="absolute right-6 top-32 z-10 flex flex-col gap-3">
        <button
          onClick={() => setActiveModal("add")}
          className="px-6 py-3 bg-white hover:bg-blue-600 hover:text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          <Ship className="w-5 h-5" /> Add Ship
        </button>

        <button
          onClick={() => setActiveModal("delete")}
          className="px-6 py-3 bg-white hover:bg-red-600 hover:text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          <Trash2 className="w-5 h-5" /> Delete Ship
        </button>

        <button
          onClick={() => setActiveModal("moving")}
          className="px-6 py-3 bg-white hover:bg-green-600 hover:text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
        >
          <Navigation className="w-5 h-5" /> Move Ship
        </button>
      </div>

      <button
        onClick={() => setActiveModal("alert")}
        className="absolute right-6 bottom-6 z-10 px-6 py-3 bg-white hover:bg-orange-600 hover:text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
      >
        <Bell className="w-5 h-5" />
        Alerts
        {alertCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {alertCount}
          </span>
        )}
      </button>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-lg text-gray-600">
            Loading ships...
          </div>
        ) : (
          <MapView ships={filteredShips} />
        )}
      </div>

      <Modal
        isOpen={activeModal === "add"}
        onClose={() => setActiveModal(null)}
        title="Add New Ship"
      >
        <AddShipModal onAdd={addShip} />
      </Modal>

      <Modal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title="Delete Ship"
      >
        <DeleteShipModal ships={ships} onDelete={deleteShip} />
      </Modal>

      <Modal
        isOpen={activeModal === "moving"}
        onClose={() => setActiveModal(null)}
        title="Move Ship"
      >
        <MovingModal
          ships={ships}
          onMove={(id, lat, lng) => {
            setShips(
              ships.map((ship) =>
                ship.id === id ? { ...ship, position: { lat, lng } } : ship
              )
            );
            const ship = ships.find((s) => s.id === id);
            if (ship) addAlert("info", `Ship "${ship.name}" has been moved`);
          }}
          onClose={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        isOpen={activeModal === "alert"}
        onClose={() => setActiveModal(null)}
        title="Ship Alerts"
      >
        <AlertModal
          alerts={alerts}
          onSelect={handleAlertSelect}
          onAlertCountChange={(count) => setAlertCount(count)}
        />
      </Modal>
    </div>
  );
}

export default App;
