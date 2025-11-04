import { useState, useEffect, useRef, memo } from "react";
import { Ship as ShipIcon } from "lucide-react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import ShipPopup from "./ShipPopup";
import { getAllAllShips, AllShip } from "../services/api";

// Define Ship interface
interface Ship {
  name: string;
  position: { lat: number; lng: number };
  type: string;
  speed: number;
  rotation_speed: number;
}

const GoogleMap = memo(
  ({
    ships,
    onShipClick,
    selectedShip,
  }: {
    ships: Ship[];
    onShipClick: (ship: Ship | null) => void;
    selectedShip: Ship | null;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

    // Initialize map
    useEffect(() => {
      if (ref.current && !map) {
        const newMap = new google.maps.Map(ref.current, {
          mapTypeId: "satellite",
          zoom: 5,
          center: { lat: 15.0, lng: 78.0 },
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: 22.0, lng: 67.0 });
        bounds.extend({ lat: 8.0, lng: 99.0 });
        newMap.fitBounds(bounds);

        setMap(newMap);
      }
    }, [map]);

    // Add or update ship markers
    useEffect(() => {
      if (!map) return;

      ships.forEach((ship) => {
        const existingMarker = markersRef.current.get(ship.name);
        const markerIcon = undefined; // default red pin

        if (existingMarker) {
          existingMarker.setPosition(ship.position);
          existingMarker.setIcon(markerIcon || null);
        } else {
          const marker = new google.maps.Marker({
            position: ship.position,
            map,
            title: ship.name,
            icon: markerIcon,
          });

          marker.addListener("click", () => {
            onShipClick(ship);
          });

          markersRef.current.set(ship.name, marker);
        }
      });

      // Remove old markers
      markersRef.current.forEach((marker, name) => {
        if (!ships.find((s) => s.name === name)) {
          marker.setMap(null);
          markersRef.current.delete(name);
        }
      });
    }, [ships, map, onShipClick]);

    return (
      <div className="relative w-full h-full" ref={ref}>
        {map && selectedShip && (
          <ShipPopup
            ship={selectedShip}
            map={map}
            onClose={() => onShipClick(null)}
          />
        )}
      </div>
    );
  }
);

GoogleMap.displayName = "GoogleMap";

const MapFallback = ({ status }: { status: Status }) => {
  if (status === Status.LOADING)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading map...
      </div>
    );
  if (status === Status.FAILURE)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Failed to load map
      </div>
    );
  return null;
};

const MapView = memo(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ship data
  useEffect(() => {
    const fetchShips = async () => {
      try {
        const data: AllShip[] = await getAllAllShips();

        const formattedShips: Ship[] = data.map((ship) => ({
          name: ship.name,
          type: ship.ship_info?.name || "Unknown", // ✅ "Aircraft Carrier"
          position: { lat: ship.latitude, lng: ship.longitude },
          speed: ship.ship_info?.speed,
          rotation_speed: ship.ship_info?.rotation_speed,
        }));

        setShips(formattedShips);
      } catch (error) {
        console.error("Error fetching ships:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShips();

    const interval = setInterval(fetchShips, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading ships...
      </div>
    );

  return (
    <div className="w-full h-full relative">
      {apiKey ? (
        <Wrapper
          apiKey={apiKey}
          render={(status) => <MapFallback status={status} />}
        >
          <GoogleMap
            ships={ships}
            onShipClick={setSelectedShip}
            selectedShip={selectedShip}
          />
        </Wrapper>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full bg-blue-50">
          <ShipIcon className="w-20 h-20 text-blue-600 mx-auto animate-bounce" />
          <h1 className="text-5xl font-bold text-gray-800">Fleet Overview</h1>
          <p className="mt-4 text-gray-600">
            Google Maps API Key not configured.
          </p>
        </div>
      )}
    </div>
  );
});

MapView.displayName = "MapView";
export default MapView;
