# InfoGenie 后端 Docker 部署指南

## 项目概述

InfoGenie 是一个基于 Flask 的 Python 后端应用，提供用户认证、AI 模型应用、小游戏等功能。

## Docker 部署

### 前置要求

- Docker >= 20.0
- Docker Compose >= 2.0

### 快速开始

1. **克隆项目并进入后端目录**
   ```bash
   cd InfoGenie-backend
   ```

2. **设置环境变量**
   ```bash
   cp .env.example .env  # 如果有示例文件
   # 编辑 .env 文件，设置必要的环境变量
   ```

3. **构建并运行**
   ```bash
   # 方法1：使用构建脚本
   ./build_docker.sh

   # 方法2：使用 Docker Compose（推荐）
   docker-compose up -d
   ```

### 环境变量配置

在 `.env` 文件中配置以下变量：

```env
# Flask 配置
SECRET_KEY=your-secret-key-here
FLASK_ENV=production

# MongoDB 配置
MONGO_URI=mongodb://mongodb:27017/InfoGenie

# 邮件配置
MAIL_USERNAME=your-email@qq.com
MAIL_PASSWORD=your-app-password

# AI 配置（可选）
# 在 ai_config.json 中配置 AI API 密钥
```

### 服务端口

- 后端 API: `http://localhost:5002`
- MongoDB: `localhost:27017`
- 健康检查: `http://localhost:5002/api/health`

### Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f infogenie-backend

# 停止服务
docker-compose down

# 重建镜像
docker-compose build --no-cache

# 清理数据卷
docker-compose down -v
```

### 单独构建 Docker 镜像

如果不需要 MongoDB，可以单独构建后端镜像：

```bash
# 构建镜像
docker build -t infogenie-backend:latest .

# 运行容器（需要外部 MongoDB）
docker run -d \
  --name infogenie-backend \
  -p 5002:5002 \
  -e MONGO_URI=mongodb://your-mongo-host:27017/InfoGenie \
  -e SECRET_KEY=your-secret-key \
  infogenie-backend:latest
```

## 项目结构

```
InfoGenie-backend/
├── Dockerfile              # Docker 镜像构建文件
├── docker-compose.yml      # Docker Compose 配置
├── build_docker.sh         # 构建脚本
├── .dockerignore          # Docker 忽略文件
├── app.py                 # Flask 应用主入口
├── config.py              # 应用配置
├── requirements.txt       # Python 依赖
├── ai_config.json         # AI 模型配置
├── modules/               # 功能模块
│   ├── auth.py           # 用户认证
│   ├── user_management.py # 用户管理
│   ├── email_service.py  # 邮件服务
│   └── aimodelapp.py    # AI 模型应用
└── test/                 # 测试文件
```

## 注意事项

1. **安全性**: 生产环境请使用强密码和随机生成的 SECRET_KEY
2. **数据库**: 默认使用 MongoDB 6.0，确保数据持久化
3. **端口**: 如需修改端口，请同时更新 Dockerfile 和 docker-compose.yml
4. **日志**: 应用日志通过 `docker-compose logs` 查看
5. **备份**: 重要数据请定期备份 MongoDB 数据卷

## 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   lsof -i :5002
   # 修改端口映射
   docker-compose up -d --scale infogenie-backend=0
   docker-compose up -d
   ```

2. **数据库连接失败**
   ```bash
   # 检查 MongoDB 状态
   docker-compose ps
   docker-compose logs mongodb
   ```

3. **构建失败**
   ```bash
   # 清理缓存重新构建
   docker system prune -f
   docker-compose build --no-cache
   ```

## 开发环境

本地开发仍可使用原有的 `start_backend.sh` 脚本：

```bash
./start_backend.sh
```

## 许可证

本项目采用 MIT 许可证。
