import React, { useState, useEffect } from "react";
import {
  getAllAlerts,
  getAllTriggeredAlerts,
  triggerAlert,
  TriggerAlertRequest,
  TriggerAlertResponse,
  AlertResultBase,
} from "../services/api";

interface AlertOption {
  name: string;
}

interface AlertModalProps {
  alerts?: AlertResultBase[];
  onSelect: (alert: { id: string; label: string; type: "info" }) => void;
  onAlertCountChange?: (count: number) => void; // For badge update in parent
}

const AlertModal: React.FC<AlertModalProps> = ({
  alerts,
  onSelect,
  onAlertCountChange,
}) => {
  const [viewMode, setViewMode] = useState<"select" | "view">("select");
  const [alertOptions, setAlertOptions] = useState<AlertOption[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<AlertResultBase[]>([]);
  const [selectedAlert, setSelectedAlert] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [climate, setClimate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all available alert types
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAllAlerts();
        setAlertOptions(data.map((a) => ({ name: a.name })));
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to fetch alert options.");
      }
    };
    fetchAlerts();
  }, []);

  // Fetch triggered alerts only when "View Alerts" tab is active
  useEffect(() => {
    if (viewMode === "view") {
      const fetchTriggered = async () => {
        try {
          const data = await getAllTriggeredAlerts();

          // Only include alerts where status is true or 1
          const activeAlerts = data.filter(
            (alert: any) => alert.status === true || alert.status === 1
          );

          setTriggeredAlerts(activeAlerts);

          // Notify parent (for badge)
          if (onAlertCountChange) {
            onAlertCountChange(activeAlerts.length);
          }
        } catch (err) {
          console.error("Error fetching triggered alerts:", err);
          setError("Failed to fetch triggered alerts.");
        }
      };
      fetchTriggered();
    }
  }, [viewMode, onAlertCountChange]);

  // Trigger a new alert
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // ✅ prevents double submission

    setError(null);
    setSuccessMsg(null);

    if (!selectedAlert || !lat || !lng || !climate) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const alertData: TriggerAlertRequest = {
        alert_type: selectedAlert,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        climate_condition: parseInt(climate, 10),
      };

      const response: TriggerAlertResponse = await triggerAlert(alertData);

      setSuccessMsg(`Alert "${response.alert_type}" triggered successfully!`);
      onSelect({ id: selectedAlert, label: response.alert_type, type: "info" });

      // reset form
      setSelectedAlert("");
      setLat("");
      setLng("");
      setClimate("");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        "Failed to trigger alert. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Mode Toggle */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setViewMode("select")}
          className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all ${
            viewMode === "select"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Trigger Alert
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

      {/* --- TRIGGER ALERT --- */}
      {viewMode === "select" && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
            Trigger New Alert
          </h2>

          {/* Alert Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Alert Type
            </label>
            <select
              value={selectedAlert}
              onChange={(e) => setSelectedAlert(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option hidden value="">
                Select Alert Type
              </option>
              {alertOptions.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Latitude */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Enter latitude"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Longitude */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Enter longitude"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Climate Condition */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Climate Condition
            </label>
            <select
              value={climate}
              onChange={(e) => setClimate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option hidden value="">
                Select Condition
              </option>
              <option value="1">Tufan</option>
              <option value="2">High Waves</option>
              <option value="3">Clean</option>
            </select>
          </div>

          {/* Error & Success Messages */}
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {successMsg && (
            <p className="text-green-600 text-sm mb-3">{successMsg}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Triggering..." : "Trigger Alert"}
          </button>
        </form>
      )}

      {/* --- VIEW ALERTS --- */}
      {viewMode === "view" && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
            Active Alerts
          </h2>
          {triggeredAlerts.length === 0 ? (
            <p className="text-gray-500 text-center">
              No active alerts currently.
            </p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {triggeredAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="p-3 rounded-lg border border-blue-300 bg-blue-50 shadow-sm"
                >
                  <div className="font-semibold text-gray-800">
                    {alert.alert_type}
                  </div>
                  <div className="text-sm text-gray-600">
                    Allotted Ship: {alert.best_ship}
                  </div>
                  <div className="text-sm text-gray-600">
                    Distance: {alert.distance_km.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Est_Time: {alert.estimated_time_hr}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
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
