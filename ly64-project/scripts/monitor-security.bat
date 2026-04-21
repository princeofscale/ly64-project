@echo off
REM Security Monitoring Script for Lyceum 64
REM Shows recent security events

echo ========================================
echo   LYCEUM 64 - Security Monitor
echo ========================================
echo.

:menu
echo [1] Show last 20 security events
echo [2] Show failed login attempts
echo [3] Show admin actions
echo [4] Show SQL injection attempts
echo [5] Show blocked IPs
echo [6] Show rate limit violations
echo [7] Real-time monitoring (tail)
echo [8] Security summary
echo [0] Exit
echo.

set /p choice="Select option: "

if "%choice%"=="1" goto last_events
if "%choice%"=="2" goto failed_logins
if "%choice%"=="3" goto admin_actions
if "%choice%"=="4" goto sql_attempts
if "%choice%"=="5" goto blocked_ips
if "%choice%"=="6" goto rate_limits
if "%choice%"=="7" goto real_time
if "%choice%"=="8" goto summary
if "%choice%"=="0" goto end

echo Invalid option!
goto menu

:last_events
echo.
echo === Last 20 Security Events ===
powershell "Get-Content logs\security-audit.log -Tail 20"
echo.
pause
goto menu

:failed_logins
echo.
echo === Failed Login Attempts ===
findstr "LOGIN_FAILED" logs\security-audit.log 2>nul
if errorlevel 1 echo No failed login attempts found.
echo.
pause
goto menu

:admin_actions
echo.
echo === Admin Actions ===
findstr "ADMIN_ACTION" logs\security-audit.log 2>nul
if errorlevel 1 echo No admin actions found.
echo.
pause
goto menu

:sql_attempts
echo.
echo === SQL Injection Attempts ===
findstr "SQL_INJECTION" logs\security-audit.log 2>nul
if errorlevel 1 echo No SQL injection attempts found.
echo.
pause
goto menu

:blocked_ips
echo.
echo === Blocked Login Attempts ===
findstr "LOGIN_BLOCKED" logs\security-audit.log 2>nul
if errorlevel 1 echo No blocked login attempts found.
echo.
pause
goto menu

:rate_limits
echo.
echo === Rate Limit Violations ===
findstr "RATE_LIMIT" logs\security-audit.log 2>nul
if errorlevel 1 echo No rate limit violations found.
echo.
pause
goto menu

:real_time
echo.
echo === Real-time Security Log (Ctrl+C to stop) ===
powershell "Get-Content logs\security-audit.log -Wait"
goto menu

:summary
echo.
echo === Security Summary ===
echo.
echo Total events in security log:
find /c /v "" logs\security-audit.log 2>nul

echo.
echo Failed logins:
findstr /c "LOGIN_FAILED" logs\security-audit.log 2>nul | find /c /v ""

echo.
echo Successful logins:
findstr /c "LOGIN_SUCCESS" logs\security-audit.log 2>nul | find /c /v ""

echo.
echo Blocked accounts:
findstr /c "LOGIN_BLOCKED" logs\security-audit.log 2>nul | find /c /v ""

echo.
echo Admin actions:
findstr /c "ADMIN_ACTION" logs\security-audit.log 2>nul | find /c /v ""

echo.
echo SQL injection attempts:
findstr /c "SQL_INJECTION" logs\security-audit.log 2>nul | find /c /v ""

echo.
echo XSS attempts:
findstr /c "XSS_ATTEMPT" logs\security-audit.log 2>nul | find /c /v ""

echo.
echo Rate limit violations:
findstr /c "RATE_LIMIT" logs\security-audit.log 2>nul | find /c /v ""

echo.
pause
goto menu

:end
echo.
echo Goodbye!
timeout /t 2
