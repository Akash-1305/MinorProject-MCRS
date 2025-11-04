# main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import SessionLocal, engine
from models import Base, Ship, AllShip
import schemas
import location_generator

# Create tables if they don't exist (optional; in production use migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ships API")

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/ships", response_model=List[schemas.ShipRead])
def get_all_ships(db: Session = Depends(get_db)):
    ships = db.query(Ship).all()
    return ships

@app.get("/ships/{ship_id}", response_model=schemas.ShipRead)
def get_ship_by_id(ship_id: int, db: Session = Depends(get_db)):
    ship = db.query(Ship).filter(Ship.id == ship_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship not found")
    return ship

@app.get("/allships", response_model=List[schemas.AllShipWithShipInfo])
def get_all_allships(db: Session = Depends(get_db)):
    allships = db.query(AllShip).all()
    # Convert to the response format with ship info
    result = []
    for allship in allships:
        # Get the related ship info
        ship = db.query(Ship).filter(Ship.id == allship.type).first()
        if ship:
            # Create base AllShip data
            allship_data = schemas.AllShip.from_orm(allship)
            # Create AllShipWithShipInfo with ship info
            allship_with_info = schemas.AllShipWithShipInfo(
                shipid=allship_data.shipid,
                name=allship_data.name,
                type=allship_data.type,
                longitude=allship_data.longitude,
                latitude=allship_data.latitude,
                mission=allship_data.mission,
                ship_info=schemas.ShipRead.from_orm(ship)
            )
            result.append(allship_with_info)
    return result

@app.get("/allships/{allship_id}", response_model=schemas.AllShipWithShipInfo)
def get_allship_by_id(allship_id: int, db: Session = Depends(get_db)):
    allship = db.query(AllShip).filter(AllShip.shipid == allship_id).first()
    if not allship:
        raise HTTPException(status_code=404, detail="AllShip not found")
    
    # Get the related ship info
    ship = db.query(Ship).filter(Ship.id == allship.type).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship type not found")
    
    # Create base AllShip data
    allship_data = schemas.AllShip.from_orm(allship)
    # Create AllShipWithShipInfo with ship info
    return schemas.AllShipWithShipInfo(
        shipid=allship_data.shipid,
        name=allship_data.name,
        type=allship_data.type,
        longitude=allship_data.longitude,
        latitude=allship_data.latitude,
        mission=allship_data.mission,
        ship_info=schemas.ShipRead.from_orm(ship)
    )

@app.post("/addships", response_model=schemas.AllShip)
def create_allship(allship: schemas.AllShipCreate, db: Session = Depends(get_db)):
    # Verify that the ship type exists
    ship = db.query(Ship).filter(Ship.id == allship.type).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Ship type not found")
    
    # Create the new AllShip record
    db_allship = AllShip(**allship.dict())
    db.add(db_allship)
    db.commit()
    db.refresh(db_allship)
    return db_allship

@app.get("/generate-location")
def generate_random_location():
    """
    Generate a random longitude and latitude within the Indian Navy operational area.
    
    Returns:
        dict: A dictionary containing latitude and longitude coordinates
    """
    latitude, longitude = location_generator.generate_indian_ocean_location()
    return {
        "latitude": latitude,
        "longitude": longitude,
        "message": "Random location generated within Indian Navy operational area"
    }

@app.get("/generate-locations")
def generate_random_locations(count: int = 5):
    """
    Generate multiple random longitude and latitude coordinates within the Indian Navy operational area.
    
    Args:
        count (int): Number of coordinates to generate (default: 5, max: 100)
        
    Returns:
        dict: A dictionary containing a list of latitude and longitude coordinates
    """
    # Limit the count to prevent abuse
    if count > 100:
        count = 100
    elif count < 1:
        count = 1
        
    locations = location_generator.generate_indian_ocean_locations(count)
    formatted_locations = [
        {"latitude": lat, "longitude": lon} 
        for lat, lon in locations
    ]
    
    return {
        "locations": formatted_locations,
        "count": len(formatted_locations),
        "message": f"Generated {len(formatted_locations)} random locations within Indian Navy operational area"
    }

from models import Alert
from sqlalchemy import desc

@app.post("/alerts")
def create_alert(alert: dict, db: Session = Depends(get_db)):
    """
    Create a new alert record.
    Frontend will send: { "type": "error" | "warning" | "info", "shipid": optional }
    """
    try:
        db_alert = Alert(
            type=alert.get("type", "info"),
            status=True,
            shipid=alert.get("shipid")
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return {
            "id": db_alert.id,
            "type": db_alert.type,
            "status": db_alert.status,
            "shipid": db_alert.shipid,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/alerts")
def get_all_alerts(db: Session = Depends(get_db)):
    """
    Return all alerts stored in the database (latest first).
    """
    alerts = db.query(Alert).order_by(desc(Alert.id)).all()
    return [
        {
            "id": a.id,
            "type": a.type,
            "status": a.status,
            "shipid": a.shipid,
        }
        for a in alerts
    ]
