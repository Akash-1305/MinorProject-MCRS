from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Double, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Ship(Base):
    __tablename__ = "ships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    speed = Column("speed(km/hr)", Float)
    rotation_speed = Column("rotationspeed(180)", Float)
    humanalert = Column(Float, default=0.0)
    attack = Column(Float, default=0.0)
    robery = Column(Float, default=0.0)
    struck = Column(Float, default=0.0)
    resource = Column(Float, default=0.0)
    ubts = Column(Float, default=0.0)
    time = Column(Float, default=0.0)
    climate = Column(Float)


class AllShip(Base):
    __tablename__ = "all_ships"

    shipid = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Double)
    longitude = Column(Double)
    mission = Column(Boolean, default=False)
    type = Column(Integer, ForeignKey("ships.id"))


class Alert(Base):
    __tablename__ = "alert"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    human_error = Column(Double, nullable=False)
    attack = Column(Double, nullable=False)
    weather = Column(Double, nullable=False)

class AlertResult(Base):
    __tablename__ = "alert_results"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(255), nullable=False)
    best_ship = Column(String(255), nullable=False)
    ship_id = Column(Integer, nullable=False)
    final_score = Column(Float, nullable=False)
    timestamp = Column(String(255), default=datetime.utcnow)
    status = Column(Boolean, default=True)