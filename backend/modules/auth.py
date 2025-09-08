#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
用户认证模块
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
import re
from datetime import datetime
from .email_service import send_verification_email, verify_code, is_qq_email, get_qq_avatar_url

auth_bp = Blueprint('auth', __name__)

def validate_qq_email(email):
    """验证QQ邮箱格式"""
    return is_qq_email(email)

def validate_password(password):
    """验证密码格式（6-20位）"""
    return 6 <= len(password) <= 20

@auth_bp.route('/send-verification', methods=['POST'])
def send_verification():
    """发送验证码邮件"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        verification_type = data.get('type', 'register')  # register, login
        
        # 参数验证
        if not email:
            return jsonify({
                'success': False,
                'message': '邮箱地址不能为空'
            }), 400
        
        if not validate_qq_email(email):
            return jsonify({
                'success': False,
                'message': '仅支持QQ邮箱（qq.com、vip.qq.com、foxmail.com）'
            }), 400
        
        # 获取数据库集合
        db = current_app.mongo.db
        users_collection = db.userdata
        
        # 检查邮箱是否已注册
        existing_user = users_collection.find_one({'邮箱': email})
        
        if verification_type == 'register' and existing_user:
            return jsonify({
                'success': False,
                'message': '该邮箱已被注册'
            }), 409
        
        if verification_type == 'login' and not existing_user:
            return jsonify({
                'success': False,
                'message': '该邮箱尚未注册'
            }), 404
        
        # 发送验证码
        result = send_verification_email(email, verification_type)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        current_app.logger.error(f"发送验证码失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '发送失败，请稍后重试'
        }), 500

@auth_bp.route('/verify-code', methods=['POST'])
def verify_verification_code():
    """验证验证码"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        code = data.get('code', '').strip()
        
        # 参数验证
        if not email or not code:
            return jsonify({
                'success': False,
                'message': '邮箱和验证码不能为空'
            }), 400
        
        # 验证码校验
        result = verify_code(email, code)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        current_app.logger.error(f"验证码校验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '验证失败，请稍后重试'
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册（需要先验证邮箱）"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        code = data.get('code', '').strip()
        
        # 参数验证
        if not all([email, username, password, code]):
            return jsonify({
                'success': False,
                'message': '所有字段都不能为空'
            }), 400
        
        if not validate_qq_email(email):
            return jsonify({
                'success': False,
                'message': '仅支持QQ邮箱注册'
            }), 400
        
        if not validate_password(password):
            return jsonify({
                'success': False,
                'message': '密码长度必须在6-20位之间'
            }), 400
        
        # 验证验证码
        verify_result = verify_code(email, code)
        if not verify_result['success'] or verify_result.get('type') != 'register':
            return jsonify({
                'success': False,
                'message': '验证码无效或已过期'
            }), 400
        
        # 获取数据库集合
        db = current_app.mongo.db
        users_collection = db.userdata
        
        # 检查邮箱是否已被注册
        if users_collection.find_one({'邮箱': email}):
            return jsonify({
                'success': False,
                'message': '该邮箱已被注册'
            }), 409
        
        # 检查用户名是否已被使用
        if users_collection.find_one({'用户名': username}):
            return jsonify({
                'success': False,
                'message': '该用户名已被使用'
            }), 409
        
        # 获取QQ头像
        avatar_url = get_qq_avatar_url(email)
        
        # 创建新用户
        password_hash = generate_password_hash(password)
        user_data = {
            '邮箱': email,
            '用户名': username,
            '密码': password_hash,
            '头像': avatar_url,
            '注册时间': datetime.now().isoformat(),
            '最后登录': None,
            '登录次数': 0,
            '用户状态': 'active'
        }
        
        result = users_collection.insert_one(user_data)
        
        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': '注册成功！',
                'user': {
                    'email': email,
                    'username': username,
                    'avatar': avatar_url
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': '注册失败，请稍后重试'
            }), 500
            
    except Exception as e:
        current_app.logger.error(f"注册失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '注册失败，请稍后重试'
        }), 500
        
        if existing_user:
            return jsonify({
                'success': False,
                'message': '该账号已被注册'
            }), 409
        
        # 创建新用户
        password_hash = generate_password_hash(password)
        user_data = {
            '账号': account,
            '密码': password_hash,
            '注册时间': datetime.now().isoformat(),
            '最后登录': None,
            '登录次数': 0,
            '用户状态': 'active'
        }
        
        result = users_collection.insert_one(user_data)
        
        if result.inserted_id:
            return jsonify({
                'success': True,
                'message': '注册成功！'
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': '注册失败，请稍后重试'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录（支持邮箱+验证码或邮箱+密码）"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        code = data.get('code', '').strip()
        
        # 参数验证
        if not email:
            return jsonify({
                'success': False,
                'message': '邮箱地址不能为空'
            }), 400
        
        if not validate_qq_email(email):
            return jsonify({
                'success': False,
                'message': '仅支持QQ邮箱登录'
            }), 400
        
        # 获取数据库集合
        db = current_app.mongo.db
        users_collection = db.userdata
        
        # 查找用户
        user = users_collection.find_one({'邮箱': email})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '该邮箱尚未注册'
            }), 404
        
        # 检查用户状态
        if user.get('用户状态') != 'active':
            return jsonify({
                'success': False,
                'message': '账号已被禁用，请联系管理员'
            }), 403
        
        # 验证方式：验证码登录或密码登录
        if code:
            # 验证码登录
            verify_result = verify_code(email, code)
            if not verify_result['success'] or verify_result.get('type') != 'login':
                return jsonify({
                    'success': False,
                    'message': '验证码无效或已过期'
                }), 400
        elif password:
            # 密码登录
            if not check_password_hash(user['密码'], password):
                return jsonify({
                    'success': False,
                    'message': '密码错误'
                }), 401
        else:
            return jsonify({
                'success': False,
                'message': '请输入密码或验证码'
            }), 400
        
        # 登录成功，更新用户信息
        users_collection.update_one(
            {'邮箱': email},
            {
                '$set': {'最后登录': datetime.now().isoformat()},
                '$inc': {'登录次数': 1}
            }
        )
        
        # 设置会话
        session['user_id'] = str(user['_id'])
        session['email'] = email
        session['username'] = user.get('用户名', '')
        session['logged_in'] = True
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': '登录成功！',
            'user': {
                'id': str(user['_id']),
                'email': email,
                'username': user.get('用户名', ''),
                'avatar': user.get('头像', ''),
                'login_count': user.get('登录次数', 0) + 1
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"登录失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '登录失败，请稍后重试'
        }), 500
        
        # 登录成功，创建会话
        session['user_id'] = str(user['_id'])
        session['account'] = user['账号']
        session['logged_in'] = True
        
        # 更新登录信息
        users_collection.update_one(
            {'_id': user['_id']},
            {
                '$set': {'最后登录': datetime.now().isoformat()},
                '$inc': {'登录次数': 1}
            }
        )
        
        return jsonify({
            'success': True,
            'message': '登录成功！',
            'user': {
                'account': user['账号'],
                'last_login': user.get('最后登录'),
                'login_count': user.get('登录次数', 0) + 1
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用户登出"""
    try:
        if 'logged_in' in session:
            session.clear()
            return jsonify({
                'success': True,
                'message': '已成功登出'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '用户未登录'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@auth_bp.route('/check', methods=['GET'])
def check_login():
    """检查登录状态"""
    try:
        if session.get('logged_in') and session.get('user_id'):
            return jsonify({
                'success': True,
                'logged_in': True,
                'user': {
                    'id': session.get('user_id'),
                    'email': session.get('email'),
                    'username': session.get('username')
                }
            }), 200
        else:
            return jsonify({
                'success': True,
                'logged_in': False
            }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500
