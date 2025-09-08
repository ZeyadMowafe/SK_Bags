@echo off
echo ========================================
echo    Installing Dependencies
echo ========================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

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
echo ========================================
echo    Dependencies installed successfully!
echo ========================================
echo.
echo Now you can run: start_all.bat
echo.
pause
