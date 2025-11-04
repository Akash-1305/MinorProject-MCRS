import { useState, useEffect } from "react";
import {
  Ship,
  Trash2,
  Navigation,
  Bell,
  Search,
} from "lucide-react";
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
  createAlert,
} from "./services/api";
import { generateRandomShips } from "./utils/generateShips";

// Ship data structure (must match MapView)
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

  // 🧭 Fetch ships and alerts from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allShips, allAlerts] = await Promise.all([
          getAllAllShips(),
          getAllAlerts(),
        ]);

        // Format ships
        const formattedShips: ShipData[] = allShips.map((ship) => ({
          id: ship.shipid.toString(),
          name: ship.name,
          position: { lat: ship.latitude, lng: ship.longitude },
          type: String(ship.type),
          speed: ship.ship_info.speed,
          rotation_speed: ship.ship_info.rotation_speed,
        }));

        setShips(formattedShips);

        // Format alerts from backend
        const formattedAlerts: Alert[] = allAlerts.map((a) => ({
          id: a.id?.toString() || Math.random().toString(),
          type:
            a.type === "warning"
              ? "warning"
              : a.type === "error"
              ? "error"
              : a.type === "info"
              ? "info"
              : "success",
          message: a.type,
          timestamp: new Date(),
          source: "user",
        }));

        setAlerts(formattedAlerts);
      } catch (error) {
        console.error("Failed to fetch ships or alerts:", error);
        addAlert("error", "Failed to load ships or alerts from server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🛟 Utility: Add alert locally
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

  // 🧾 Handle user-triggered alert selection → Save to backend + show in UI
  const handleAlertSelect = async (alert: {
    id: string;
    label: string;
    type: "info" | "warning" | "error";
  }) => {
    try {
      // Save to backend
      await createAlert({ type: alert.label });

      // Add to local state
      addAlert(alert.type, alert.label, "user");
    } catch (error) {
      console.error("Failed to create alert:", error);
      addAlert("error", "Failed to create alert", "system");
    }
  };

  // ➕ Add new ship
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
      addAlert("success", `New ship "${formattedShip.name}" added successfully`);
      setActiveModal(null);
    } catch (error) {
      console.error("Failed to add ship:", error);
      addAlert("error", "Failed to add ship");
    }
  };

  // ❌ Delete ship
  const deleteShip = (id: string) => {
    const ship = ships.find((s) => s.id === id);
    setShips(ships.filter((s) => s.id !== id));
    if (ship) addAlert("error", `Ship "${ship.name}" has been removed`);
  };

  // 🚀 Move ship
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

  // 🌀 Generate random ships (for simulation)
  const generateRandomShipsData = async () => {
    try {
      const randomShips = await generateRandomShips(5);
      const formattedShips: ShipData[] = randomShips.map((ship, index) => ({
        id: `random-${Date.now()}-${index}`,
        name: ship.name,
        position: ship.position,
        type: ship.type,
        speed: ship.speed,
        rotation_speed: ship.rotation_speed,
      }));

      setShips((prev) => [...prev, ...formattedShips]);
      addAlert("info", `Added ${formattedShips.length} random ships`);
    } catch (error) {
      console.error("Failed to generate random ships:", error);
      addAlert("error", "Failed to generate random ships");
    }
  };

  // 🔍 Filter ships by name
  const filteredShips = ships.filter((ship) =>
    ship.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* 🔎 Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ships by name..."
            className="w-full pl-12 pr-12 py-3 rounded-full bg-white shadow-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>
      </div>

      {/* 🚢 Action Buttons (Right side) */}
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

      {/* 🔔 Alert Button */}
      <button
        onClick={() => setActiveModal("alert")}
        className="absolute right-6 bottom-6 z-10 px-6 py-3 bg-white hover:bg-orange-600 hover:text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
      >
        <Bell className="w-5 h-5" />
        Alerts
        {alerts.filter((a) => a.source === "user").length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {alerts.filter((a) => a.source === "user").length}
          </span>
        )}
      </button>

      {/* 🗺️ Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-lg text-gray-600">
            Loading ships...
          </div>
        ) : (
          <MapView ships={filteredShips} />
        )}
      </div>

      {/* 🧩 Modals */}
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
        <MovingModal ships={ships} onMove={moveShip} />
      </Modal>

      <Modal
        isOpen={activeModal === "alert"}
        onClose={() => setActiveModal(null)}
        title="Ship Alerts"
      >
        <AlertModal alerts={alerts} onSelect={handleAlertSelect} />
      </Modal>
    </div>
  );
}

export default App;
