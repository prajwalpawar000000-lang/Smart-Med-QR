@echo off
title Smart MED QR - Live Public Server
echo ========================================================
echo   Starting Smart MED QR Live Public Server...
echo ========================================================
set PATH=C:\Users\Super Computers\.gemini\antigravity\tools\node\node-v20.18.0-win-x64;C:\Users\Super Computers\.gemini\antigravity\tools\cloudflared;%PATH%

start /B node server.js
timeout /t 2 /nobreak >nul
start cloudflared.exe tunnel --url http://127.0.0.1:5173
pause
