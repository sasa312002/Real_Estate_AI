#!/usr/bin/env python3
"""
Check available Gemini models
"""

import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import google.generativeai as genai
from app.core.config import settings

def check_available_models():
    """Check which Gemini models are available"""
    print("Checking available Gemini models...")
    
    if not settings.gemini_api_key:
        print("❌ No GEMINI_API_KEY found in settings")
        return
    
    genai.configure(api_key=settings.gemini_api_key)
    
    try:
        models = genai.list_models()
        print("\n✅ Available models:")
        for model in models:
            print(f"  - {model.name}")
            
        # Try to create a simple model instance
        print("\nTesting model initialization:")
        test_models = ['gemini-pro', 'gemini-1.0-pro-latest', 'gemini-1.0-pro']
        
        for model_name in test_models:
            try:
                model = genai.GenerativeModel(model_name)
                print(f"✅ {model_name} - SUCCESS")
                
                # Try a simple generation
                response = model.generate_content("Say hello")
                print(f"   Response: {response.text[:50]}...")
                break
                
            except Exception as e:
                print(f"❌ {model_name} - FAILED: {str(e)[:100]}")
                
    except Exception as e:
        print(f"❌ Error listing models: {e}")

if __name__ == "__main__":
    check_available_models()