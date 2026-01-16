import os
from dotenv import load_dotenv
from celery import Celery

load_dotenv()

def req(name):
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
POSTGRES_URL = req("POSTGRES_URL")

celery = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)
