#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试邮件发送功能
"""

import requests
import json

def test_send_verification():
    """测试发送验证码"""
    url = "http://localhost:5000/api/auth/send-verification"
    
    # 测试数据
    test_data = {
        "email": "3205788256@qq.com",  # 使用配置中的测试邮箱
        "type": "register"
    }
    
    try:
        response = requests.post(url, json=test_data)
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.json()}")
        
        if response.status_code == 200:
            print("✅ 邮件发送成功！")
        else:
            print("❌ 邮件发送失败")
            
    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")

if __name__ == "__main__":
    print("📧 测试邮件发送功能...")
    test_send_verification()
