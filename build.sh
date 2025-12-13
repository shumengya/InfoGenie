#!/bin/bash
set -e

echo "======================================"
echo "  InfoGenie Docker 镜像构建脚本"
echo "======================================"
echo ""

echo "[1/3] 检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker，请先安装 Docker"
    exit 1
fi
echo "✅ Docker 环境正常"

echo ""
echo "[2/3] 构建 Docker 镜像..."
docker build -t infogenie:latest .

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 镜像构建成功"

echo ""
echo "[3/3] 构建完成!"
echo ""
echo "📦 镜像名称: infogenie:latest"
echo ""
echo "使用以下命令启动容器:"
echo "  docker-compose up -d"
echo ""
echo "或使用 start.sh 脚本启动"
echo ""
