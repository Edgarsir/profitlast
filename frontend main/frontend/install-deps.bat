@echo off
echo Cleaning up old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Installing fresh dependencies...
npm install

echo Dependencies installed successfully!
pause