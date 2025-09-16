#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试修复后的邮件发送功能
"""

import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.email_service import send_verification_email, verify_code

def test_email_sending():
    """
    测试邮件发送功能
    """
    print("=== 测试邮件发送功能 ===")
    
    # 测试邮箱（请替换为你的QQ邮箱）
    test_email = "3205788256@qq.com"  # 替换为实际的测试邮箱
    
    print(f"正在向 {test_email} 发送注册验证码...")
    
    # 发送注册验证码
    result = send_verification_email(test_email, 'register')
    
    print(f"发送结果: {result}")
    
    if result['success']:
        print("✅ 邮件发送成功！")
        if 'code' in result:
            print(f"验证码: {result['code']}")
            
            # 测试验证码验证
            print("\n=== 测试验证码验证 ===")
            verify_result = verify_code(test_email, result['code'])
            print(f"验证结果: {verify_result}")
            
            if verify_result['success']:
                print("✅ 验证码验证成功！")
            else:
                print("❌ 验证码验证失败！")
    else:
        print("❌ 邮件发送失败！")
        print(f"错误信息: {result['message']}")

def test_login_email():
    """
    测试登录验证码邮件
    """
    print("\n=== 测试登录验证码邮件 ===")
    
    test_email = "3205788256@qq.com"  # 替换为实际的测试邮箱
    
    print(f"正在向 {test_email} 发送登录验证码...")
    
    result = send_verification_email(test_email, 'login')
    
    print(f"发送结果: {result}")
    
    if result['success']:
        print("✅ 登录验证码邮件发送成功！")
        if 'code' in result:
            print(f"验证码: {result['code']}")
    else:
        print("❌ 登录验证码邮件发送失败！")
        print(f"错误信息: {result['message']}")

if __name__ == '__main__':
    print("InfoGenie 邮件服务测试")
    print("=" * 50)
    
    # 测试注册验证码
    test_email_sending()
    
    # 测试登录验证码
    test_login_email()
    
    print("\n测试完成！")