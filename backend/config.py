#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
InfoGenie 配置文件
Created by: 神奇万事通
Date: 2025-09-02
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """应用配置类"""
    
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'infogenie-secret-key-2025'
    
    # MongoDB 配置
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/InfoGenie'
    
    # Session 配置
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)  # 会话持续7天
    SESSION_COOKIE_SECURE = False  # 开发环境设为False，生产环境设为True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_DOMAIN = None  # 开发环境设为None，生产环境设为具体域名
    SESSION_COOKIE_PATH = '/'
    SESSION_REFRESH_EACH_REQUEST = True  # 每次请求刷新会话过期时间
    
    # 邮件配置
    MAIL_SERVER = 'smtp.qq.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'your-email@qq.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'your-app-password'
    MAIL_DEFAULT_SENDER = ('InfoGenie 神奇万事通', os.environ.get('MAIL_USERNAME') or 'your-email@qq.com')
    
    # API 配置
    API_RATE_LIMIT = '100 per hour'  # API调用频率限制
    
    # 外部API配置
    EXTERNAL_APIS = {
        '60s': [
            'https://60s.api.shumengya.top'
        ]
    }
    
    # 应用信息
    APP_INFO = {
        'name': '✨ 神奇万事通 ✨',
        'description': '🎨 一个多功能的聚合软件应用 💬',
        'author': '👨‍💻 by-神奇万事通',
        'version': '1.0.0',
        'icp': '📄 蜀ICP备2025151694号'
    }

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True

class TestingConfig(Config):
    """测试环境配置"""
    DEBUG = True
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/InfoGenie_Test'

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
