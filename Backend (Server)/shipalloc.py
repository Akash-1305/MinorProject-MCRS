import math
from typing import List, Optional


# ------------------ DATA STRUCTURES ------------------
class AlertType:
    def __init__(self, name: str, human_error: float, attack: float, weather: float, robbery: float, resource: float, struck: float):
        self.name = name
        self.human_error = human_error
        self.attack = attack
        self.weather = weather
        self.robbery = robbery
        self.resource = resource
        self.struck = struck



class ShipData:
    def __init__(self, data):
        if isinstance(data, dict):
            self.id = data.get("shipid") or data.get("id")
            self.name = data.get("name")
            self.lat = float(data.get("latitude") or data.get("lat") or 0.0)
            self.lon = float(data.get("longitude") or data.get("lon") or 0.0)
            self.mission = bool(data.get("mission", False))

            ship_info = data.get("ship_info") or {}
            self.ship_name = ship_info.get("name")
            self.speed = float(ship_info.get("speed", 0.0))
            self.humanalert = float(ship_info.get("humanalert", 0.0))
            self.attack = float(ship_info.get("attack", 0.0))
            self.robery = float(ship_info.get("robery", 0.0))
            self.struck = float(ship_info.get("struck", 0.0))
            self.resource = float(ship_info.get("resource", 0.0))
            self.climate = float(ship_info.get("climate", 0.0))


class Result:
    def __init__(
        self,
        ship_id: int,
        name: str,
        type_: str,
        distance: float,
        speed: float,
        time: float,
        T_value: float,
        alert_score: float,
        climate_score: float,
        Final_score: float
    ):
        self.ship_id = ship_id
        self.name = name
        self.type = type_
        self.distance = distance
        self.speed = speed
        self.time = time
        self.T_value = T_value
        self.alert_score = alert_score
        self.climate_score = climate_score
        self.Final_score = Final_score


# ------------------ HELPER FUNCTIONS ------------------
def to_radians(degree: float) -> float:
    return degree * math.pi / 180.0


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula – returns distance in km"""
    R = 6371.0
    d_lat = to_radians(lat2 - lat1)
    d_lon = to_radians(lon2 - lon1)
    lat1 = to_radians(lat1)
    lat2 = to_radians(lat2)

    a = math.sin(d_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(d_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# ------------------ MAIN PROCESS FUNCTION ------------------
def process_alert(
    alert: AlertType,
    target_lat: float,
    target_lon: float,
    climate_choice: float,
    ships_data: List[dict],
) -> Optional[Result]:
    ships = [ShipData(s) for s in ships_data]
    results: List[Result] = []

    for s in ships:
        if s.mission:
            continue  # Skip ships already on a mission

        dist = calculate_distance(s.lat, s.lon, target_lat, target_lon)
        time_hours = dist / max(s.speed, 1.0)  # Avoid divide by zero

        # Normalize alert score (weighted sum)
        alert_score = (
            alert.human_error * s.humanalert +
            alert.attack * s.attack +
            alert.weather * s.climate +
            alert.robbery * s.robery +
            alert.resource * s.resource +
            alert.struck * s.struck
        ) / 5.0  # normalize average

        climate_score = climate_choice * s.climate

        results.append(Result(
            ship_id=s.id,
            name=s.name,
            type_=s.ship_name,
            distance=dist,
            speed=s.speed,
            time=time_hours,
            T_value=0.0,
            alert_score=alert_score,
            climate_score=climate_score,
            Final_score=0.0
        ))

    # No available ships
    if not results:
        return None

    # Normalize time factor — higher T_value = faster ship
    max_time = max(r.time for r in results)
    min_time = min(r.time for r in results)
    time_range = max(max_time - min_time, 1e-6)

    for r in results:
        r.T_value = (max_time - r.time) / time_range  # normalized 0–1 scale
        # Weighted scoring system
        r.Final_score = (r.alert_score * 0.4) + (r.T_value * 0.3) + (r.climate_score * 0.3)

    # Select the best ship based on highest final score
    best_ship = max(results, key=lambda r: r.Final_score)
    return best_ship
