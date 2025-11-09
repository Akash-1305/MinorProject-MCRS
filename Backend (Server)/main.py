from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal, engine
from models import Base, Ship, AllShip, Alert, AlertResult
import schemas
import location_generator
import shipalloc
import distance_calc
from datetime import datetime
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ships API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/ships", response_model=List[schemas.ShipRead])
def get_all_ships(db: Session = Depends(get_db)):
    return db.query(Ship).all()


@app.get("/ships/{ship_id}", response_model=schemas.ShipRead)
def get_ship_by_id(ship_id: int, db: Session = Depends(get_db)):
    ship = db.query(Ship).filter(Ship.id == ship_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship


@app.get("/allships", response_model=List[schemas.AllShipWithShipInfo])
def get_all_allships(db: Session = Depends(get_db)):
    allships = db.query(AllShip).all()
    result = []

    for allship in allships:
        ship = db.query(Ship).filter(Ship.id == allship.type).first()
        if ship:
            allship_data = schemas.AllShip.from_orm(allship)
            allship_with_info = schemas.AllShipWithShipInfo(
                shipid=allship_data.shipid,
                name=allship_data.name,
                type=allship_data.type,
                longitude=allship_data.longitude,
                latitude=allship_data.latitude,
                mission=allship_data.mission,
                ship_info=schemas.ShipRead.from_orm(ship),
            )
            result.append(allship_with_info)
    return result


@app.get("/allships/{allship_id}", response_model=schemas.AllShipWithShipInfo)
def get_allship_by_id(allship_id: int, db: Session = Depends(get_db)):
    allship = db.query(AllShip).filter(AllShip.shipid == allship_id).first()
    if not allship:
        raise HTTPException(status_code=404, detail="AllShip not found")

    ship = db.query(Ship).filter(Ship.id == allship.type).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship type not found")

    allship_data = schemas.AllShip.from_orm(allship)
    return schemas.AllShipWithShipInfo(
        shipid=allship_data.shipid,
        name=allship_data.name,
        type=allship_data.type,
        longitude=allship_data.longitude,
        latitude=allship_data.latitude,
        mission=allship_data.mission,
        ship_info=schemas.ShipRead.from_orm(ship),
    )


@app.post("/addships", response_model=schemas.AllShip)
def create_allship(allship: schemas.AllShipCreate, db: Session = Depends(get_db)):
    ship = db.query(Ship).filter(Ship.id == allship.type).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship type not found")

    db_allship = AllShip(**allship.dict())
    db.add(db_allship)
    db.commit()
    db.refresh(db_allship)
    return db_allship


@app.get("/generate-location")
def generate_random_location():
    latitude, longitude = location_generator.generate_indian_ocean_location()
    return {
        "latitude": latitude,
        "longitude": longitude,
        "message": "Random location generated within Indian Navy operational area",
    }


@app.get("/generate-locations")
def generate_random_locations(count: int = 5):
    if count > 100:
        count = 100
    elif count < 1:
        count = 1

    locations = location_generator.generate_indian_ocean_locations(count)
    formatted_locations = [{"latitude": lat, "longitude": lon} for lat, lon in locations]

    return {
        "locations": formatted_locations,
        "count": len(formatted_locations),
        "message": f"Generated {len(formatted_locations)} random locations within Indian Navy operational area",
    }


@app.get("/alerts", response_model=List[schemas.AlertBase])
def get_all_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    if not alerts:
        raise HTTPException(status_code=404, detail="No alerts found")

    return [
        schemas.AlertBase(
            id=alert.id,
            name=alert.name,
            human_error=alert.human_error,
            attack=alert.attack,
            weather=alert.weather,
        )
        for alert in alerts
    ]


@app.post("/trigger", response_model=schemas.TriggerAlertResponse)
def trigger_alert(request: schemas.TriggerAlertRequest, db: Session = Depends(get_db)):
    try:
        alert_db = db.query(Alert).filter(Alert.name == request.alert_type).first()
        if not alert_db:
            raise HTTPException(status_code=404, detail=f"Alert type '{request.alert_type}' not found")

        alert_obj = shipalloc.AlertType(
            name=alert_db.name,
            human_error=alert_db.human_error,
            attack=alert_db.attack,
            weather=alert_db.weather,
        )

        available_ships = db.query(AllShip).filter(
            (AllShip.mission == False) | (AllShip.mission == 0)
        ).all()
        if not available_ships:
            raise HTTPException(status_code=404, detail="All ships are currently on mission")

        ships_data = []
        for allship in available_ships:
            ship = db.query(Ship).filter(Ship.id == allship.type).first()
            if ship:
                ships_data.append({
                    "shipid": allship.shipid,
                    "name": allship.name,
                    "latitude": allship.latitude,
                    "longitude": allship.longitude,
                    "mission": allship.mission,
                    "ship_info": {
                        "name": ship.name,
                        "speed": ship.speed,
                        "humanalert": ship.humanalert,
                        "attack": ship.attack,
                        "robery": ship.robery,
                        "struck": ship.struck,
                        "resource": ship.resource,
                        "climate": ship.climate,
                    },
                })

        if not ships_data:
            raise HTTPException(status_code=404, detail="No ships available for alert calculation")

        best_ship = shipalloc.process_alert(
            alert_obj,
            request.latitude,
            request.longitude,
            request.climate_condition,
            ships_data,
        )
        if not best_ship:
            raise HTTPException(status_code=404, detail="Could not determine best ship")

        selected_ship = (
            db.query(AllShip)
            .filter(
                and_(
                    AllShip.shipid == best_ship.ship_id,
                    (AllShip.mission == False) | (AllShip.mission == 0)
                )
            )
            .with_for_update()
            .first()
        )
        if not selected_ship:
            raise HTTPException(status_code=409, detail="Selected ship already allocated")

        selected_ship.mission = True
        db.add(selected_ship)

        alert_result = AlertResult(
            alert_type=request.alert_type,
            ship_id=best_ship.ship_id,
            best_ship=best_ship.name,
            final_score=best_ship.Final_score,
            timestamp=datetime.utcnow()
        )
        db.add(alert_result)

        db.commit()
        db.refresh(selected_ship)
        db.refresh(alert_result)

        return schemas.TriggerAlertResponse(
            alert_type=request.alert_type,
            best_ship=best_ship.name,
            ship_id=best_ship.ship_id,
            final_score=best_ship.Final_score
        )

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/alert-results", response_model=List[schemas.AlertResultBase])
def get_all_alert_results(db: Session = Depends(get_db)):
    results = db.query(AlertResult).order_by(AlertResult.timestamp.desc()).all()
    return results


@app.post("/update-ship-position", response_model=schemas.UpdateShipPositionResponse)
def update_ship_position(
    data: schemas.UpdateShipPositionRequest,
    db: Session = Depends(get_db)
):
    ship = db.query(AllShip).filter(AllShip.shipid == data.ship_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")

    # Store old position
    old_lat, old_lon = ship.latitude, ship.longitude

    # Calculate distance
    distance = distance_calc.haversine(old_lat, old_lon, data.latitude, data.longitude)

    # Optional: simulate movement and get message
    simulation_message = distance_calc.simulate_movement(
        old_lat, old_lon, data.latitude, data.longitude, speed_kmh=50  # or any default speed
    )

    # Update ship position in DB
    ship.latitude = data.latitude
    ship.longitude = data.longitude
    db.add(ship)
    db.commit()
    db.refresh(ship)

    return schemas.UpdateShipPositionResponse(
        ship_id=ship.shipid,
        old_latitude=old_lat,
        old_longitude=old_lon,
        new_latitude=ship.latitude,
        new_longitude=ship.longitude,
        distance_km=distance,
        message=f"Ship moved successfully.\nDistance traveled: {distance:.2f} km\n{simulation_message}"
    )