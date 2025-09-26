from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api import auth, query, feedback, payments
from app.db.mongodb import connect_to_mongo, close_mongo_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Real Estate AI",
    description="AI-powered property analysis and valuation platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(query.router)
app.include_router(feedback.router)
app.include_router(payments.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        logger.info("MongoDB connection established successfully")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    try:
        await close_mongo_connection()
        logger.info("MongoDB connection closed successfully")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Real Estate AI API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Service is running"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
