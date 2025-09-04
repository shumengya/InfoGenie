#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
InfoGenie 后端主应用入口
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from datetime import datetime, timedelta
import hashlib
import secrets

# 导入模块
from modules.auth import auth_bp
from modules.api_60s import api_60s_bp
from modules.user_management import user_bp
from modules.email_service import init_mail
from modules.smallgame import smallgame_bp
from modules.aimodelapp import aimodelapp_bp

from config import Config

def create_app():
    """创建Flask应用实例"""
    app = Flask(__name__)
    
    # 加载配置
    app.config.from_object(Config)
    
    # 启用CORS跨域支持
    CORS(app, supports_credentials=True)
    
    # 初始化MongoDB
    mongo = PyMongo(app)
    app.mongo = mongo
    
    # 初始化邮件服务
    init_mail(app)
    
    # 注册蓝图
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_60s_bp, url_prefix='/api/60s')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(smallgame_bp, url_prefix='/api/smallgame')
    app.register_blueprint(aimodelapp_bp, url_prefix='/api/aimodelapp')
    
    # 基础路由
    @app.route('/')
    def index():
        """API根路径"""
        return jsonify({
            'message': '✨ 神奇万事通 API 服务运行中 ✨',
            'version': '1.0.0',
            'timestamp': datetime.now().isoformat(),
            'endpoints': {
                'auth': '/api/auth',
                '60s_api': '/api/60s',
                'user': '/api/user',
                'smallgame': '/api/smallgame',
                'aimodelapp': '/api/aimodelapp'
            }
        })
    
    @app.route('/api/health')
    def health_check():
        """健康检查接口"""
        try:
            # 检查数据库连接
            mongo.db.command('ping')
            db_status = 'connected'
        except Exception as e:
            db_status = f'error: {str(e)}'
        
        return jsonify({
            'status': 'running',
            'database': db_status,
            'timestamp': datetime.now().isoformat()
        })
    
    # 60sapi静态文件服务
    @app.route('/60sapi/<path:filename>')
    def serve_60sapi_files(filename):
        """提供60sapi目录下的静态文件服务"""
        try:
            # 获取项目根目录
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            api_directory = os.path.join(project_root, 'frontend', '60sapi')
            
            # 安全检查：确保文件路径在允许的目录内
            full_path = os.path.join(api_directory, filename)
            if not os.path.commonpath([api_directory, full_path]) == api_directory:
                return jsonify({'error': '非法文件路径'}), 403
            
            # 检查文件是否存在
            if not os.path.exists(full_path):
                return jsonify({'error': '文件不存在'}), 404
            
            # 获取文件目录和文件名
            directory = os.path.dirname(full_path)
            file_name = os.path.basename(full_path)
            
            return send_from_directory(directory, file_name)
            
        except Exception as e:
            return jsonify({'error': f'文件服务错误: {str(e)}'}), 500
    
    # smallgame静态文件服务
    @app.route('/smallgame/<path:filename>')
    def serve_smallgame_files(filename):
        """提供smallgame目录下的静态文件服务"""
        try:
            # 获取项目根目录
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            game_directory = os.path.join(project_root, 'frontend', 'smallgame')
            
            # 安全检查：确保文件路径在允许的目录内
            full_path = os.path.join(game_directory, filename)
            if not os.path.commonpath([game_directory, full_path]) == game_directory:
                return jsonify({'error': '非法文件路径'}), 403
            
            # 检查文件是否存在
            if not os.path.exists(full_path):
                return jsonify({'error': '文件不存在'}), 404
            
            # 获取文件目录和文件名
            directory = os.path.dirname(full_path)
            file_name = os.path.basename(full_path)
            
            return send_from_directory(directory, file_name)
            
        except Exception as e:
            return jsonify({'error': f'文件服务错误: {str(e)}'}), 500
    
    # aimodelapp静态文件服务
    @app.route('/aimodelapp/<path:filename>')
    def serve_aimodelapp_files(filename):
        """提供aimodelapp目录下的静态文件服务"""
        try:
            # 获取项目根目录
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ai_directory = os.path.join(project_root, 'frontend', 'aimodelapp')
            
            # 安全检查：确保文件路径在允许的目录内
            full_path = os.path.join(ai_directory, filename)
            if not os.path.commonpath([ai_directory, full_path]) == ai_directory:
                return jsonify({'error': '非法文件路径'}), 403
            
            # 检查文件是否存在
            if not os.path.exists(full_path):
                return jsonify({'error': '文件不存在'}), 404
            
            # 获取文件目录和文件名
            directory = os.path.dirname(full_path)
            file_name = os.path.basename(full_path)
            
            return send_from_directory(directory, file_name)
            
        except Exception as e:
            return jsonify({'error': f'文件服务错误: {str(e)}'}), 500
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'API接口不存在',
            'message': '请检查请求路径是否正确'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': '服务器内部错误',
            'message': '请稍后重试或联系管理员'
        }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 启动 InfoGenie 后端服务...")
    print("📡 API地址: http://localhost:5000")
    print("📚 文档地址: http://localhost:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)
