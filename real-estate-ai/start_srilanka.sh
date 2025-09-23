#!/bin/bash

echo "========================================"
echo "Real Estate AI - Sri Lanka Edition"
echo "========================================"
echo ""
echo "Starting Sri Lanka Real Estate AI Platform..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ and try again"
    exit 1
fi

echo "Starting Backend (Sri Lanka Edition)..."
echo ""
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file with your API keys"
    echo "- GEMINI_API_KEY: Your Google Gemini API key"
    echo "- JWT_SECRET: A secure random string"
    echo ""
    read -p "Press Enter to continue..."
fi

# Start backend
echo "Starting FastAPI backend..."
echo "Backend will be available at: http://localhost:8000"
echo ""
gnome-terminal --title="Backend - Sri Lanka Edition" -- bash -c "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; exec bash" &
# Alternative for non-GNOME systems:
# xterm -title "Backend - Sri Lanka Edition" -e "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" &

# Wait a moment for backend to start
sleep 3

echo ""
echo "Starting Frontend (Sri Lanka Edition)..."
echo ""
cd ../frontend

# Install frontend dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend
echo "Starting React frontend..."
echo "Frontend will be available at: http://localhost:3000"
echo ""
gnome-terminal --title="Frontend - Sri Lanka Edition" -- bash -c "npm run dev; exec bash" &
# Alternative for non-GNOME systems:
# xterm -title "Frontend - Sri Lanka Edition" -e "npm run dev" &

echo ""
echo "========================================"
echo "Sri Lanka Real Estate AI Platform Started!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Features:"
echo "- Sri Lankan cities and districts"
echo "- LKR pricing and analysis"
echo "- Local market intelligence"
echo "- Heritage site proximity"
echo "- Tourist area analysis"
echo ""
echo "Press Enter to open the application..."
read

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
else
    echo "Please open http://localhost:3000 in your browser"
fi

echo ""
echo "Platform is running! Close the terminal windows to stop."
echo ""
read -p "Press Enter to exit..."
