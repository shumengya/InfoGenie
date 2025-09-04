#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
60s API模块 - 提供各种实时数据接口
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Blueprint, jsonify
import os

api_60s_bp = Blueprint('api_60s', __name__)

@api_60s_bp.route('/scan-directories', methods=['GET'])
def scan_directories():
    """扫描60sapi目录结构"""
    try:
        # 获取项目根目录
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        api_directory = os.path.join(project_root, 'frontend', '60sapi')
        
        if not os.path.exists(api_directory):
            return jsonify({
                'success': False,
                'message': '60sapi目录不存在'
            }), 404
        
        categories = []
        
        # 定义分类配置
        category_config = {
            '热搜榜单': {'color': '#66bb6a'},
            '日更资讯': {'color': '#4caf50'},
            '实用功能': {'color': '#388e3c'},
            '娱乐消遣': {'color': '#66bb6a'}
        }
        
        # 颜色渐变配置
        gradient_colors = [
            'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
            'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
            'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
            'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
            'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
        ]
        
        # 扫描目录
        for category_name in os.listdir(api_directory):
            category_path = os.path.join(api_directory, category_name)
            
            if os.path.isdir(category_path) and category_name in category_config:
                apis = []
                
                # 扫描分类下的模块
                for i, module_name in enumerate(os.listdir(category_path)):
                    module_path = os.path.join(category_path, module_name)
                    index_path = os.path.join(module_path, 'index.html')
                    
                    if os.path.isdir(module_path) and os.path.exists(index_path):
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
                                        title = module_name
                                else:
                                    title = module_name
                        except:
                            title = module_name
                        
                        apis.append({
                            'title': title,
                            'description': f'{module_name}相关功能',
                            'link': f'http://localhost:5000/60sapi/{category_name}/{module_name}/index.html',
                            'status': 'active',
                            'color': gradient_colors[i % len(gradient_colors)]
                        })
                
                if apis:
                    categories.append({
                        'title': category_name,
                        'color': category_config[category_name]['color'],
                        'apis': apis
                    })
        
        return jsonify({
            'success': True,
            'categories': categories
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'扫描目录时出错: {str(e)}'
        }), 500
