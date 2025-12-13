#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试为指定账号增加萌芽币接口 (/api/user/add-coins)
"""

import os
import sys
import json
from datetime import datetime

# 加入后端根目录到路径，导入create_app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from modules.auth import generate_token
from werkzeug.security import generate_password_hash


def run_test():
    """运行加币接口测试，打印真实响应并断言结果"""
    app = create_app()

    with app.app_context():
        db = app.mongo.db
        users = db.userdata

        # 构造一个临时测试用户（真实写库，测试结束删除）
        test_email = "infogenie.test.addcoins@foxmail.com"
        users.delete_many({'邮箱': test_email})
        test_user = {
            '邮箱': test_email,
            '用户名': '测试用户_加币',
            '密码': generate_password_hash('AddCoins123!'),
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

        # 生成有效JWT用于认证
        token = generate_token({
            'user_id': test_user_id,
            'email': test_email,
            'username': test_user['用户名']
        })

        client = app.test_client()

        # 第一次加币: +500
        resp1 = client.post(
            '/api/user/add-coins',
            headers={'Authorization': f'Bearer {token}'},
            json={'email': test_email, 'amount': 500}
        )
        print('第一次加币 状态码:', resp1.status_code)
        data1 = resp1.get_json()
        print('第一次加币 响应:')
        print(json.dumps(data1, ensure_ascii=False, indent=2))
        assert resp1.status_code == 200
        assert data1.get('success') is True
        assert data1['data']['before_coins'] == 0
        assert data1['data']['added'] == 500
        assert data1['data']['new_coins'] == 500

        # 第二次加币: +200
        resp2 = client.post(
            '/api/user/add-coins',
            headers={'Authorization': f'Bearer {token}'},
            json={'email': test_email, 'amount': 200}
        )
        print('第二次加币 状态码:', resp2.status_code)
        data2 = resp2.get_json()
        print('第二次加币 响应:')
        print(json.dumps(data2, ensure_ascii=False, indent=2))
        assert resp2.status_code == 200
        assert data2.get('success') is True
        assert data2['data']['before_coins'] == 500
        assert data2['data']['added'] == 200
        assert data2['data']['new_coins'] == 700

        # 清理临时测试用户
        users.delete_many({'邮箱': test_email})


if __name__ == '__main__':
    print('🔧 开始测试 /api/user/add-coins 接口...')
    run_test()
    print('✅ 测试完成！')