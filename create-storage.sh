#!/bin/bash

echo "======================================"
echo "  创建持久化存储目录"
echo "======================================"
echo ""

STORAGE_PATH="/shumengya/docker/storage/infogenie"

echo "正在创建目录: $STORAGE_PATH"
echo ""

# 创建目录
sudo mkdir -p $STORAGE_PATH/logs
sudo mkdir -p $STORAGE_PATH/data

# 设置权限
sudo chmod -R 755 $STORAGE_PATH

if [ -d "$STORAGE_PATH/logs" ]; then
    echo "✅ 创建成功: $STORAGE_PATH/logs"
else
    echo "❌ 创建失败: $STORAGE_PATH/logs"
fi

if [ -d "$STORAGE_PATH/data" ]; then
    echo "✅ 创建成功: $STORAGE_PATH/data"
else
    echo "❌ 创建失败: $STORAGE_PATH/data"
fi

echo ""
echo "持久化存储目录结构:"
echo "$STORAGE_PATH"
echo "  ├── logs/  (应用日志文件)"
echo "  └── data/  (应用数据文件)"
echo ""
