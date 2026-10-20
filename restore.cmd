@echo off
setlocal
set "HERE=%~dp0"
call :findnode
if errorlevel 1 (
  echo.
  echo Node.js 20 or newer was not found, and no bundled runtime was located.
  echo Quit DeepSeek Harness, then run:
  echo    node "%HERE%bin\cli.mjs" restore
  echo.
  pause
  exit /b 1
)
echo Using %NODE%
echo.
"%NODE%" "%HERE%bin\cli.mjs" restore %*
set "CODE=%ERRORLEVEL%"
echo.
if "%CODE%"=="0" (
  echo Restart DeepSeek Harness to get the black whale back.
) else if "%CODE%"=="2" (
  echo Quit DeepSeek Harness completely, then run restore.cmd again.
)
pause
exit /b %CODE%

:findnode
set "NODE="
for %%n in (node.exe) do if not defined NODE if exist "%%~$PATH:n" set "NODE=%%~$PATH:n"
if defined NODE exit /b 0
if exist "%ProgramFiles%\DeepSeek Harness\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" set "NODE=%ProgramFiles%\DeepSeek Harness\resources\runtime\primary-runtime\dependencies\node\bin\node.exe"
if defined NODE exit /b 0
if exist "%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" set "NODE=%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\primary-runtime\dependencies\node\bin\node.exe"
if defined NODE exit /b 0
if exist "%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" set "NODE=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if defined NODE exit /b 0
exit /b 1
