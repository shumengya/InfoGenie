#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
AI应用模块 - 提供AI应用静态文件服务和目录扫描
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Blueprint, jsonify
import os

aimodelapp_bp = Blueprint('aimodelapp', __name__)

@aimodelapp_bp.route('/scan-directories', methods=['GET'])
def scan_directories():
    """扫描aimodelapp目录结构"""
    try:
        # 获取项目根目录
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        ai_directory = os.path.join(project_root, 'frontend', 'aimodelapp')
        
        if not os.path.exists(ai_directory):
            return jsonify({
                'success': False,
                'message': 'aimodelapp目录不存在'
            }), 404
        
        apps = []
        
        # 颜色渐变配置
        gradient_colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ]
        
        # 扫描目录
        for i, app_name in enumerate(os.listdir(ai_directory)):
            app_path = os.path.join(ai_directory, app_name)
            index_path = os.path.join(app_path, 'index.html')
            
            if os.path.isdir(app_path) and os.path.exists(index_path) and not app_name.endswith('.txt'):
                # 读取HTML文件获取标题
                try:
                    with open(index_path, 'r', encoding='utf-8') as f:
                        html_content = f.read()
                        title_match = html_content.find('<title>')
                        if title_match != -1:
                            title_end = html_content.find('</title>', title_match)
                            if title_end != -1:
                                title = html_content[title_match + 7:title_end].strip()
                            else:
                                title = app_name
                        else:
                            title = app_name
                except:
                    title = app_name
                
                apps.append({
                    'title': title,
                    'description': f'{app_name}AI应用',
                    'link': f'/aimodelapp/{app_name}/index.html',
                    'status': 'active',
                    'color': gradient_colors[i % len(gradient_colors)]
                })
        
        return jsonify({
            'success': True,
            'apps': apps
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'扫描目录时出错: {str(e)}'
        }), 500