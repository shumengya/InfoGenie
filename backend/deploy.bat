@echo off
echo ===== 开始部署后端应用到生产环境 =====

cd /d "%~dp0"

echo 1. 安装依赖...
pip install -r requirements.txt

echo 2. 部署说明：
echo.
echo 请确保以下配置已完成：
echo 1. 在服务器上配置环境变量或创建 .env 文件，包含以下内容：
echo    MONGO_URI=你的MongoDB连接字符串
echo    MAIL_USERNAME=你的邮箱地址
echo    MAIL_PASSWORD=你的邮箱授权码
echo    SECRET_KEY=你的应用密钥
echo.
echo 3. 启动后端服务：
echo    在生产环境中，建议使用 Gunicorn 或 uWSGI 作为 WSGI 服务器
echo    示例命令：gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
echo.
echo 4. 配置反向代理：
echo    将 https://infogenie.api.shumengya.top 反向代理到后端服务
echo.
echo ===== 后端应用部署准备完成 =====

pause