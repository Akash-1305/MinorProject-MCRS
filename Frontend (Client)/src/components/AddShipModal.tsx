import { useState, useEffect } from 'react';
import { Ship } from 'lucide-react';
import { getAllShips, ShipInfo } from '../services/api';

interface AddShipModalProps {
  onAdd: (ship: { name: string; lat: number; lng: number; type: number }) => void;
}

export default function AddShipModal({ onAdd }: AddShipModalProps) {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [type, setType] = useState<number | ''>('');
  const [shipTypes, setShipTypes] = useState<ShipInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available ship types
  useEffect(() => {
    const fetchShipTypes = async () => {
      try {
        const ships = await getAllShips();
        setShipTypes(ships);
      } catch (err) {
        console.error('Failed to fetch ship types:', err);
        setError('Failed to load ship types');
      } finally {
        setLoading(false);
      }
    };

    fetchShipTypes();
  }, []);

  // Handle adding new ship
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lat || !lng || type === '') {
      setError('Please fill in all fields');
      return;
    }

    onAdd({
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      type: Number(type),
    });

    // Reset form
    setName('');
    setLat('');
    setLng('');
    setType('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ship Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ship Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          placeholder="Enter ship name"
          required
        />
      </div>

      {/* Ship Type Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ship Type
        </label>
        {loading ? (
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
            Loading ship types...
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <select
            value={type}
            onChange={(e) => setType(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          >
            <option hidden value="">Select a ship type</option>
            {shipTypes.map((ship) => (
              <option key={ship.id} value={ship.id}>
                {ship.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Latitude / Longitude Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="25.276"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="55.296"
            required
          />
        </div>
      </div>

      {/* Error Message */}
      {error && !loading && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Ship className="w-5 h-5" />
        {loading ? 'Loading...' : 'Add Ship'}
      </button>
    </form>
  );
}
