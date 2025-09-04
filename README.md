# ✨ InfoGenie 神奇万事通

> 🎨 一个多功能的聚合软件应用 💬

## 📋 项目概述

InfoGenie 是一个前后端分离的多功能聚合应用，提供实时数据接口、休闲游戏、AI工具等丰富功能。

### 🌐 部署环境

- **前端部署地址**: https://infogenie.shumengya.top
- **后端部署地址**: https://infogenie.api.shumengya.top

### 🏗️ 技术架构

- **前端**: React + Styled Components + React Router
- **后端**: Python Flask + MongoDB + PyMongo
- **架构**: 前后端分离，RESTful API
- **部署**: 支持Docker容器化部署

### 🌟 主要功能

#### 📡 60s API 模块
- **热搜榜单**: 抖音、微博、猫眼票房、HackerNews等
- **日更资讯**: 60秒读懂世界、必应壁纸、历史今天、汇率信息
- **实用功能**: 天气查询、百科搜索、农历信息、二维码生成
- **娱乐消遣**: 随机一言、音频、趣味题、文案生成

#### 🎮 小游戏模块
- 经典游戏合集（开发中）
- 移动端优化
- 即点即玩

#### 🤖 AI模型模块
- AI对话助手（开发中）
- 智能文本生成（开发中）
- 图像识别分析（规划中）
- 需要登录验证

## 🚀 快速开始

### 📋 环境要求

- **Python**: 3.8+
- **Node.js**: 14+
- **MongoDB**: 4.0+

### 📦 安装依赖

#### 后端依赖
```bash
cd backend
pip install -r requirements.txt
```

## 🚢 部署指南

### 🖥️ 前端部署

1. 进入前端目录：`cd frontend/react-app`
2. 安装依赖：`npm install`
3. 构建生产环境应用：`npm run build`
4. 将 `build` 目录下的所有文件上传到前端服务器的网站根目录

也可以直接运行 `frontend/react-app/deploy.bat` 脚本进行构建。

### ⚙️ 后端部署

1. 进入后端目录：`cd backend`
2. 安装依赖：`pip install -r requirements.txt`
3. 配置环境变量或创建 `.env` 文件，包含以下内容：
   ```
   MONGO_URI=你的MongoDB连接字符串
   MAIL_USERNAME=你的邮箱地址
   MAIL_PASSWORD=你的邮箱授权码
   SECRET_KEY=你的应用密钥
   SESSION_COOKIE_SECURE=True
   ```
4. 使用 Gunicorn 或 uWSGI 作为 WSGI 服务器启动应用：
   ```
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
   ```
5. 配置反向代理，将 `https://infogenie.api.shumengya.top` 反向代理到后端服务

也可以参考 `backend/deploy.bat` 脚本中的部署说明。

### ⚙️ 配置说明

#### 前端配置

前端通过环境变量配置API基础URL：

- 开发环境：`.env.development` 文件中设置 `REACT_APP_API_URL=http://localhost:5000`
- 生产环境：`.env.production` 文件中设置 `REACT_APP_API_URL=https://infogenie.api.shumengya.top`

#### 后端配置

后端通过 `config.py` 和环境变量进行配置：

- MongoDB连接：通过环境变量 `MONGO_URI` 设置
- 邮件服务：通过环境变量 `MAIL_USERNAME` 和 `MAIL_PASSWORD` 设置
- CORS配置：在 `app.py` 中配置允许的前端域名

#### 60sAPI配置

60sAPI模块的静态文件位于 `frontend/60sapi` 目录，通过后端的静态文件服务提供访问。

各API模块的接口地址已配置为 `https://infogenie.api.shumengya.top/api/60s`。

#### 前端依赖
```bash
cd frontend/react-app
npm install
```

### 🎯 启动服务

#### 方式一：使用启动器（推荐）
```bash
# 双击运行 启动器.bat
# 选择相应的启动选项
```

#### 方式二：手动启动

**启动后端服务**
```bash
cd backend
python run.py
# 后端服务: http://localhost:5000
```

**启动前端服务**
```bash
cd frontend/react-app
npm start
# 前端服务: http://localhost:3000
```

## 📞 联系方式

- **开发者**: 神奇万事通
- **项目地址**: https://github.com/shumengya/InfoGenie
- **反馈邮箱**: 请通过GitHub Issues反馈

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

<div align="center">

**✨ 感谢使用 InfoGenie 神奇万事通 ✨**

🎨 *一个多功能的聚合软件应用* 💬

</div>
神奇万事通，一个支持Windows，Android和web的app，聚合了许多神奇有趣的功能，帮助用户一键化解决问题
前端使用React框架，后端使用Python的Flask框架

