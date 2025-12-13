#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试列出所有用户的HTTP接口 (/api/user/list)
"""

import os
import sys
import json
from datetime import datetime

# 将后端根目录加入路径，便于导入app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from modules.auth import generate_token
from werkzeug.security import generate_password_hash


def run_test():
    """运行用户列表接口测试，输出真实数据"""
    # 使用.env中的真实Mongo配置，不造假
    app = create_app()

    with app.app_context():
        db = app.mongo.db
        users = db.userdata

        # 插入一个测试用户（真实写入后再删除），确保可验证接口输出
        test_email = "infogenie.test.user@foxmail.com"
        users.delete_many({'邮箱': test_email})
        test_user = {
            '邮箱': test_email,
            '用户名': '测试用户_列表',
            '密码': generate_password_hash('TestPass123!'),
            '头像': None,
            '注册时间': datetime.now().isoformat(),
            '最后登录': None,
            '登录次数': 0,
            '用户状态': 'active',
            '等级': 0,
            '经验': 0,
            '萌芽币': 0,
            '签到系统': {
                '连续签到天数': 0,
                '今日是否已签到': False,
                '签到时间': datetime.now().strftime('%Y-%m-%d')
            }
        }
        insert_result = users.insert_one(test_user)
        test_user_id = str(insert_result.inserted_id)

        # 生成有效JWT，满足认证要求
        token = generate_token({
            'user_id': test_user_id,
            'email': test_email,
            'username': test_user['用户名']
        })

        client = app.test_client()
        resp = client.get('/api/user/list', headers={'Authorization': f'Bearer {token}'})

        print("状态码:", resp.status_code)
        data = resp.get_json()
        print("响应内容:")
        print(json.dumps(data, ensure_ascii=False, indent=2))

        # 基本断言，确保返回真实列表数据且包含刚插入的测试用户
        assert resp.status_code == 200
        assert data.get('success') is True
        assert isinstance(data.get('data'), list)
        assert any(u.get('email') == test_email for u in data['data'])

        # 清理测试数据
        users.delete_many({'邮箱': test_email})


if __name__ == '__main__':
    print('🔎 开始测试 /api/user/list 接口...')
    run_test()
    print('✅ 测试完成！')