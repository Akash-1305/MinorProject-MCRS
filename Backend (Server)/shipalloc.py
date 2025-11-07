import math

# ------------------ STRUCT-LIKE CLASSES ------------------
class AlertType:
    def __init__(self, name, human_error, attack, weather):
        self.name = name
        self.human_error = human_error
        self.attack = attack
        self.weather = weather


class Ship:
    def __init__(self, name, type_, speed, lat, lon, human_error, attack, weather, climate_score):
        self.name = name
        self.type = type_
        self.speed = speed
        self.lat = lat
        self.lon = lon
        self.human_error = human_error
        self.attack = attack
        self.weather = weather
        self.climate_score = climate_score


class Result:
    def __init__(self, name, type_, distance, speed, time, T_value, alert_score, climate_score, Final_score):
        self.name = name
        self.type = type_
        self.distance = distance
        self.speed = speed
        self.time = time
        self.T_value = T_value
        self.alert_score = alert_score
        self.climate_score = climate_score
        self.Final_score = Final_score


# ------------------ DISTANCE FUNCTION (HAVERSINE FORMULA) ------------------
def to_radians(degree):
    return degree * math.pi / 180.0


def calculate_distance(lat1, lon1, lat2, lon2):
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


# ------------------ SHIP LIST CLASS ------------------
class ShipList:
    def __init__(self):
        # Alert types (base factors)
        self.alerts = [
            AlertType("Ship Drawn", 7.0, 2.0, 1.0),
            AlertType("Ship Accident", 8.0, 1.0, 3.0),
            AlertType("Ship Attack", 3.0, 9.0, 1.0),
            AlertType("Ship Hijack", 4.0, 10.0, 2.0),
            AlertType("Navy Attack", 2.0, 10.0, 1.0),
            AlertType("Ship Struck", 6.0, 1.0, 5.0),
            AlertType("Shortage of Resources", 9.0, 1.0, 2.0)
        ]

        # Ships (latitude, longitude as coordinates)
        self.ships = [
            Ship("INS Vikrant", "Battleship", 60, 12.9716, 77.5946, 0.7, 0.4, 0.3, 0.2),
            Ship("INS Talwar", "Cruiser", 50, 13.0827, 80.2707, 0.6, 0.5, 0.4, 0.1),
            Ship("INS Kolkata", "Destroyer", 55, 9.9252, 78.1198, 0.5, 0.6, 0.3, 0.3),
            Ship("INS Chakra", "Submarine", 45, 15.3173, 75.7139, 0.4, 0.8, 0.2, 0.2),
            Ship("INS Vikramaditya", "Carrier", 40, 19.0760, 72.8777, 0.8, 0.3, 0.4, 0.1)
        ]

    def show_alerts(self):
        print("\nAvailable Alert Types:")
        for i, alert in enumerate(self.alerts, 1):
            print(f"{i}. {alert.name}")

    def alert_mode(self):
        self.show_alerts()
        choice = int(input(f"\nChoose an Alert Type (1-{len(self.alerts)}): "))

        if not (1 <= choice <= len(self.alerts)):
            print("Invalid choice.")
            return

        selected = self.alerts[choice - 1]

        target_lat = float(input("\nEnter Target Latitude: "))
        target_lon = float(input("Enter Target Longitude: "))

        print("\nSelect Climate Condition:")
        print("1. Tufan (1)\n2. High Waves (3)\n3. Clean (5)")
        climate_choice = int(input("Enter choice: "))

        results = []
        times = []

        # Step 1: Calculate distance, time, and scores
        for ship in self.ships:
            dist = calculate_distance(ship.lat, ship.lon, target_lat, target_lon)
            time = dist / ship.speed

            alert_score = (
                pow(selected.human_error, ship.human_error) +
                pow(selected.attack, ship.attack) +
                pow(selected.weather, ship.weather)
            )

            climate_score = pow(climate_choice, ship.climate_score)

            results.append(Result(
                ship.name, ship.type, dist, ship.speed, time,
                0.0, alert_score, climate_score, 0.0
            ))
            times.append(time)

        # Step 2: Max time
        max_time = max(times)

        # Step 3: Compute T-Value and Final Score
        for r in results:
            r.T_value = max_time - r.time
            r.Final_score = pow(r.alert_score, 0.4) + pow(r.T_value, 0.3) + r.climate_score

        # Step 4: Find best ship
        best_ship = max(results, key=lambda r: r.Final_score)

        print(f"Alert Type: {selected.name}")

        print(f"Ship: {best_ship.name}")


# ------------------ MAIN FUNCTION ------------------
if __name__ == "__main__":
    sl = ShipList()
    sl.alert_mode()
