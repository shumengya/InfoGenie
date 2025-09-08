#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试注册邮件发送
"""

import requests
import json

def test_send_verification_email():
    """测试发送验证码邮件"""
    url = "http://localhost:5000/api/auth/send-verification"
    
    test_data = {
        "email": "3205788256@qq.com",  # 使用配置的邮箱
        "type": "register"
    }
    
    try:
        response = requests.post(url, json=test_data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
        
        if response.status_code == 200:
            print("\n✅ 邮件发送成功！请检查邮箱")
        else:
            print(f"\n❌ 邮件发送失败: {response.json().get('message', '未知错误')}")
            
    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")

if __name__ == "__main__":
    print("📧 测试注册邮件发送...")
    test_send_verification_email()
