import math
from typing import List, Optional


class AlertType:
    """
    Alert type with numeric weights for human_error, attack, and weather.
    """
    def __init__(self, name: str, human_error: float, attack: float, weather: float):
        self.name = name
        self.human_error = human_error
        self.attack = attack
        self.weather = weather


class ShipData:
    """
    Ship object used for alert calculation.
    Can be initialized from a dict (Pydantic/ORM) or directly.
    """
    def __init__(self, data):
        if isinstance(data, dict):
            self.id = data.get("shipid") or data.get("id")
            self.name = data.get("name")
            self.lat = float(data.get("latitude") or data.get("lat") or 0.0)
            self.lon = float(data.get("longitude") or data.get("lon") or 0.0)
            self.mission = bool(data.get("mission", False))  # ✅ include mission flag

            ship_info = data.get("ship_info") or {}
            self.ship_name = ship_info.get("name")
            self.speed = float(ship_info.get("speed", 0.0))
            self.humanalert = float(ship_info.get("humanalert", 0.0))
            self.attack = float(ship_info.get("attack", 0.0))
            self.robery = float(ship_info.get("robery", 0.0))
            self.struck = float(ship_info.get("struck", 0.0))
            self.resource = float(ship_info.get("resource", 0.0))
            self.climate = float(ship_info.get("climate", 0.0))
        else:
            # Assume already has attributes (ORM object)
            self.id = getattr(data, "id", None)
            self.name = getattr(data, "name", "")
            self.lat = float(getattr(data, "lat", 0.0))
            self.lon = float(getattr(data, "lon", 0.0))
            self.mission = bool(getattr(data, "mission", False))
            self.ship_name = getattr(data, "ship_name", "")
            self.speed = float(getattr(data, "speed", 0.0))
            self.humanalert = float(getattr(data, "humanalert", 0.0))
            self.attack = float(getattr(data, "attack", 0.0))
            self.robery = float(getattr(data, "robery", 0.0))
            self.struck = float(getattr(data, "struck", 0.0))
            self.resource = float(getattr(data, "resource", 0.0))
            self.climate = float(getattr(data, "climate", 0.0))


class Result:
    """
    Result object representing the computed score and metrics for a ship.
    """
    def __init__(self, ship_id: int, name: str, type_: str, distance: float, speed: float, time: float,
                 T_value: float, alert_score: float, climate_score: float, Final_score: float):
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


def to_radians(degree: float) -> float:
    return degree * math.pi / 180.0


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Haversine formula to calculate distance between two points in km.
    """
    R = 6371.0  # Earth radius in km
    dLat = to_radians(lat2 - lat1)
    dLon = to_radians(lon2 - lon1)
    lat1 = to_radians(lat1)
    lat2 = to_radians(lat2)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(lat1) * math.cos(lat2) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def process_alert(alert: AlertType, target_lat: float, target_lon: float,
                  climate_choice: float, ships_data: List) -> Optional[Result]:
    """
    Process a list of ships and calculate the best ship based on alert, distance, speed, and climate.
    Ships with mission=True are automatically skipped.
    """
    results: List[Result] = []
    times: List[float] = []

    # Convert all ships to ShipData objects
    ships = [ShipData(s) for s in ships_data]

    for s in ships:
        # 🚫 Skip ships currently on a mission
        if getattr(s, "mission", False):
            continue

        dist = calculate_distance(s.lat, s.lon, target_lat, target_lon)
        time = dist / max(s.speed, 0.1)  # avoid division by zero

        # Weighted alert scoring
        alert_score = (
            pow(alert.human_error, s.humanalert or 0.1) +
            pow(alert.attack, s.attack or 0.1) +
            pow(alert.weather, s.climate or 0.1)
        )

        climate_score = pow(climate_choice, s.climate or 0.1)

        result = Result(
            ship_id=s.id,
            name=s.name,
            type_=s.ship_name,
            distance=dist,
            speed=s.speed,
            time=time,
            T_value=0.0,
            alert_score=alert_score,
            climate_score=climate_score,
            Final_score=0.0,
        )
        results.append(result)
        times.append(time)

    if not results:
        return None
        
    max_time = max(times)
    for r in results:
        r.T_value = max_time - r.time
        r.Final_score = pow(r.alert_score, 0.4) + pow(r.T_value, 0.3) + r.climate_score

    # Return best scoring ship
    best_ship = max(results, key=lambda r: r.Final_score)
    return best_ship
