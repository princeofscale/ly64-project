@echo off
REM Lyceum 64 - Universal Start Script for Windows
REM Запускает backend и frontend одновременно

echo.
echo ========================================
echo   Lyceum 64 Platform - Starting...
echo ========================================
echo.

REM Проверка наличия node_modules
if not exist "node_modules\" (
    echo [WARNING] node_modules not found. Installing dependencies...
    call npm install
)

if not exist "backend\node_modules\" (
    echo [WARNING] Backend dependencies not found. Installing...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules\" (
    echo [WARNING] Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    cd ..
)

REM Проверка базы данных
if not exist "backend\prisma\dev.db" (
    echo [WARNING] Database not found. Running migrations and seed...
    cd backend
    call npx prisma migrate deploy
    call npx prisma db seed
    cd ..
)

echo.
echo [OK] All checks passed!
echo.
echo [BACKEND] Starting on http://localhost:3001
echo [FRONTEND] Starting on http://localhost:5173
echo.
echo Press Ctrl+C to stop all services
echo.

REM Создаем директорию для логов если её нет
if not exist "logs\" mkdir logs

REM Запуск backend и frontend в отдельных окнах
start "Lyceum 64 - Backend" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak > nul
start "Lyceum 64 - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [OK] Backend and Frontend started in separate windows
echo.
echo To stop: Close both console windows or press Ctrl+C in each
echo.

pause
