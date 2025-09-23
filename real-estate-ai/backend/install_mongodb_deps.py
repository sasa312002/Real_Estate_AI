#!/usr/bin/env python3
"""
Script to install MongoDB dependencies and test connection
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install MongoDB dependencies"""
    print("Installing MongoDB dependencies...")
    
    try:
        # Install the updated requirements
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\nTesting MongoDB connection...")
    
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import asyncio
        
        async def test_connection():
            # Test with default MongoDB URL
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            try:
                # Test the connection
                await client.admin.command('ping')
                print("✅ MongoDB connection successful!")
                return True
            except Exception as e:
                print(f"❌ MongoDB connection failed: {e}")
                print("Make sure MongoDB is running on localhost:27017")
                return False
            finally:
                client.close()
        
        return asyncio.run(test_connection())
        
    except ImportError as e:
        print(f"❌ Error importing MongoDB libraries: {e}")
        return False

def main():
    """Main function"""
    print("🚀 MongoDB Setup for Real Estate AI - Sri Lanka Edition")
    print("=" * 60)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Test connection
    if not test_mongodb_connection():
        print("\n⚠️  MongoDB connection test failed.")
        print("Please ensure MongoDB is installed and running:")
        print("1. Install MongoDB: https://www.mongodb.com/try/download/community")
        print("2. Start MongoDB service")
        print("3. Or update MONGODB_URL in .env file if using a different host/port")
        sys.exit(1)
    
    print("\n🎉 MongoDB setup completed successfully!")
    print("\nNext steps:")
    print("1. Update your .env file with MongoDB URL if needed")
    print("2. Start the backend: uvicorn app.main:app --reload")
    print("3. Test the API endpoints")

if __name__ == "__main__":
    main()
