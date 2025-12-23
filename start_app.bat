@echo off
echo ===================================================
echo   Starting Secure FL System (Backend + Frontend)
echo ===================================================

start cmd /k "cd web_app\backend && pip install -r requirements.txt && python app.py"
echo [Backend] Flask APi starting on Port 5000...

echo Waiting for backend...
timeout /t 5

start cmd /k "cd web_app\frontend && npm install && npm run dev"
echo [Frontend] React App starting...

echo ===================================================
echo   System Launched. 
echo   Please ensure MySQL is running!
echo ===================================================
