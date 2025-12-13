#!/bin/bash
set -e

echo "======================================"
echo "  InfoGenie Docker 容器停止脚本"
echo "======================================"
echo ""

echo "正在停止容器..."
docker-compose down

if [ $? -ne 0 ]; then
    echo "❌ 停止失败"
    exit 1
fi

echo ""
echo "✅ 容器已停止"
echo ""
