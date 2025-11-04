import { generateMultipleRandomLocations } from "../services/api";

interface RandomShip {
  name: string;
  position: { lat: number; lng: number };
  type: string;
  speed: number;
  rotation_speed: number;
  cargo?: {
    type: string;
    weight: number;
    destination: string;
  };
}

const shipNames = [
  "Cargo Pioneer",
  "Ocean Voyager",
  "Maritime Star",
  "Sea Express",
  "Global Carrier",
  "Pacific Runner",
  "Atlantic Trader",
  "Coastal Venture",
];

const cargoTypes = [
  "Containers",
  "Bulk Cargo",
  "Oil",
  "LNG",
  "Vehicles",
  "General Cargo",
];

const ports = [
  "Mumbai Port",
  "Chennai Port",
  "Kolkata Port",
  "Visakhapatnam Port",
  "Cochin Port",
];

/**
 * Fetch random oceanic coordinates from the backend and assign ships to them.
 */
export async function generateRandomShips(
  count: number
): Promise<RandomShip[]> {
  try {
    // ✅ Fetch random ocean coordinates from FastAPI backend
    const { locations } = await generateMultipleRandomLocations(count);

    // Map locations to random ship data
    const ships: RandomShip[] = locations.map((loc, index) => ({
      name: shipNames[Math.floor(Math.random() * shipNames.length)],
      position: { lat: loc.latitude, lng: loc.longitude },
      type: Math.random() > 0.5 ? "Cargo Ship" : "Container Ship",
      speed: Math.floor(Math.random() * 20) + 5, // 5–25 knots
      rotation_speed: Math.random() * 2, // 0–2 deg/min
      cargo: {
        type: cargoTypes[Math.floor(Math.random() * cargoTypes.length)],
        weight: Math.floor(Math.random() * 50000) + 10000, // 10k–60k tons
        destination: ports[Math.floor(Math.random() * ports.length)],
      },
    }));

    return ships;
  } catch (error) {
    console.error("Error generating ships:", error);
    return [];
  }
}
