@echo off
echo ========================================
echo Real Estate AI - Sri Lanka Edition
echo ========================================
echo.
echo Starting Sri Lanka Real Estate AI Platform...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

echo Starting Backend (Sri Lanka Edition)...
echo.
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your API keys
    echo - GEMINI_API_KEY: Your Google Gemini API key
    echo - JWT_SECRET: A secure random string
    echo.
    pause
)

REM Start backend
echo Starting FastAPI backend...
echo Backend will be available at: http://localhost:8000
echo.
start "Backend - Sri Lanka Edition" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend (Sri Lanka Edition)...
echo.
cd ..\frontend

REM Install frontend dependencies
echo Installing Node.js dependencies...
npm install

REM Start frontend
echo Starting React frontend...
echo Frontend will be available at: http://localhost:3000
echo.
start "Frontend - Sri Lanka Edition" cmd /k "npm run dev"

echo.
echo ========================================
echo Sri Lanka Real Estate AI Platform Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Features:
echo - Sri Lankan cities and districts
echo - LKR pricing and analysis
echo - Local market intelligence
echo - Heritage site proximity
echo - Tourist area analysis
echo.
echo Press any key to open the application...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Platform is running! Press Ctrl+C in the backend/frontend windows to stop.
echo.
pause
