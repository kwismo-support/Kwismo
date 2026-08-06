@echo off
setlocal

REM Verifie que Python 3.13 est installe avant de demarrer KWISMO Modele IA.
REM A lancer en premier (double-clic ou depuis un terminal), avant toute
REM autre commande (creation du venv, pip install...).

py -3.13 --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ================================================================
    echo   ERREUR : Python 3.13 est introuvable sur cette machine.
    echo.
    echo   KWISMO Modele IA necessite Python 3.13 pour demarrer.
    echo   Installe-le depuis https://www.python.org/downloads/
    echo   puis relance ce script.
    echo ================================================================
    echo.
    pause
    exit /b 1
)

echo Python 3.13 detecte - OK, tu peux demarrer le projet.
echo.
echo Prochaine etape :
echo   py -3.13 -m venv .venv
echo   .venv\Scripts\activate
echo   pip install -r requirements.txt
echo.
pause
exit /b 0
