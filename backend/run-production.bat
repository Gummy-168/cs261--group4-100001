@echo off
echo ================================
echo   Running in PRODUCTION MODE
echo   Using REAL TU API
echo ================================
echo.
set /p API_KEY="Enter TU API Key: "
set TU_API_KEY=%API_KEY%
cd backend
call mvnw spring-boot:run
pause
