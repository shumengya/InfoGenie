#!/bin/bash
set -e

echo "======================================"
echo "  InfoGenie Docker 容器启动脚本"
echo "======================================"
echo ""

echo "[1/2] 检查环境..."
if [ ! -f "InfoGenie-backend/.env" ]; then
    echo "❌ 错误: 未找到 InfoGenie-backend/.env 文件"
    echo "请先创建环境变量配置文件"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker"
    exit 1
fi
echo "✅ 环境检查通过"

echo ""
echo "[2/2] 启动容器..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ 启动失败"
    exit 1
fi

echo ""
echo "✅ 容器启动成功!"
echo ""
echo "📝 服务信息:"
echo "  访问地址: http://localhost:2323"
echo "  API地址: http://localhost:2323/api"
echo "  健康检查: http://localhost:2323/health"
echo ""
echo "📊 查看日志:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 停止服务:"
echo "  docker-compose down"
echo ""
