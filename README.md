# ✨ InfoGenie 神奇万事通

> 🎨 一个多功能的聚合软件应用 💬

## 📋 项目概述

InfoGenie 是一个前后端分离的多功能聚合应用，提供实时数据接口、休闲游戏、AI工具等丰富功能。

### 🌐 部署环境

- **前端部署地址**: https://infogenie.shumengya.top
- **后端部署地址**: https://infogenie.api.shumengya.top

### 🏗️ 技术架构

- **前端**: React 18.2.0 + Styled Components + React Router 6.15.0 + Axios
- **后端**: Python Flask 2.3.3 + MongoDB + PyMongo 4.5.0
- **认证**: QQ邮箱验证 + 验证码登录
- **邮件服务**: Flask-Mail + QQ SMTP
- **架构**: 前后端分离，RESTful API
- **部署**: 支持Docker容器化部署

### 🌟 主要功能

#### 📡 60s API 模块
- **热搜榜单**: 抖音、微博、猫眼票房、头条、网易云、知乎、HackerNews等实时热搜
- **日更资讯**: 60秒读懂世界、必应每日壁纸、历史上的今天、每日国际汇率
- **实用功能**: 百度百科词条、公网IP地址、哈希解压压缩、链接OG信息、农历信息、生成二维码、天气预报、EpicGames免费游戏
- **娱乐消遣**: 随机唱歌音频、随机发病文学、随机搞笑段子、随机冷笑话、随机一言、随机运势、随机JavaScript趣味题、随机KFC文案

#### 🎮 小游戏模块
- 2048游戏
- 别踩白方块
- 俄罗斯方块
- 移动端优化
- 即点即玩

#### 🤖 AI模型模块
- AI变量命名助手
- AI写诗小助手
- AI姓名评测
- 需要登录验证

## 🚀 快速开始

### 📋 环境要求

- **Python**: 3.8+
- **Node.js**: 14+
- **MongoDB**: 4.0+
- **npm**: 6.0+

### 📦 安装依赖

#### 后端依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 前端依赖
```bash
cd frontend/react-app
npm install
```

主要依赖包：
- React 18.2.0
- React Router DOM 6.15.0
- Styled Components 6.0.7
- Axios 1.5.0
- React Hot Toast 2.4.1
- React Icons 4.11.0

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
- 邮件服务：通过环境变量 `MAIL_USERNAME` 和 `MAIL_PASSWORD` 设置（支持QQ邮箱）
- 认证配置：支持QQ邮箱验证登录
- CORS配置：在 `app.py` 中配置允许的前端域名

#### 60sAPI配置

60sAPI模块的静态文件位于 `frontend/60sapi` 目录，通过后端的静态文件服务提供访问。

各API模块的接口地址已配置为 `https://infogenie.api.shumengya.top/api/60s`。

#### 项目结构

```
InfoGenie/
├── backend/                 # 后端Python Flask应用
│   ├── app.py              # 主应用入口
│   ├── config.py           # 配置文件
│   ├── requirements.txt    # Python依赖
│   └── modules/            # 功能模块
│       ├── auth.py         # 用户认证
│       ├── api_60s.py      # 60s API接口
│       ├── user_management.py  # 用户管理
│       ├── email_service.py    # 邮件服务
│       ├── smallgame.py    # 小游戏
│       └── aimodelapp.py   # AI模型应用
├── frontend/               # 前端应用
│   ├── react-app/         # React主应用
│   ├── 60sapi/            # 60s API静态页面
│   ├── aimodelapp/        # AI模型应用页面
│   └── smallgame/         # 小游戏页面
└── README.md              # 项目说明
```

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
python app.py
# 后端服务: http://localhost:5002
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
- **演示地址**: https://infogenie.shumengya.top
- **API地址**: https://infogenie.api.shumengya.top
- **反馈邮箱**: 请通过GitHub Issues反馈
- **ICP备案**: 蜀ICP备2025151694号

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

<div align="center">

**✨ 感谢使用 InfoGenie 神奇万事通 ✨**

🎨 *一个多功能的聚合软件应用* 💬

*支持Web、Windows、Android多平台*

</div>

