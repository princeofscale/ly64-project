@echo off
REM Lyceum 64 - Git Automation Script for Windows
REM Автоматически добавляет изменения, создает коммит с описанием и пушит на GitHub

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Lyceum 64 - Git Push Automation
echo ========================================
echo.

REM Check if we're in a git repository
if not exist ".git\" (
    echo [ERROR] Not a git repository
    exit /b 1
)

REM Check if there are any changes
git status --porcelain > temp_status.txt
for %%A in (temp_status.txt) do set SIZE=%%~zA
if %SIZE%==0 (
    echo [WARNING] No changes to commit
    del temp_status.txt
    exit /b 0
)

echo [INFO] Analyzing changes...
echo.

REM Show git status
git status --short

echo.

REM Count changes
set /a NEW_FILES=0
set /a MODIFIED_FILES=0
set /a DELETED_FILES=0

for /f "tokens=1,* delims= " %%a in (temp_status.txt) do (
    if "%%a"=="??" set /a NEW_FILES+=1
    if "%%a"=="M" set /a MODIFIED_FILES+=1
    if "%%a"=="D" set /a DELETED_FILES+=1
)

REM Generate commit message
set "COMMIT_MSG=Обновление проекта"

if %NEW_FILES% GTR 0 (
    set "COMMIT_MSG=!COMMIT_MSG! (добавлено: %NEW_FILES%)"
)

if %MODIFIED_FILES% GTR 0 (
    set "COMMIT_MSG=!COMMIT_MSG! (изменено: %MODIFIED_FILES%)"
)

if %DELETED_FILES% GTR 0 (
    set "COMMIT_MSG=!COMMIT_MSG! (удалено: %DELETED_FILES%)"
)

del temp_status.txt

echo [INFO] Generated commit message:
echo    %COMMIT_MSG%
echo.

REM Ask for confirmation
set /p CHOICE="Use this message? (y/n/custom): "

if /i "%CHOICE%"=="n" (
    echo [INFO] Operation cancelled
    exit /b 0
)

if /i "%CHOICE%"=="custom" (
    set /p COMMIT_MSG="Enter your commit message: "
    echo.
)

echo [OK] Git add .
git add .

echo [OK] Git commit
git commit -m "%COMMIT_MSG%

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo.
echo [INFO] Pushing to GitHub...

REM Check if remote is set
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Remote 'origin' not found. Adding remote...
    git remote add origin https://github.com/princeofscale/ly64-project.git
)

REM Get current branch
for /f "tokens=*" %%a in ('git branch --show-current') do set CURRENT_BRANCH=%%a

echo [INFO] Pushing branch: %CURRENT_BRANCH%

REM Push to remote
git push -u origin %CURRENT_BRANCH%

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to push to GitHub
    echo [INFO] You may need to run: git push --set-upstream origin %CURRENT_BRANCH%
    exit /b 1
) else (
    echo.
    echo [OK] Successfully pushed to GitHub!
    echo [INFO] Repository: https://github.com/princeofscale/ly64-project
    echo.
)

pause
