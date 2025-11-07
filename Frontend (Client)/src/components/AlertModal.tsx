import React, { useState, useEffect } from "react";
import {
  getAllAlerts,
  AlertType,
} from "../services/api";

interface AlertOption {
  id: string;
  label: string;
  type: "info" | "warning" | "error";
}

interface AlertModalProps {
  alerts?: {
    id: string;
    type: "info" | "success" | "warning" | "error";
    message: string;
    timestamp: Date;
    source: "user" | "system";
  }[];
  onSelect: (alert: AlertOption) => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alerts, onSelect }) => {
  const [viewMode, setViewMode] = useState<"select" | "view">("select");
  const [alertOptions, setAlertOptions] = useState<AlertType[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggerAlertRequest[]>(
    []
  );
  const [selectedAlert, setSelectedAlert] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [climate, setClimate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------- Fetch All Alerts ---------- */
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAllAlerts();
        setAlertOptions(data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to fetch alert options");
      }
    };
    fetchAlerts();
  }, []);

  /* ---------- Fetch Triggered Alerts ---------- */
  useEffect(() => {
    if (viewMode === "view") {
      const fetchTriggered = async () => {
        try {
          const data = await getAllTriggeredAlerts();
          setTriggeredAlerts(data);
        } catch (err) {
          console.error("Error fetching triggered alerts:", err);
          setError("Failed to fetch triggered alerts");
        }
      };
      fetchTriggered();
    }
  }, [viewMode]);

  /* ---------- Trigger New Alert ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedAlert || !lat || !lng || !climate) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const alertData: TriggerAlertRequest = {
        alert_id: selectedAlert,
        name:
          alertOptions.find((a) => a.alert_id === selectedAlert)?.name ||
          "Unknown Alert",
        target_x: parseFloat(lat),
        target_y: parseFloat(lng),
        climate_condition: parseInt(climate, 10),
        status: true,
      };

      const response = await triggerAlert(alertData);
      setSuccessMsg(response.message);

      onSelect({
        id: selectedAlert,
        label: alertData.name,
        type: "info",
      });

      setSelectedAlert("");
      setLat("");
      setLng("");
      setClimate("");
    } catch (err) {
      console.error(err);
      setError("Failed to trigger alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Helpers ---------- */
  const getClimateLabel = (code: number) => {
    switch (code) {
      case 1:
        return "Tufan";
      case 2:
        return "High Waves";
      case 3:
        return "Clean";
      default:
        return "Unknown";
    }
  };

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

      {/* Trigger New Alert */}
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
                <option key={a.alert_id} value={a.alert_id}>
                  {a.name ?? a.alert_id}
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

          {/* Climate */}
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

          {/* Status Messages */}
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {successMsg && (
            <p className="text-green-600 text-sm mb-3">{successMsg}</p>
          )}

          {/* Submit */}
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

      {/* View Alerts */}
      {viewMode === "view" && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
            Alert History
          </h2>

          {triggeredAlerts.length === 0 && (!alerts || alerts.length === 0) ? (
            <p className="text-gray-500 text-center">
              No alerts triggered yet.
            </p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {triggeredAlerts.map((alert) => (
                <li
                  key={alert.alert_id}
                  className="p-3 rounded-lg border border-blue-300 bg-blue-50 shadow-sm"
                >
                  <div className="font-semibold text-gray-800">
                    {alert.name} ({alert.alert_id})
                  </div>
                  <div className="text-sm text-gray-600">
                    Climate: {getClimateLabel(alert.climate_condition)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Coordinates: ({alert.target_x}, {alert.target_y})
                  </div>
                  <div
                    className={`mt-1 text-xs font-medium ${
                      alert.status ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {alert.status ? "Active" : "Inactive"}
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
