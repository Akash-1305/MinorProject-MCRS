import math
import time

def to_radians(degree: float) -> float:
    return degree * math.pi / 180.0


def to_degrees(radian: float) -> float:
    return radian * 180.0 / math.pi


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0

    lat1 = to_radians(lat1)
    lon1 = to_radians(lon1)
    lat2 = to_radians(lat2)
    lon2 = to_radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def estimate_travel_time(distance_km: float, speed_kmh: float) -> float:
    if speed_kmh <= 0:
        return float("inf")
    return distance_km / speed_kmh


def get_updated_positions(
    lat1: float, lon1: float, lat2: float, lon2: float, speed_kmh: float
):

    distance = haversine(lat1, lon1, lat2, lon2)
    total_time_hours = estimate_travel_time(distance, speed_kmh)

    updated_positions = []
    h = 0
    while h <= math.ceil(total_time_hours):
        fraction = h / total_time_hours if total_time_hours > 0 else 1.0
        fraction = min(fraction, 1.0)

        curr_lat = lat1 + fraction * (lat2 - lat1)
        curr_lon = lon1 + fraction * (lon2 - lon1)

        updated_positions.append((curr_lat, curr_lon))
        h += 1

    return updated_positions


def simulate_movement(lat1, lon1, lat2, lon2, speed_kmh):
    positions = get_updated_positions(lat1, lon1, lat2, lon2, speed_kmh)
    message_lines = []

    for i, (lat, lon) in enumerate(positions):
        message_lines.append(f"Hour {i}: Latitude={lat:.3f}, Longitude={lon:.3f}")

    message_lines.append("Reached destination successfully!")
    return "\n".join(message_lines)

