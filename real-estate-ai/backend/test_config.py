#!/usr/bin/env python3
"""Test configuration loading"""

import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

try:
    from app.core.config import settings
    print("✅ Configuration loaded successfully!")
    print(f"Database URL: {settings.database_url}")
    print(f"JWT Secret: {settings.jwt_secret[:20]}...")
    print(f"Allow Origins: {settings.allow_origins}")
    print(f"Gemini API Key: {settings.gemini_api_key[:10] if settings.gemini_api_key else 'Not set'}...")
except Exception as e:
    print(f"❌ Configuration error: {e}")
    import traceback
    traceback.print_exc()

