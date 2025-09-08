#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
小游戏模块 - 提供小游戏静态文件服务和目录扫描
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Blueprint, jsonify
import os

smallgame_bp = Blueprint('smallgame', __name__)

@smallgame_bp.route('/scan-directories', methods=['GET'])
def scan_directories():
    """扫描smallgame目录结构"""
    try:
        # 获取项目根目录
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        game_directory = os.path.join(project_root, 'frontend', 'smallgame')
        
        if not os.path.exists(game_directory):
            return jsonify({
                'success': False,
                'message': 'smallgame目录不存在'
            }), 404
        
        games = []
        
        # 颜色渐变配置
        gradient_colors = [
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #ff8a80 0%, #ffab91 100%)',
            'linear-gradient(135deg, #81c784 0%, #aed581 100%)'
        ]
        
        # 扫描目录
        for i, game_name in enumerate(os.listdir(game_directory)):
            game_path = os.path.join(game_directory, game_name)
            index_path = os.path.join(game_path, 'index.html')
            
            if os.path.isdir(game_path) and os.path.exists(index_path) and not game_name.endswith('.txt'):
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
                                title = game_name
                        else:
                            title = game_name
                except:
                    title = game_name
                
                games.append({
                    'title': title,
                    'description': f'{game_name}小游戏',
                    'link': f'/smallgame/{game_name}/index.html',
                    'status': 'active',
                    'color': gradient_colors[i % len(gradient_colors)]
                })
        
        return jsonify({
            'success': True,
            'games': games
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'扫描目录时出错: {str(e)}'
        }), 500