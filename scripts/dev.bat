@echo off
REM ============================================================
REM Shiyun Fangge - Windows dev server launcher
REM
REM Why: in some environments (e.g. Kimi Work preview), the
REM `node` found via PATH is a cmd shim that depends on the
REM KIMI_DESKTOP_RUNTIME_NODE env var. That variable may be
REM missing or point to a GUI exe in child processes, causing
REM instant startup failure. This script locates a real
REM node.exe itself and also logs the launch environment to
REM launch-debug.log for troubleshooting.
REM ============================================================
setlocal

set "LOG=%~dp0..\launch-debug.log"
echo. >> "%LOG%"
echo ===== %DATE% %TIME% args: %* ===== >> "%LOG%"
echo KIMI_DESKTOP_RUNTIME_NODE=[%KIMI_DESKTOP_RUNTIME_NODE%] >> "%LOG%"
echo LOCALAPPDATA=[%LOCALAPPDATA%] >> "%LOG%"

set "NODE_EXE="
if defined REAL_NODE_DIR if exist "%REAL_NODE_DIR%\node.exe" set "NODE_EXE=%REAL_NODE_DIR%\node.exe"
if not defined NODE_EXE if defined LOCALAPPDATA if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined NODE_EXE if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not defined NODE_EXE set "NODE_EXE=node"

echo NODE_EXE=[%NODE_EXE%] >> "%LOG%"

"%NODE_EXE%" "%~dp0dev.mjs" %*
set "RC=%errorlevel%"
echo exit code: %RC% >> "%LOG%"
exit /b %RC%
