import { memo, useState, useEffect } from "react";
import { X } from "lucide-react";

interface Ship {
  name: string;
  position?: { lat: number; lng: number };
  type?: string;
  speed?: number;
  rotation_speed?: number;
}

interface ShipPopupProps {
  ship: Ship;
  map: google.maps.Map;
  onClose: () => void;
}

const ShipPopup = memo(({ ship, map, onClose }: ShipPopupProps) => {
  const [pixelPosition, setPixelPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const projection = (map as any).getProjection?.();
      if (!projection || !ship?.position) return;

      const scale = Math.pow(2, map.getZoom() || 0);
      const bounds = map.getBounds();
      if (!bounds) return;

      const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
      const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
      const worldPoint = projection.fromLatLngToPoint(
        new google.maps.LatLng(ship.position.lat, ship.position.lng)
      );
      if (!topRight || !bottomLeft || !worldPoint) return;

      const x = (worldPoint.x - bottomLeft.x) * scale;
      const y = (worldPoint.y - topRight.y) * scale;

      setPixelPosition({ x, y });
    };

    updatePosition();

    const listener = map.addListener("idle", updatePosition);
    return () => google.maps.event.removeListener(listener);
  }, [map, ship.position]);

  if (!pixelPosition || !ship) return null;

  const rotation =
    ship.rotation_speed != null
      ? `${ship.rotation_speed.toFixed(2)}/sec`
      : "N/A";

  const speed = ship.speed != null ? `${ship.speed} km/hr` : "N/A";

  const latitude =
    ship.position?.lat != null ? ship.position.lat.toFixed(3) : "N/A";
  const longitude =
    ship.position?.lng != null ? ship.position.lng.toFixed(3) : "N/A";

  return (
    <div
      style={{
        position: "absolute",
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y - 40}px`,
        transform: "translate(-50%, -100%)",
        pointerEvents: "auto",
        zIndex: 9999,
      }}
    >
      <div className="relative bg-white rounded-lg shadow-xl border border-gray-300 p-3 w-64 text-sm leading-snug">
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-semibold text-gray-900 text-base mb-2">
          {ship.name || "Unnamed Ship"}
        </h3>

        <p>
          <strong>Type:</strong> {ship.type || "Unknown"}
        </p>
        <p>
          <strong>Speed:</strong> {speed}
        </p>
        <p>
          <strong>Rotation:</strong> {rotation}
        </p>
        <p>
          <strong>Lat/Lng:</strong> {latitude}, {longitude}
        </p>

        <div className="absolute left-1/2 bottom-[-7px] transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-300"></div>
      </div>
    </div>
  );
});

ShipPopup.displayName = "ShipPopup";
export default ShipPopup;
