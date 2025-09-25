from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.mongodb_models import User, Query, Response, Feedback
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    try:
        # Log a sanitized target for easier diagnostics
        try:
            parsed = urlparse(settings.mongodb_url)
            target = f"{parsed.scheme}://{parsed.hostname}:{parsed.port or ''}".rstrip(":")
        except Exception:
            target = "<unparsed>"

        logger.info(f"Attempting MongoDB connection to: {target} / db='{settings.database_name}'")

        mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
        mongodb.database = mongodb.client[settings.database_name]

        # Test the connection FIRST to avoid misleading success logs
        await mongodb.client.admin.command('ping')
        logger.info("MongoDB ping successful")

        # Initialize Beanie with the models (after ping)
        await init_beanie(
            database=mongodb.database,
            document_models=[User, Query, Response, Feedback]
        )

        logger.info("Connected to MongoDB and initialized Beanie successfully")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.warning("MongoDB connection failed. The application will continue but database operations will fail.")
        # Don't raise the exception - let the app start without MongoDB
        # This allows the health check to work while you install MongoDB

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        logger.info("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return mongodb.database
