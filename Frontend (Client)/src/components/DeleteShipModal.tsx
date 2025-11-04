interface Ship {
  id: string;
  name: string;
}

interface DeleteShipModalProps {
  ships: Ship[];
  onDelete: (id: string) => void;
}

export default function DeleteShipModal({ ships, onDelete }: DeleteShipModalProps) {
  return (
    <div className="space-y-4">
      {ships.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No ships to delete</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ships.map((ship) => (
            <div
              key={ship.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
            >
              <span className="font-medium text-gray-800">{ship.name}</span>
              <button
                onClick={() => onDelete(ship.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
