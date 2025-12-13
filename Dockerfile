# InfoGenie 统一 Docker 镜像
# 多阶段构建：前端构建 + 后端 + Nginx

# 阶段1: 前端构建
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend
COPY InfoGenie-frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY InfoGenie-frontend/ ./
RUN npm run build

# 阶段2: 最终镜像
FROM python:3.10-slim

# 安装 Nginx 和必要的工具
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制后端代码
COPY InfoGenie-backend/ ./backend/

# 安装 Python 依赖
RUN pip install --no-cache-dir -r ./backend/requirements.txt gunicorn

# 复制前端构建产物到 Nginx 目录
COPY --from=frontend-builder /frontend/build /usr/share/nginx/html

# 创建持久化数据目录
RUN mkdir -p /app/data/logs

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# 复制 Supervisor 配置
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 复制启动脚本
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 暴露端口
EXPOSE 2323

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# 使用 supervisor 管理多进程
ENTRYPOINT ["/entrypoint.sh"]
