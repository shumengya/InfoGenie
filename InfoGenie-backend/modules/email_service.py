#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
邮件发送模块
负责处理用户注册、登录验证邮件
"""

import random
import string
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.header import Header
from flask import current_app
import logging
import os

# 验证码存储（生产环境建议使用Redis）
verification_codes = {}

def init_mail(app):
    """初始化邮件配置"""
    # 使用smtplib直接发送，不需要Flask-Mail
    pass

def generate_verification_code(length=6):
    """生成验证码"""
    return ''.join(random.choices(string.digits, k=length))

def send_verification_email(email, verification_type='register'):
    """
    发送验证邮件
    
    Args:
        email: 收件人邮箱
        verification_type: 验证类型 ('register', 'login', 'reset_password')
    
    Returns:
        dict: 发送结果
    """
    try:
        # 验证QQ邮箱格式
        if not is_qq_email(email):
            return {
                'success': False,
                'message': '仅支持QQ邮箱注册登录'
            }
        
        # 生成验证码
        code = generate_verification_code()
        
        # 存储验证码（5分钟有效期）
        verification_codes[email] = {
            'code': code,
            'type': verification_type,
            'expires_at': datetime.now() + timedelta(minutes=5),
            'attempts': 0
        }
        
        # 获取邮件配置 - 使用与QQEmailSendAPI相同的配置
        sender_email = os.environ.get('MAIL_USERNAME', '3205788256@qq.com')
        sender_password = os.environ.get('MAIL_PASSWORD', 'szcaxvbftusqddhi')
        
        # 邮件模板
        if verification_type == 'register':
            subject = '【InfoGenie】注册验证码'
            html_content = f'''
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #66bb6a; margin: 0;">InfoGenie 神奇万事通</h1>
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">欢迎注册InfoGenie</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%); padding: 30px; border-radius: 15px; text-align: center;">
                        <h2 style="color: #2e7d32; margin-bottom: 20px;">验证码</h2>
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #66bb6a; letter-spacing: 5px;">{code}</span>
                        </div>
                        <p style="color: #4a4a4a; margin: 15px 0;">请在5分钟内输入此验证码完成注册</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <p style="color: #666; font-size: 12px; margin: 0; text-align: center;">
                            如果您没有申请注册，请忽略此邮件<br>
                            此验证码5分钟内有效，请勿泄露给他人
                        </p>
                    </div>
                </div>
            </body>
            </html>
            '''
        else:  # login
            subject = '【InfoGenie】登录验证码'
            html_content = f'''
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #66bb6a; margin: 0;">InfoGenie 神奇万事通</h1>
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">安全登录验证</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%); padding: 30px; border-radius: 15px; text-align: center;">
                        <h2 style="color: white; margin-bottom: 20px;">登录验证码</h2>
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #66bb6a; letter-spacing: 5px;">{code}</span>
                        </div>
                        <p style="color: white; margin: 15px 0;">请在5分钟内输入此验证码完成登录</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                        <p style="color: #666; font-size: 12px; margin: 0; text-align: center;">
                            如果不是您本人操作，请检查账户安全<br>
                            此验证码5分钟内有效，请勿泄露给他人
                        </p>
                    </div>
                </div>
            </body>
            </html>
            '''
        
        # 创建邮件 - 使用与QQEmailSendAPI相同的方式
        message = MIMEText(html_content, 'html', 'utf-8')
        message['From'] = sender_email  # 直接使用邮箱地址，不使用Header包装
        message['To'] = email
        message['Subject'] = Header(subject, 'utf-8')
        
        # 发送邮件 - 使用SSL端口465
        try:
            # 使用与QQEmailSendAPI相同的连接方式
            smtp_obj = smtplib.SMTP_SSL('smtp.qq.com', 465)
            smtp_obj.login(sender_email, sender_password)
            smtp_obj.sendmail(sender_email, [email], message.as_string())
            smtp_obj.quit()
            
            print(f"验证码邮件发送成功: {email}")
            return {
                'success': True,
                'message': '验证码已发送到您的邮箱',
                'email': email
            }
            
        except smtplib.SMTPAuthenticationError as auth_error:
            print(f"SMTP认证失败: {str(auth_error)}")
            return {
                'success': False,
                'message': 'SMTP认证失败，请检查邮箱配置'
            }
        except smtplib.SMTPConnectError as conn_error:
            print(f"SMTP连接失败: {str(conn_error)}")
            return {
                'success': False,
                'message': 'SMTP服务器连接失败'
            }
        except Exception as smtp_error:
            print(f"SMTP发送失败: {str(smtp_error)}")
            return {
                'success': False,
                'message': f'邮件发送失败: {str(smtp_error)}'
            }
        
    except Exception as e:
        print(f"邮件发送失败: {str(e)}")
        return {
            'success': False,
            'message': '邮件发送失败，请稍后重试'
        }

def verify_code(email, code):
    """
    验证验证码
    
    Args:
        email: 邮箱地址
        code: 验证码
    
    Returns:
        dict: 验证结果
    """
    if email not in verification_codes:
        return {
            'success': False,
            'message': '验证码不存在或已过期'
        }
    
    stored_info = verification_codes[email]
    
    # 检查过期时间
    if datetime.now() > stored_info['expires_at']:
        del verification_codes[email]
        return {
            'success': False,
            'message': '验证码已过期，请重新获取'
        }
    
    # 检查尝试次数
    if stored_info['attempts'] >= 3:
        del verification_codes[email]
        return {
            'success': False,
            'message': '验证码输入错误次数过多，请重新获取'
        }
    
    # 验证码校验
    if stored_info['code'] != code:
        stored_info['attempts'] += 1
        return {
            'success': False,
            'message': f'验证码错误，还可尝试{3 - stored_info["attempts"]}次'
        }
    
    # 验证成功，删除验证码
    verification_type = stored_info['type']
    del verification_codes[email]
    
    return {
        'success': True,
        'message': '验证码验证成功',
        'type': verification_type
    }

def is_qq_email(email):
    """
    验证是否为QQ邮箱
    
    Args:
        email: 邮箱地址
    
    Returns:
        bool: 是否为QQ邮箱
    """
    if not email or '@' not in email:
        return False
    
    domain = email.split('@')[1].lower()
    qq_domains = ['qq.com', 'vip.qq.com', 'foxmail.com']
    
    return domain in qq_domains

def get_qq_avatar_url(email):
    """
    根据QQ邮箱获取QQ头像URL
    
    Args:
        email: QQ邮箱地址
    
    Returns:
        str: QQ头像URL
    """
    if not is_qq_email(email):
        return None
    
    # 提取QQ号码
    qq_number = email.split('@')[0]
    
    # 验证是否为纯数字（QQ号）
    if not qq_number.isdigit():
        return None
    
    # 返回QQ头像API URL
    return f"http://q1.qlogo.cn/g?b=qq&nk={qq_number}&s=100"

def cleanup_expired_codes():
    """清理过期的验证码"""
    current_time = datetime.now()
    expired_emails = [
        email for email, info in verification_codes.items()
        if current_time > info['expires_at']
    ]
    
    for email in expired_emails:
        del verification_codes[email]
    
    return len(expired_emails)