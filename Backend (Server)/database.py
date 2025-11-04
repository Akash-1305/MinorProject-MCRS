# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Use an env var DATABASE_URL. Example:
# mysql+pymysql://username:password@localhost:3306/database_name
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/mcrs")

# For synchronous usage:
engine = create_engine(DATABASE_URL, future=True, echo=False, pool_pre_ping=True)

# A session factory. Use scoped_session if you prefer threadlocal sessions.
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True))