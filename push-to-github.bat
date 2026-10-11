@echo off
title Push MedQR to GitHub
echo ====================================================
echo  Connecting Smart MED QR to GitHub Repository
echo  Target: https://github.com/prajwalpawar000000-lang/Smart-Med-QR.git
echo ====================================================
echo.

set "GIT_PATH=C:\Users\Super Computers\.gemini\antigravity\tools\git\cmd\git.exe"

if not exist "%GIT_PATH%" (
    set "GIT_PATH=git"
)

echo [1/3] Verifying git status...
"%GIT_PATH%" status

echo.
echo [2/3] Setting remote origin...
"%GIT_PATH%" remote remove origin 2>nul
"%GIT_PATH%" remote add origin https://github.com/prajwalpawar000000-lang/Smart-Med-QR.git
"%GIT_PATH%" branch -M main

echo.
echo [3/3] Pushing to GitHub (main branch)...
echo.
echo If prompted, please sign in with your GitHub account or paste your Personal Access Token.
echo.

"%GIT_PATH%" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ====================================================
    echo SUCCESS! Your project is now live on GitHub:
    echo https://github.com/prajwalpawar000000-lang/Smart-Med-QR
    echo ====================================================
) else (
    echo ====================================================
    echo Push incomplete. If you need a Personal Access Token:
    echo 1. Go to https://github.com/settings/tokens
    echo 2. Generate a classic token with 'repo' scope
    echo 3. Paste the token when prompted for password
    echo ====================================================
)

pause
