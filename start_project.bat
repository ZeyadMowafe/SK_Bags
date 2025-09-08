@echo off
echo ========================================
echo    Handmade Bags E-commerce Project
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python run.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm install && npm start"

echo.
echo ========================================
echo    Project is starting...
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin
echo.
echo Admin Login:
echo Email: admin@handmadebags.com
echo Password: admin123
echo.
echo Press any key to exit...
pause > nul
