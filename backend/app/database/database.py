# app/database/database.py

from dotenv import load_dotenv, find_dotenv
import os

# Try to find a .env in the current working directory or its parents first.
env_path = find_dotenv()
if not env_path:
    # If the process CWD is the repo root (or elsewhere), load the backend/.env
    # relative to this file so backend services work when started from the repo root.
    env_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    )
load_dotenv(env_path)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool


SUPABASE_URL = os.getenv("SUPABASE_URL")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is not set!")

engine = create_engine(
    SUPABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()