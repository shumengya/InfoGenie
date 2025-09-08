@echo off
cd /d "e:\Python\InfoGenie\frontend\react-app"
npm run build

npx serve -s build
pause