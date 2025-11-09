import math
import time

# Convert degrees to radians
def to_radians(degree: float) -> float:
    return degree * math.pi / 180.0


# Convert radians to degrees (optional)
def to_degrees(radian: float) -> float:
    return radian * 180.0 / math.pi


# Haversine formula — returns distance in km
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points (in km)."""
    R = 6371.0  # Earth radius in km

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


# Estimate travel time (in hours)
def estimate_travel_time(distance_km: float, speed_kmh: float) -> float:
    """Return travel time in hours."""
    if speed_kmh <= 0:
        return float("inf")
    return distance_km / speed_kmh


# Generate intermediate positions between two points
def get_updated_positions(
    lat1: float, lon1: float, lat2: float, lon2: float, speed_kmh: float
):
    """
    Returns list of (lat, lon) positions per hour (simulation).
    Each position is 1 hour apart, assuming constant speed.
    """

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


# In distance_calc.py
def simulate_movement(lat1, lon1, lat2, lon2, speed_kmh):
    """
    Simulate movement by returning intermediate positions as a message string.
    """
    positions = get_updated_positions(lat1, lon1, lat2, lon2, speed_kmh)
    message_lines = []

    for i, (lat, lon) in enumerate(positions):
        message_lines.append(f"Hour {i}: Latitude={lat:.6f}, Longitude={lon:.6f}")

    message_lines.append("Reached destination successfully! ✅")
    return "\n".join(message_lines)

