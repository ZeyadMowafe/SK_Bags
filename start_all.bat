@echo off
echo ========================================
echo    Handmade Bags E-commerce Project
echo ========================================
echo.

echo Installing root dependencies...
npm install

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Installing backend dependencies...
cd backend
call pip install -r requirements.txt
cd ..

echo.
echo ========================================
echo    Starting the project...
echo ========================================
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python run.py"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

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
echo Press any key to exit...
pause > nul
