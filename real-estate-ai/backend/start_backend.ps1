# PowerShell script to start the backend with MongoDB Atlas
$env:MONGODB_URL="mongodb+srv://PetCareSys:PetCareSys@cluster0.iiemfla.mongodb.net/PetCare_db?retryWrites=true&w=majority&appName=Cluster0"
$env:GEMINI_API_KEY="AIzaSyATC233mLSYc6TgRKlQVJ4tZ6GesgHwld4"
$env:DATABASE_NAME="realestate_srilanka"
$env:JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
$env:ALLOW_ORIGINS="http://localhost:3000"

Write-Host "Starting Real Estate AI Backend with MongoDB Atlas..." -ForegroundColor Green
Write-Host "MongoDB URL: $env:MONGODB_URL" -ForegroundColor Yellow
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan

# Prefer project-local virtual environment python if it exists
$venvPython = Join-Path $PSScriptRoot '.venv/Scripts/python.exe'
# Ensure Python can import the local `app` package when uvicorn spawns subprocesses
$env:PYTHONPATH = $PSScriptRoot
if (Test-Path $venvPython) {
	Write-Host "Using venv interpreter: $venvPython" -ForegroundColor DarkCyan
	& $venvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --timeout-keep-alive 300
} else {
	Write-Warning "Virtual environment python not found at $venvPython; falling back to system 'python'"
	python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --timeout-keep-alive 300
}
