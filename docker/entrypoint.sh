#!/bin/bash
set -e

echo "🚀 启动 InfoGenie 服务..."

# 创建必要的目录
mkdir -p /app/data/logs

# 检查环境变量
if [ -z "$MONGO_URI" ]; then
    echo "⚠️  警告: MONGO_URI 未设置"
fi

if [ -z "$MAIL_USERNAME" ]; then
    echo "⚠️  警告: MAIL_USERNAME 未设置"
fi

echo "✅ 环境变量检查完成"

# 测试 Nginx 配置
echo "🔍 检查 Nginx 配置..."
nginx -t

# 启动 Supervisor
echo "🎯 启动服务进程..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
