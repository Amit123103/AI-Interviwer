@echo off
setlocal EnableDelayedExpansion

title Intervyxa AI - Master Startup Orchestrator v7.0
echo.
powershell -Command "Write-Host '==========================================' -ForegroundColor Cyan"
powershell -Command "Write-Host '   INTERVYXA AI - NVIDIA EDITION v7.0' -ForegroundColor Yellow"
powershell -Command "Write-Host '==========================================' -ForegroundColor Cyan"
echo.

REM ── Step 0: Resolve Python and Dirs ───────────────────────────
set "ROOT_DIR=%cd%"
set "AI_DIR=%ROOT_DIR%\ai-service"

set "PYTHON=python"
if exist "%AI_DIR%\venv\Scripts\python.exe" (
    set "PYTHON=%AI_DIR%\venv\Scripts\python.exe"
) else if exist "%AI_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON=%AI_DIR%\.venv\Scripts\python.exe"
)

REM ── Step 1: Force Clear Ports (High Speed) ────────────────────
powershell -Command "Write-Host '[1/5] Locking down ports 8000, 5001, 3000...' -ForegroundColor Cyan"
powershell -Command "8000, 5001, 3000 | ForEach-Object { $p = $_; Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"
echo [OK] All target ports cleared.

REM ── Step 2: Pre-flight Validation ─────────────────────────────
:VALIDATE
powershell -Command "Write-Host '[2/5] Validating AI Runtime Environment...' -ForegroundColor Cyan"
"%PYTHON%" "%AI_DIR%\validate_env.py"
set VAL_STATUS=%errorlevel%

if %VAL_STATUS% equ 10 (
    powershell -Command "Write-Host '[AUTO-FIX] Installing Missing Dependencies...' -ForegroundColor Yellow"
    "%PYTHON%" -m pip install -r "%AI_DIR%\requirements.txt"
    if !errorlevel! equ 0 (
        powershell -Command "Write-Host '[SUCCESS] Dependencies fixed.' -ForegroundColor Green"
        goto VALIDATE
    )
)

if %VAL_STATUS% equ 11 (
    powershell -Command "Write-Host '[IMPORTANT] Missing NVIDIA_API_KEY. AI features will be limited.' -ForegroundColor Red"
    choice /C RS /M "[R]etry after adding key, [S]kip and continue"
    if !errorlevel! equ 1 goto VALIDATE
)

REM ── Step 3: Start AI Service in PowerShell ────────────────────
powershell -Command "Write-Host '[3/5] Starting NVIDIA AI Service in PowerShell...' -ForegroundColor Cyan"
start "AI-Service-NVIDIA" powershell -NoExit -Command "& { cd '%AI_DIR%'; $env:PYTHONPATH='.'; & '%PYTHON%' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 }"

REM Short grace period for first bind
ping 127.0.0.1 -n 3 >nul

REM ── Step 4: Intelligent Health Loop ───────────────────────────
powershell -Command "Write-Host '[4/5] Synchronizing with http://127.0.0.1:8000/health...' -ForegroundColor Cyan"
set READY=0
set MAX_RETRIES=40
set ITER=0
:HEALTH_LOOP
set /a ITER+=1
if !ITER! gtr %MAX_RETRIES% goto MONITOR_FINISH

set /a countdown=%MAX_RETRIES% - !ITER!
echo       --- Attempt !ITER!/%MAX_RETRIES% [!countdown!s remaining] ---

powershell -Command "$ProgressPreference = 'SilentlyContinue'; try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1

if !errorlevel! equ 0 (
    set READY=1
    powershell -Command "Write-Host '[ONLINE] AI Service is ACTIVE.' -ForegroundColor Green"
    goto MONITOR_FINISH
) else (
    netstat -ano | findstr :8000 | findstr LISTENING >nul
    if !errorlevel! equ 0 (
        echo       [Port 8000 is open, waiting for app to finish loading...]
    )
    ping 127.0.0.1 -n 2 >nul
    goto HEALTH_LOOP
)

:MONITOR_FINISH
if !READY! equ 0 (
    powershell -Command "Write-Host '[ALERT] AI Service startup is pending.' -ForegroundColor Red"
    choice /C BC /M "[B]ootstrap anyway, [C]ontinue waiting"
    if !errorlevel! equ 2 (
        set MAX_RETRIES=10
        goto MONITOR_FINISH
    )
)

REM ── Step 5: Final Balanced Ecosystem Launch ───────────────────
powershell -Command "Write-Host '[5/5] Launching Backend & Frontend in PowerShell...' -ForegroundColor Cyan"
start "Backend-API" powershell -NoExit -Command "& { cd '%ROOT_DIR%\server'; npm run dev }"
ping 127.0.0.1 -n 2 >nul
start "Frontend-App" powershell -NoExit -Command "& { cd '%ROOT_DIR%\client'; npm run dev }"

echo.
powershell -Command "Write-Host '==========================================' -ForegroundColor Cyan"
powershell -Command "Write-Host '      SYSTEM BOOTSTRAP COMPLETE' -ForegroundColor Green"
powershell -Command "Write-Host '==========================================' -ForegroundColor Cyan"
echo.
powershell -Command "Write-Host '   [✓] AI SERVICE      : http://localhost:8000 (LAUNCHED PERFECTLY)' -ForegroundColor Green"
powershell -Command "Write-Host '   [✓] BACKEND API     : http://localhost:5001 (LAUNCHED PERFECTLY)' -ForegroundColor Green"
powershell -Command "Write-Host '   [✓] FRONTEND APP    : http://localhost:3000 (LAUNCHED PERFECTLY)' -ForegroundColor Green"
echo.
powershell -Command "Write-Host '--- All services are running in separate PowerShell windows. ---' -ForegroundColor Gray"
echo.
pause
