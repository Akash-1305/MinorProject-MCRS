import math

# -------------------------------
# Geometry + Utility Functions
# -------------------------------

def to_radians(degree: float) -> float:
    return degree * math.pi / 180.0


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance (in km) between two points."""
    R = 6371.0  # Earth radius in km

    lat1, lon1, lat2, lon2 = map(to_radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def estimate_travel_time(distance_km: float, speed_kmh: float) -> float:
    """Estimate time (in hours)."""
    if speed_kmh <= 0:
        return float("inf")
    return distance_km / speed_kmh


# -------------------------------
# Polygon Inclusion Check
# -------------------------------

def is_inside_polygon(polygon, point):
    """Check if (lat, lon) point lies inside polygon using ray casting."""
    x, y = point
    n = len(polygon)
    inside = False

    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]

        if ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1):
            inside = not inside

    return inside


# -------------------------------
# Path Simulation
# -------------------------------

def simulate_path(start, end, polygon, speed_kmh, label="Route"):
    """Simulate movement and check polygon intersection."""
    lat1, lon1 = start
    lat2, lon2 = end

    distance = haversine(lat1, lon1, lat2, lon2)
    total_time = estimate_travel_time(distance, speed_kmh)
    positions = []

    # Generate intermediate hourly positions
    for h in range(math.ceil(total_time) + 1):
        fraction = h / total_time if total_time > 0 else 1.0
        fraction = min(fraction, 1.0)
        curr_lat = lat1 + fraction * (lat2 - lat1)
        curr_lon = lon1 + fraction * (lon2 - lon1)
        inside = is_inside_polygon(polygon, (curr_lat, curr_lon))
        positions.append((h, curr_lat, curr_lon, inside))

    # Format output message
    lines = []
    lines.append(f"\n=== {label} ===")
    lines.append(f"Total Distance: {distance:.2f} km | Estimated Time: {total_time:.2f} hours")
    lines.append("Time(h)   Latitude     Longitude     Status")
    lines.append("---------------------------------------------------")

    path_inside = False
    for h, lat, lon, inside in positions:
        status = "❌ Inside restricted zone" if inside else "✅ Outside"
        lines.append(f"{h:<8}  {lat:.4f}      {lon:.4f}      {status}")
        if inside:
            path_inside = True

    if path_inside:
        lines.append("❌ Path entered restricted region!")
    else:
        lines.append("✅ Path stayed outside the restricted area!")

    return "\n".join(lines), not path_inside, distance


# -------------------------------
# Simulation Wrapper (Main API)
# -------------------------------

def simulate_movement_with_restrictions(lat1, lon1, lat2, lon2, speed_kmh):
    """
    Simulate movement between two points at given speed.
    Includes restricted zone check and alternate routes.
    Returns formatted output as string.
    """

    polygon = [
        (23.694119633535138, 68.14149973127236),
        (20.541614160757753, 70.96869016501113),
        (20.526351042243512, 72.4975608124518),
        (17.22712347466089, 72.77693993220252),
        (7.856392117236889, 77.3557810311827),
        (9.128111199112015, 78.97345643559729),
        (8.831075485492525, 79.61637871171075),
        (5.962310128504571, 79.90673070737493),
        (6.22008914021468, 81.93919467702402),
        (7.486424219383046, 81.99104324767832),
        (10.894681116586904, 79.94820956389837),
        (15.508653879971105, 80.84765671454751),
        (19.4308684460504, 85.68628593633235),
        (21.200457540153735, 88.8313949304925),
        (21.63084181829822, 89.11274398394436),
    ]

    safe1 = (7.680220332790962, 77.52410752640004)
    safe2 = (4.666352644711645, 82.6181597042664)

    output_lines = []
    inside1 = is_inside_polygon(polygon, (lat1, lon1))
    inside2 = is_inside_polygon(polygon, (lat2, lon2))

    if inside1 or inside2:
        return "❌ One or both points are inside the restricted zone. Simulation aborted."

    output_lines.append("✅ Both points are outside restricted zone.\n")
    source = (lat1, lon1)
    dest = (lat2, lon2)

    output_lines.append("==== ROUTE CHECK SEQUENCE ====")
    if lon1 < lon2:
        routes = [
            [source, dest],
            [source, safe1, dest],
            [source, safe1, safe2, dest],
        ]
    else:
        routes = [
            [source, dest],
            [source, safe2, dest],
            [source, safe2, safe1, dest],
        ]

    safe_found = False
    for i, route in enumerate(routes, 1):
        if safe_found:
            output_lines.append("✅ Previous route was safe — skipping remaining routes.")
            break

        output_lines.append(f"\n🚗 Checking Route {i} with {len(route) - 1} segments")
        all_safe = True
        total_dist = 0

        for j in range(len(route) - 1):
            result_text, safe, dist = simulate_path(
                route[j], route[j + 1], polygon, speed_kmh, f"Segment {j+1} of Route {i}"
            )
            output_lines.append(result_text)
            total_dist += dist
            if not safe:
                all_safe = False

        output_lines.append(f"\nRoute {i} total distance: {total_dist:.2f} km")
        if all_safe:
            output_lines.append("✅ Safe route found!")
            safe_found = True
        else:
            output_lines.append("❌ Crosses restricted zone.")

    output_lines.append("\nSimulation complete.")
    return "\n".join(output_lines)
