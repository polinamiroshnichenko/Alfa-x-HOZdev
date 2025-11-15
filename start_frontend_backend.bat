@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🐳 Docker Compose Manager
echo.

set "COMPOSE_PATH=%~dp0docker_backend_frontend"
set "DEV_FILE=docker-compose.dev.yml"
set "PROD_FILE=docker-compose.yml"

:menu
echo ================================
echo        DOCKER COMPOSE MENU
echo ================================
echo.
echo [DEVELOPMENT]
echo 1 - Start Development (with rebuild)
echo 2 - Start Development (normal)
echo 3 - Start Development (background)
echo.
echo [PRODUCTION]
echo 4 - Start Production (with rebuild) 
echo 5 - Start Production (normal)
echo 6 - Start Production (background)
echo.
echo [MANAGEMENT]
echo 7 - View Development Logs
echo 8 - View Production Logs
echo 9 - Stop All Containers
echo 0 - Exit
echo.
set /p choice="Enter choice (0-9): "

if "!choice!"=="1" (
    call :start_dev_rebuild
) else if "!choice!"=="2" (
    call :start_dev
) else if "!choice!"=="3" (
    call :start_dev -d
) else if "!choice!"=="4" (
    call :start_prod --build
) else if "!choice!"=="5" (
    call :start_prod
) else if "!choice!"=="6" (
    call :start_prod -d
) else if "!choice!"=="7" (
    call :show_logs dev
) else if "!choice!"=="8" (
    call :show_logs prod
) else if "!choice!"=="9" (
    call :stop_all
) else if "!choice!"=="0" (
    exit /b 0
) else (
    echo ❌ Invalid choice!
    timeout /t 2 >nul
)
goto menu

:start_dev
echo.
echo 🚀 Starting DEVELOPMENT environment...
cd /d "!COMPOSE_PATH!"
echo 📁 Using: !DEV_FILE!
docker-compose -f !DEV_FILE! up
if errorlevel 1 (
    echo ❌ Failed to start development environment
    pause
)
goto :eof

:start_dev_rebuild
echo.
cd /d "!COMPOSE_PATH!"
echo 🗑️ Deleting all previous containers and volumes...
docker-compose -f !DEV_FILE! down -v
echo 🚀 Starting DEVELOPMENT environment...
echo 📁 Using: !DEV_FILE!
docker-compose -f !DEV_FILE! up --build
if errorlevel 1 (
    echo ❌ Failed to start development environment
    pause
)
goto :eof

:start_prod
echo.
echo 🏭 Starting PRODUCTION environment...
cd /d "!COMPOSE_PATH!"
echo 📁 Using: !PROD_FILE!
docker-compose -f !PROD_FILE! up %*
if errorlevel 1 (
    echo ❌ Failed to start production environment
    pause
)
goto :eof

:show_logs
echo.
echo 📋 Showing logs for %1 environment...
cd /d "!COMPOSE_PATH!"
if "%1"=="dev" (
    docker-compose -f !DEV_FILE! logs -f
) else (
    docker-compose -f !PROD_FILE! logs -f
)
goto :eof

:stop_all
echo.
echo 🛑 Stopping all containers...
cd /d "!COMPOSE_PATH!"
echo Stopping development containers...
docker-compose -f !DEV_FILE! down
echo Stopping production containers...
docker-compose -f !PROD_FILE! down
echo ✅ All containers stopped
pause
goto :eof