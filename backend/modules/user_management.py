#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
用户管理模块
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime
from bson import ObjectId

user_bp = Blueprint('user', __name__)

def login_required(f):
    """登录验证装饰器"""
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({
                'success': False,
                'message': '请先登录'
            }), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@user_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """获取用户资料"""
    try:
        user_id = session.get('user_id')
        users_collection = current_app.mongo.db.userdata
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        # 返回用户信息（不包含密码）
        profile = {
            'account': user['账号'],
            'register_time': user.get('注册时间'),
            'last_login': user.get('最后登录'),
            'login_count': user.get('登录次数', 0),
            'status': user.get('用户状态', 'active')
        }
        
        return jsonify({
            'success': True,
            'data': profile
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@user_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """修改密码"""
    try:
        data = request.get_json()
        old_password = data.get('old_password', '').strip()
        new_password = data.get('new_password', '').strip()
        
        if not old_password or not new_password:
            return jsonify({
                'success': False,
                'message': '旧密码和新密码不能为空'
            }), 400
        
        if len(new_password) < 6 or len(new_password) > 20:
            return jsonify({
                'success': False,
                'message': '新密码长度必须在6-20位之间'
            }), 400
        
        user_id = session.get('user_id')
        users_collection = current_app.mongo.db.userdata
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        from werkzeug.security import check_password_hash, generate_password_hash
        
        # 验证旧密码
        if not check_password_hash(user['密码'], old_password):
            return jsonify({
                'success': False,
                'message': '原密码错误'
            }), 401
        
        # 更新密码
        new_password_hash = generate_password_hash(new_password)
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'密码': new_password_hash}}
        )
        
        if result.modified_count > 0:
            return jsonify({
                'success': True,
                'message': '密码修改成功'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '密码修改失败'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@user_bp.route('/stats', methods=['GET'])
@login_required
def get_user_stats():
    """获取用户统计信息"""
    try:
        user_id = session.get('user_id')
        
        # 这里可以添加更多统计信息，比如API调用次数等
        stats = {
            'login_today': 1,  # 今日登录次数
            'api_calls_today': 0,  # 今日API调用次数
            'total_api_calls': 0,  # 总API调用次数
            'join_days': 1,  # 加入天数
            'last_activity': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@user_bp.route('/delete', methods=['POST'])
@login_required
def delete_account():
    """删除账户"""
    try:
        data = request.get_json()
        password = data.get('password', '').strip()
        
        if not password:
            return jsonify({
                'success': False,
                'message': '请输入密码确认删除'
            }), 400
        
        user_id = session.get('user_id')
        users_collection = current_app.mongo.db.userdata
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        from werkzeug.security import check_password_hash
        
        # 验证密码
        if not check_password_hash(user['密码'], password):
            return jsonify({
                'success': False,
                'message': '密码错误'
            }), 401
        
        # 删除用户
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        
        if result.deleted_count > 0:
            # 清除会话
            session.clear()
            
            return jsonify({
                'success': True,
                'message': '账户已成功删除'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '删除失败'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500
