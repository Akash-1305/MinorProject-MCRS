# schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ShipBase(BaseModel):
    name: Optional[str]
    speed: Optional[float]
    rotation_speed: Optional[float]
    humanalert: Optional[float] = 0.0
    attack: Optional[float] = 0.0
    robery: Optional[float] = 0.0
    struck: Optional[float] = 0.0
    resource: Optional[float] = 0.0
    ubts: Optional[float] = 0.0
    time: Optional[float] = 0.0
    climate: Optional[float] = None

class ShipRead(ShipBase):
    id: int

    class Config:
        from_attributes = True

class AllShipBase(BaseModel):
    name: str
    type: int
    longitude: float
    latitude: float
    mission: bool

class AllShipCreate(AllShipBase):
    pass

class AllShip(AllShipBase):
    shipid: int

    class Config:
        from_attributes = True

class AllShipWithShipInfo(AllShipBase):
    shipid: int
    ship_info: ShipRead

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    id: int
    name: str
    human_error: float
    attack: float
    weather: float