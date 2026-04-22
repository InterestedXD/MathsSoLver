import os
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "API working"}

@app.get("/health")
async def health():
    database_url = os.getenv("DATABASE_URL", "not set")
    return {"status": "ok", "database_url": database_url}

handler = Mangum(app)
