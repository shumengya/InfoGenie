@echo off
chcp 65001 >nul
echo ====================================
echo   InfoGenie Docker 重新构建和部署
echo ====================================
echo.

echo ⚠️  注意: 这将停止当前容器并重新构建镜像
echo.
pause

echo.
echo [1/4] 停止并删除旧容器...
docker-compose down
if errorlevel 1 (
    echo ⚠️  没有运行中的容器
)

echo.
echo [2/4] 删除旧镜像...
docker rmi infogenie:latest 2>nul
if errorlevel 1 (
    echo ℹ️  没有找到旧镜像
)

echo.
echo [3/4] 重新构建镜像（包含最新的前端配置）...
docker build --no-cache -t infogenie:latest .
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo.
echo [4/4] 启动新容器...
docker-compose up -d
if errorlevel 1 (
    echo ❌ 启动失败
    pause
    exit /b 1
)

echo.
echo ✅ 重新构建和部署完成！
echo.
echo 📝 服务信息:
echo   访问地址: http://localhost:2323
echo   API地址: http://localhost:2323/api
echo.
echo 🔍 检查日志:
echo   docker-compose logs -f
echo.
pause
