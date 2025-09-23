@echo off
echo 🚀 Starting Real Estate AI Project Setup...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Backend setup
echo 🔧 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating environment file...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration (especially JWT_SECRET and GEMINI_API_KEY)
)

REM Initialize database
echo 🗄️  Initializing database...
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

echo ✅ Backend setup complete!
cd ..

REM Frontend setup
echo 🔧 Setting up frontend...
cd frontend

REM Install dependencies
echo 📥 Installing Node.js dependencies...
npm install

echo ✅ Frontend setup complete!
cd ..

echo.
echo 🎉 Setup complete! To run the project:
echo.
echo Backend (Command Prompt 1):
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo Frontend (Command Prompt 2):
echo   cd frontend
echo   npm run dev
echo.
echo 🌐 Backend will be available at: http://localhost:8000
echo 🌐 Frontend will be available at: http://localhost:3000
echo.
echo 📚 See README.md for detailed documentation and API examples.
pause

