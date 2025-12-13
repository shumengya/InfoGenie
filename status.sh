#!/bin/bash

echo "======================================"
echo "  InfoGenie 系统状态检查"
echo "======================================"
echo ""

echo "[检查 1/5] Docker 环境..."
if command -v docker &> /dev/null; then
    docker --version
    echo "✅ Docker 环境正常"
else
    echo "❌ Docker 未安装或未启动"
fi

echo ""
echo "[检查 2/5] 容器状态..."
if docker ps --filter "name=infogenie" | grep -q infogenie; then
    docker ps --filter "name=infogenie" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo "✅ 容器运行中"
else
    echo "❌ 容器未运行"
fi

echo ""
echo "[检查 3/5] 端口占用..."
if command -v lsof &> /dev/null; then
    if lsof -i :2323 &> /dev/null; then
        echo "⚠️  端口 2323 已被占用"
        lsof -i :2323
    else
        echo "✅ 端口 2323 未被占用"
    fi
else
    if netstat -tuln | grep -q :2323; then
        echo "⚠️  端口 2323 已被占用"
        netstat -tuln | grep :2323
    else
        echo "✅ 端口 2323 未被占用"
    fi
fi

echo ""
echo "[检查 4/5] 持久化目录..."
if [ -d "/shumengya/docker/storage/infogenie/logs" ]; then
    echo "✅ 日志目录存在: /shumengya/docker/storage/infogenie/logs"
else
    echo "❌ 日志目录不存在"
fi

if [ -d "/shumengya/docker/storage/infogenie/data" ]; then
    echo "✅ 数据目录存在: /shumengya/docker/storage/infogenie/data"
else
    echo "❌ 数据目录不存在"
fi

echo ""
echo "[检查 5/5] 环境配置..."
if [ -f "InfoGenie-backend/.env" ]; then
    echo "✅ 环境配置文件存在"
else
    echo "❌ 环境配置文件不存在"
fi

echo ""
echo "======================================"
echo "  检查完成"
echo "======================================"
echo ""

if docker ps --filter "name=infogenie" | grep -q infogenie; then
    echo "📊 服务信息:"
    echo "  访问地址: http://localhost:2323"
    echo "  API地址: http://localhost:2323/api"
    echo ""
    echo "📝 快捷命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: ./stop.sh"
    echo ""
fi
