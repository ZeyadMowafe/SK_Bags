@echo off
echo ========================================
echo    Starting Fixed Project
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
