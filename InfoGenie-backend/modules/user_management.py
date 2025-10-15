#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
用户管理模块
Created by: 万象口袋
Date: 2025-09-02
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from bson import ObjectId
import jwt
from functools import wraps

user_bp = Blueprint('user', __name__)

# 验证JWT token
def verify_token(token):
    """验证JWT token"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return {'success': True, 'data': payload}
    except jwt.ExpiredSignatureError:
        return {'success': False, 'message': 'Token已过期'}
    except jwt.InvalidTokenError:
        return {'success': False, 'message': 'Token无效'}

# 登录验证装饰器（支持JWT token和hwt）
def login_required(f):
    """登录验证装饰器（支持JWT token和hwt）"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 优先检查JWT token
        token = request.headers.get('Authorization')
        if token:
            if token.startswith('Bearer '):
                token = token[7:]
            
            result = verify_token(token)
            if result['success']:
                request.current_user = result['data']
                return f(*args, **kwargs)
        # 回退到hwt验证
        hwt = getattr(request, 'hwt', {})
        if not hwt.get('logged_in'):
            return jsonify({
                'success': False,
                'message': '请先登录'
            }), 401
        return f(*args, **kwargs)
    return decorated_function
    return decorated_function

# 获取用户资料
@user_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """获取用户资料"""
    try:
        # 优先从JWT token获取用户信息
        user_id = None
        if hasattr(request, 'current_user') and request.current_user:
            user_id = request.current_user.get('user_id')
        else:
            # 回退到hwt验证
            hwt = getattr(request, 'hwt', {})
            user_id = hwt.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': '无法获取用户信息'
            }), 401
            
        users_collection = current_app.mongo.db.userdata
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        # 返回用户信息（不包含密码）
        profile = {
            'account': user.get('邮箱'),
            'username': user.get('用户名'),
            'avatar': user.get('头像'),
            'register_time': user.get('注册时间'),
            'last_login': user.get('最后登录'),
            'login_count': user.get('登录次数', 0),
            'status': user.get('用户状态', 'active'),
            'level': user.get('等级', 1),
            'experience': user.get('经验', 0),
            'coins': user.get('萌芽币', 0)
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

# 修改密码
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
        
        hwt = getattr(request, 'hwt', {})
        user_id = hwt.get('user_id')
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

# 获取用户统计信息
@user_bp.route('/stats', methods=['GET'])
@login_required
def get_user_stats():
    """获取用户统计信息"""
    try:
        hwt = getattr(request, 'hwt', {})
        user_id = hwt.get('user_id')
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

# 获取用户游戏数据
@user_bp.route('/game-data', methods=['GET'])
@login_required
def get_user_game_data():
    """获取用户游戏数据"""
    try:
        # 优先从JWT token获取用户ID
        if hasattr(request, 'current_user'):
            user_id = request.current_user['user_id']
        else:
            hwt = getattr(request, 'hwt', {})
            user_id = hwt.get('user_id')
            
        users_collection = current_app.mongo.db.userdata
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        # 返回用户游戏数据
        game_data = {
            'level': user.get('等级', 0),
            'experience': user.get('经验', 0),
            'coins': user.get('萌芽币', 0),
            'checkin_system': user.get('签到系统', {
                '连续签到天数': 0,
                '今日是否已签到': False,
                '签到时间': '2025-01-01'
            })
        }
        
        return jsonify({
            'success': True,
            'data': game_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

# 每日签到
@user_bp.route('/checkin', methods=['POST'])
@login_required
def daily_checkin():
    """每日签到"""
    try:
        # 优先从JWT token获取用户ID
        if hasattr(request, 'current_user'):
            user_id = request.current_user['user_id']
        else:
            hwt = getattr(request, 'hwt', {})
            user_id = hwt.get('user_id')
            
        users_collection = current_app.mongo.db.userdata
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        # 获取当前日期
        today = datetime.now().strftime('%Y-%m-%d')
        
        # 获取签到系统数据
        checkin_system = user.get('签到系统', {
            '连续签到天数': 0,
            '今日是否已签到': False,
            '签到时间': '2025-01-01'
        })
        
        # 检查今日是否已签到
        if checkin_system.get('今日是否已签到', False) and checkin_system.get('签到时间') == today:
            return jsonify({
                'success': False,
                'message': '今日已签到，请明天再来！'
            }), 400
        
        # 计算连续签到天数
        last_checkin_date = checkin_system.get('签到时间', '2025-01-01')
        consecutive_days = checkin_system.get('连续签到天数', 0)
        
        # 检查是否连续签到
        if last_checkin_date:
            try:
                last_date = datetime.strptime(last_checkin_date, '%Y-%m-%d')
                today_date = datetime.strptime(today, '%Y-%m-%d')
                days_diff = (today_date - last_date).days
                
                if days_diff == 1:
                    # 连续签到
                    consecutive_days += 1
                elif days_diff > 1:
                    # 断签，重新开始
                    consecutive_days = 1
                else:
                    # 同一天，不应该发生
                    consecutive_days = consecutive_days
            except:
                consecutive_days = 1
        else:
            consecutive_days = 1
        
        # 签到奖励
        coin_reward = 300
        exp_reward = 200
        
        # 获取当前用户数据
        current_coins = user.get('萌芽币', 0)
        current_exp = user.get('经验', 0)
        current_level = user.get('等级', 0)
        
        # 计算新的经验和等级
        new_exp = current_exp + exp_reward
        new_level = current_level
        
        # 等级升级逻辑：100 × 1.2^(等级)
        while True:
            exp_needed = int(100 * (1.2 ** new_level))
            if new_exp >= exp_needed:
                new_exp -= exp_needed
                new_level += 1
            else:
                break
        
        # 更新用户数据
        update_data = {
            '萌芽币': current_coins + coin_reward,
            '经验': new_exp,
            '等级': new_level,
            '签到系统': {
                '连续签到天数': consecutive_days,
                '今日是否已签到': True,
                '签到时间': today
            }
        }
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            level_up = new_level > current_level
            return jsonify({
                'success': True,
                'message': '签到成功！',
                'data': {
                    'coin_reward': coin_reward,
                    'exp_reward': exp_reward,
                    'consecutive_days': consecutive_days,
                    'level_up': level_up,
                    'new_level': new_level,
                    'new_coins': current_coins + coin_reward,
                    'new_exp': new_exp
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '签到失败，请稍后重试'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

# 删除账户
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
        
        hwt = getattr(request, 'hwt', {})
        user_id = hwt.get('user_id')
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
            hwt = getattr(request, 'hwt', {})
            hwt.clear()
            
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
