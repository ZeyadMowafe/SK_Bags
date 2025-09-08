@echo off
echo ========================================
echo    Fixing and Starting Project
echo ========================================
echo.

echo Step 1: Installing root dependencies...
call npm install

echo.
echo Step 2: Installing frontend dependencies...
cd frontend
echo Cleaning frontend node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Installing frontend packages...
call npm install
cd ..

echo.
echo Step 3: Installing backend dependencies...
cd backend
echo Creating virtual environment...
python -m venv venv
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing Python packages...
call pip install --upgrade pip
call pip install -r requirements.txt
cd ..

echo.
echo Step 4: Starting the project...
echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python run.py"

echo Waiting 8 seconds for backend to start...
timeout /t 8 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo    Project is starting...
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo Admin:    http://localhost:3000/admin
echo.
echo If you see any errors, please check:
echo 1. Node.js is installed (node --version)
echo 2. Python is installed (python --version)
echo 3. pip is installed (pip --version)
echo.
echo Press any key to exit...
pause > nul
