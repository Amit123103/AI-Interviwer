@echo off
setlocal
cd /d "%~dp0"

echo ══════════════════════════════════════════
echo   AI Service Dependency Fixer
echo ══════════════════════════════════════════
echo.

set PYTHON=
if exist "venv\Scripts\python.exe" (
    set "PYTHON=venv\Scripts\python.exe"
) else if exist ".venv\Scripts\python.exe" (
    set "PYTHON=.venv\Scripts\python.exe"
) else (
    echo [ERROR] Virtual environment not found.
    echo Please ensure you have a venv or .venv folder in ai-service.
    pause
    exit /b 1
)

echo [1/1] Installing all dependencies from requirements.txt...
echo This may take a few minutes as 'torch' and 'openai-whisper' are large.
echo.

"%PYTHON%" -m pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] All dependencies installed successfully!
    echo You can now start the AI service using start_service.bat.
) else (
    echo.
    echo [ERROR] Installation failed. Check your internet connection or Python version.
)

echo.
pause
endlocal
