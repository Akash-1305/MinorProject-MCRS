import React, { useState } from "react";

interface AlertOption {
  id: string;
  label: string;
  type: "info" | "warning" | "error";
}

interface AlertModalProps {
  onSelect: (alert: AlertOption) => void;
  alerts: {
    id: string;
    type: "info" | "success" | "warning" | "error";
    message: string;
    timestamp: Date;
    source: "user" | "system";
  }[];
}

const ALERT_OPTIONS: AlertOption[] = [
  { id: "drawn", label: "Ship Drawn", type: "error" },
  { id: "accident", label: "Ship Accident", type: "error" },
  { id: "struck", label: "Ship Struck", type: "error" },
  { id: "shortage", label: "Shortage of Resources", type: "warning" },
  { id: "attack", label: "Ship Attack", type: "error" },
  { id: "hijack", label: "Ship Hijack", type: "error" },
  { id: "navy", label: "Navy Attack", type: "error" },
  { id: "engine", label: "Engine Breakdown", type: "warning" },
];

const AlertModal: React.FC<AlertModalProps> = ({ onSelect, alerts }) => {
  const [viewMode, setViewMode] = useState<"select" | "view">("select");
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (alert: AlertOption) => {
    setSelected(alert.id);
    onSelect(alert);
  };

  const userAlerts = alerts.filter((a) => a.source === "user");

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setViewMode("select")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all ${
            viewMode === "select"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Select Alert
        </button>
        <button
          onClick={() => setViewMode("view")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all ${
            viewMode === "view"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          View Alerts
        </button>
      </div>

      {/* Select Alert Section */}
      {viewMode === "select" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
            Choose an Alert Type
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {ALERT_OPTIONS.map((alert) => (
              <button
                key={alert.id}
                onClick={() => handleSelect(alert)}
                className={`px-4 py-3 rounded-lg shadow-md border transition-all duration-300 text-left font-medium
                  ${
                    selected === alert.id
                      ? "bg-blue-600 text-white border-blue-600 scale-105"
                      : "bg-white hover:bg-gray-100 text-gray-800 border-gray-200"
                  }`}
              >
                {alert.label}
              </button>
            ))}
          </div>

          {selected && (
            <p className="mt-4 text-sm text-green-600 font-medium text-center">
              Alert “{ALERT_OPTIONS.find((a) => a.id === selected)?.label}”
              triggered!
            </p>
          )}
        </div>
      )}

      {/* View Alerts Section */}
      {viewMode === "view" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
            Alert History
          </h2>
          {userAlerts.length === 0 ? (
            <p className="text-gray-500 text-center">
              No alerts triggered yet.
            </p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {userAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className={`p-3 rounded-lg border shadow-sm ${
                    alert.type === "error"
                      ? "border-red-400 bg-red-50"
                      : alert.type === "warning"
                      ? "border-yellow-400 bg-yellow-50"
                      : alert.type === "info"
                      ? "border-blue-400 bg-blue-50"
                      : "border-green-400 bg-green-50"
                  }`}
                >
                  <div className="font-medium text-gray-800">
                    {alert.message}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertModal;
