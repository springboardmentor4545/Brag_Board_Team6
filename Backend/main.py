from fastapi import FastAPI
from . import models
from .database import engine
from .auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

# Create all database tables
models.Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI(title="Bragboard API")

# Allow the frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or "http://localhost:3001" if your React app runs on that port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes from auth.py
app.include_router(auth_router)

# Root route for quick API health check
@app.get("/")
def read_root():
    return {"status": "Bragboard API is running successfully 🚀"}
