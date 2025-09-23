from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database - Support both old and new field names
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "realestate_srilanka"
    
    # Legacy support for old field names
    database_url: str = ""  # Will be ignored
    mongodb_uri: str = ""   # Will be ignored
    
    # JWT
    jwt_secret: str = "change_me_to_a_secure_random_string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Gemini AI
    gemini_api_key: str = ""
    
    # CORS - Use string type to avoid JSON parsing
    allow_origins: str = "http://localhost:3000"
    
    # Security
    min_password_length: int = 8
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields instead of raising errors

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Handle migration from old field names
        if self.mongodb_uri and not self.mongodb_url.startswith("mongodb://localhost"):
            self.mongodb_url = self.mongodb_uri
    
    @property
    def cors_origins(self) -> List[str]:
        """Convert allow_origins string to list for CORS middleware"""
        if "," in self.allow_origins:
            return [origin.strip() for origin in self.allow_origins.split(",")]
        return [self.allow_origins.strip()]

# Create settings instance
settings = Settings()
