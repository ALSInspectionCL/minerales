@REM powershell -File "start_api.ps1"

@echo off
start "Angular" cmd /k "start_local.sh"
powershell -File "start_api.ps1"