import random
from typing import Tuple, List, TypedDict, Dict

# Define coordinate precision
COORDINATE_PRECISION = 6

class OceanZone(TypedDict):
    """Definition of an ocean zone's coordinate boundaries"""
    min_lat: float
    max_lat: float
    min_lon: float
    max_lon: float

# Define bounding boxes (approximate ocean zones near India)
OCEAN_ZONES: List[OceanZone] = [
    # Arabian Sea (west coast of India)
    {"min_lat": 7.0, "max_lat": 23.5, "min_lon": 66.5, "max_lon": 76.5,},
    
    # Bay of Bengal (east coast of India)
    {"min_lat": 6.0, "max_lat": 22.5, "min_lon": 80.0, "max_lon": 92.5,},

    # Lakshadweep area (southwest)
    {"min_lat": 8.0, "max_lat": 13.5, "min_lon": 70.0, "max_lon": 74.5,},

    # Andaman & Nicobar Islands region (southeast)
    {"min_lat": 5.0, "max_lat": 14.5, "min_lon": 91.0, "max_lon": 94.5,},

    # Southern Indian Ocean zone (below Tamil Nadu & Kerala)
    {"min_lat": 1.0, "max_lat": 7.0, "min_lon": 75.0, "max_lon": 90.0,},
]

def generate_indian_ocean_location() -> Tuple[float, float]:
    """
    Generate random coordinates within Indian maritime zones (Arabian Sea, Bay of Bengal, etc.),
    avoiding land areas of mainland India.
    
    Returns:
        Tuple[float, float]: A tuple containing (latitude, longitude)
    
    Raises:
        ValueError: If no valid ocean zones are available
    """
    if not OCEAN_ZONES:
        raise ValueError("No ocean zones defined")
    
    # Choose a random ocean zone
    zone = random.choice(OCEAN_ZONES)
    
    # Generate coordinates within that ocean zone
    latitude = round(random.uniform(zone["min_lat"], zone["max_lat"]), COORDINATE_PRECISION)
    longitude = round(random.uniform(zone["min_lon"], zone["max_lon"]), COORDINATE_PRECISION)
    
    return latitude, longitude

def generate_indian_ocean_locations(count: int) -> List[Tuple[float, float]]:
    """
    Generate multiple random coordinates over Indian oceanic zones.
    
    Args:
        count (int): Number of coordinates to generate. Must be positive.
    
    Returns:
        List[Tuple[float, float]]: List of (latitude, longitude) tuples
    
    Raises:
        ValueError: If count is less than 1
    """
    if not isinstance(count, int):
        raise TypeError("Count must be an integer")
    if count < 1:
        raise ValueError("Count must be a positive integer")
    
    return [generate_indian_ocean_location() for _ in range(count)]

if __name__ == "__main__":
    try:
        print("Single random Indian Ocean location:")
        lat, lon = generate_indian_ocean_location()
        print(f"Latitude {lat}, Longitude {lon}")

        print("\n5 random oceanic locations:")
        for i, (lat, lon) in enumerate(generate_indian_ocean_locations(5), 1):
            print(f"{i}. Latitude {lat}, Longitude {lon}")
    except (ValueError, TypeError) as e:
        print(f"Error: {e}")
