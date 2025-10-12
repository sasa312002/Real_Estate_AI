from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.mongodb_models import User, Query, Response, Feedback, Payment
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
        mongodb.database = mongodb.client[settings.database_name]
        
        # Initialize Beanie with the models
        await init_beanie(
            database=mongodb.database,
            document_models=[User, Query, Response, Feedback, Payment]
        )
        
        logger.info("Connected to MongoDB successfully")
        
        # Test the connection
        await mongodb.client.admin.command('ping')
        logger.info("MongoDB connection test successful")
        
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
