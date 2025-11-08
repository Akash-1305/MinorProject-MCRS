// services/api.ts
const BASE_URL = "http://localhost:8000";

/* ---------- Interfaces ---------- */
export interface ShipInfo {
  name: string;
  speed: number;
  rotation_speed: number;
  humanalert: number;
  attack: number;
  robery: number;
  struck: number;
  resource: number;
  ubts: number;
  time: number;
  climate: number;
  id: number;
}

export interface AllShip {
  shipid: number;
  name: string;
  type: number;
  longitude: number;
  latitude: number;
  mission: boolean;
  ship_info: ShipInfo;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  message: string;
}

export interface LocationsResponse {
  locations: { latitude: number; longitude: number }[];
  count: number;
  message: string;
}

export interface AlertType {
  alert_id: string;
  name: string;
  human_error: number;
  attack: number;
  weater: number;
}

export interface TriggerAlertRequest {
  alert_id: string;
  latitude: number;
  longitude: number;
  climate_condition: number;
}

export interface TriggerAlertResponse {
  alert_type: string;
  best_ship: string;
  final_score: number;
}

export interface AlertResultBase {
  id?: number;
  alert_type: string;
  best_ship: string;
  final_score: number;
  timestamp: string;
}

/* ---------- Ships ---------- */
export const getAllShips = async (): Promise<ShipInfo[]> => {
  const response = await fetch(`${BASE_URL}/ships`);
  if (!response.ok) throw new Error("Failed to fetch ships");
  return response.json();
};

export const getShipById = async (shipId: number): Promise<ShipInfo> => {
  const response = await fetch(`${BASE_URL}/ships/${shipId}`);
  if (!response.ok) throw new Error(`Failed to fetch ship with id ${shipId}`);
  return response.json();
};

export const getAllAllShips = async (): Promise<AllShip[]> => {
  const response = await fetch(`${BASE_URL}/allships`);
  if (!response.ok) throw new Error("Failed to fetch all ships");
  return response.json();
};

export const getAllShipById = async (allShipId: number): Promise<AllShip> => {
  const response = await fetch(`${BASE_URL}/allships/${allShipId}`);
  if (!response.ok)
    throw new Error(`Failed to fetch allship with id ${allShipId}`);
  return response.json();
};

export const createAllShip = async (
  data: Omit<AllShip, "shipid" | "ship_info">
): Promise<Omit<AllShip, "ship_info">> => {
  const response = await fetch(`${BASE_URL}/addships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create allship");
  return response.json();
};

/* ---------- Locations ---------- */
export const generateRandomLocation = async (): Promise<LocationResponse> => {
  const response = await fetch(`${BASE_URL}/generate-location`);
  if (!response.ok) throw new Error("Failed to generate random location");
  return response.json();
};

export const generateMultipleRandomLocations = async (
  count?: number
): Promise<LocationsResponse> => {
  const url = count
    ? `${BASE_URL}/generate-locations?count=${count}`
    : `${BASE_URL}/generate-locations`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("Failed to generate multiple random locations");
  return response.json();
};

/* ---------- Alerts ---------- */
export const getAllAlerts = async (): Promise<AlertType[]> => {
  const response = await fetch(`${BASE_URL}/alerts`);
  if (!response.ok) throw new Error("Failed to fetch alerts");
  return response.json();
};

/* ---------- Alert Trigger & Results ---------- */
export const triggerAlert = async (
  data: TriggerAlertRequest
): Promise<TriggerAlertResponse> => {
  const response = await fetch(`${BASE_URL}/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to trigger alert");
  return response.json();
};

export const getAllTriggeredAlerts = async (): Promise<AlertResultBase[]> => {
  const response = await fetch(`${BASE_URL}/alert-results`);
  if (!response.ok) throw new Error("Failed to fetch alert results");
  return response.json();
};
