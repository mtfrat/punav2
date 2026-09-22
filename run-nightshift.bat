@echo off
title Nightshift AI - Turno Nocturno
echo ===================================================
echo   🌙 Iniciando Turno Nocturno de Nightshift AI
echo ===================================================
cd /d "%~dp0"
npm run nightshift
echo.
echo ===================================================
echo   ✔ Turno finalizado. Revisa la carpeta reports/
echo ===================================================
pause
