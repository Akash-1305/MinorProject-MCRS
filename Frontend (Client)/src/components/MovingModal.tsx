interface Ship {
  id: string;
  name: string;
}

interface MovingModalProps {
  ships: Ship[];
  onMove: (id: string, lat: number, lng: number) => void;
}

export default function MovingModal({ ships, onMove }: MovingModalProps) {
  const handleMove = (id: string) => {
    const lat = prompt('Enter new latitude:');
    const lng = prompt('Enter new longitude:');

    if (lat && lng) {
      onMove(id, parseFloat(lat), parseFloat(lng));
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
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <span className="font-medium text-gray-800">{ship.name}</span>
              <button
                onClick={() => handleMove(ship.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Move
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
