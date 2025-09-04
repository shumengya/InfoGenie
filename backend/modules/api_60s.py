#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
60s API模块 - 提供各种实时数据接口
Created by: 神奇万事通
Date: 2025-09-02
"""

from flask import Blueprint, jsonify, request
import requests
import json
from datetime import datetime, timedelta
import random
import time

api_60s_bp = Blueprint('api_60s', __name__)

# API配置
API_ENDPOINTS = {
    '抖音热搜': {
        'urls': [
            'https://api.vvhan.com/api/hotlist?type=douyin',
            'https://tenapi.cn/v2/douyinhot',
            'https://api.oioweb.cn/api/common/tebie/dyhot'
        ],
        'cache_time': 600  # 10分钟缓存
    },
    '微博热搜': {
        'urls': [
            'https://api.vvhan.com/api/hotlist?type=weibo',
            'https://tenapi.cn/v2/wbhot',
            'https://api.oioweb.cn/api/common/tebie/wbhot'
        ],
        'cache_time': 300  # 5分钟缓存
    },
    '猫眼票房': {
        'urls': [
            'https://api.vvhan.com/api/hotlist?type=maoyan',
            'https://tenapi.cn/v2/maoyan'
        ],
        'cache_time': 3600  # 1小时缓存
    },
    '网易云音乐': {
        'urls': [
            'https://api.vvhan.com/api/hotlist?type=netease',
            'https://tenapi.cn/v2/music'
        ],
        'cache_time': 1800  # 30分钟缓存
    },
    'HackerNews': {
        'urls': [
            'https://api.vvhan.com/api/hotlist?type=hackernews',
            'https://hacker-news.firebaseio.com/v0/topstories.json'
        ],
        'cache_time': 1800  # 30分钟缓存
    }
}

# 内存缓存
cache = {}

def fetch_data_with_fallback(urls, timeout=10):
    """使用备用URL获取数据"""
    for url in urls:
        try:
            response = requests.get(url, timeout=timeout, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"URL {url} 失败: {str(e)}")
            continue
    return None

def get_cached_data(key, cache_time):
    """获取缓存数据"""
    if key in cache:
        cached_time, data = cache[key]
        if datetime.now() - cached_time < timedelta(seconds=cache_time):
            return data
    return None

def set_cache_data(key, data):
    """设置缓存数据"""
    cache[key] = (datetime.now(), data)

@api_60s_bp.route('/douyin', methods=['GET'])
def get_douyin_hot():
    """获取抖音热搜榜"""
    try:
        # 检查缓存
        cached = get_cached_data('douyin', API_ENDPOINTS['抖音热搜']['cache_time'])
        if cached:
            return jsonify({
                'success': True,
                'data': cached,
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'from_cache': True
            })
        
        # 获取新数据
        data = fetch_data_with_fallback(API_ENDPOINTS['抖音热搜']['urls'])
        
        if data:
            # 标准化数据格式
            if 'data' in data:
                hot_list = data['data']
            elif isinstance(data, list):
                hot_list = data
            else:
                hot_list = []
            
            result = {
                'title': '抖音热搜榜',
                'subtitle': '实时热门话题 · 紧跟潮流趋势',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'total': len(hot_list),
                'list': hot_list[:50]  # 最多返回50条
            }
            
            # 设置缓存
            set_cache_data('douyin', result)
            
            return jsonify({
                'success': True,
                'data': result,
                'from_cache': False
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取数据失败，所有数据源暂时不可用'
            }), 503
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@api_60s_bp.route('/weibo', methods=['GET'])
def get_weibo_hot():
    """获取微博热搜榜"""
    try:
        # 检查缓存
        cached = get_cached_data('weibo', API_ENDPOINTS['微博热搜']['cache_time'])
        if cached:
            return jsonify({
                'success': True,
                'data': cached,
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'from_cache': True
            })
        
        # 获取新数据
        data = fetch_data_with_fallback(API_ENDPOINTS['微博热搜']['urls'])
        
        if data:
            if 'data' in data:
                hot_list = data['data']
            elif isinstance(data, list):
                hot_list = data
            else:
                hot_list = []
            
            result = {
                'title': '微博热搜榜',
                'subtitle': '热门话题 · 实时更新',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'total': len(hot_list),
                'list': hot_list[:50]
            }
            
            set_cache_data('weibo', result)
            
            return jsonify({
                'success': True,
                'data': result,
                'from_cache': False
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取数据失败，所有数据源暂时不可用'
            }), 503
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@api_60s_bp.route('/maoyan', methods=['GET'])
def get_maoyan_box_office():
    """获取猫眼票房排行榜"""
    try:
        cached = get_cached_data('maoyan', API_ENDPOINTS['猫眼票房']['cache_time'])
        if cached:
            return jsonify({
                'success': True,
                'data': cached,
                'from_cache': True
            })
        
        data = fetch_data_with_fallback(API_ENDPOINTS['猫眼票房']['urls'])
        
        if data:
            if 'data' in data:
                box_office_list = data['data']
            elif isinstance(data, list):
                box_office_list = data
            else:
                box_office_list = []
            
            result = {
                'title': '猫眼票房排行榜',
                'subtitle': '实时票房数据',
                'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'total': len(box_office_list),
                'list': box_office_list[:20]
            }
            
            set_cache_data('maoyan', result)
            
            return jsonify({
                'success': True,
                'data': result,
                'from_cache': False
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取数据失败'
            }), 503
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@api_60s_bp.route('/60s', methods=['GET'])
def get_60s_news():
    """获取每天60秒读懂世界"""
    try:
        urls = [
            'https://60s-cf.viki.moe',
            'https://60s.viki.moe',
            'https://60s.b23.run'
        ]
        
        data = fetch_data_with_fallback(urls)
        
        if data:
            return jsonify({
                'success': True,
                'data': {
                    'title': '每天60秒读懂世界',
                    'content': data,
                    'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取数据失败'
            }), 503
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@api_60s_bp.route('/bing-wallpaper', methods=['GET'])
def get_bing_wallpaper():
    """获取必应每日壁纸"""
    try:
        url = 'https://api.vvhan.com/api/bing'
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'data': {
                    'title': '必应每日壁纸',
                    'image_url': response.url,
                    'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取壁纸失败'
            }), 503
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@api_60s_bp.route('/weather', methods=['GET'])
def get_weather():
    """获取天气信息"""
    try:
        city = request.args.get('city', '北京')
        url = f'https://api.vvhan.com/api/weather?city={city}'
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'success': True,
                'data': data
            })
        else:
            return jsonify({
                'success': False,
                'message': '获取天气信息失败'
            }), 503
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'服务器错误: {str(e)}'
        }), 500

@api_60s_bp.route('/scan-directories', methods=['GET'])
def scan_directories():
    """扫描60sapi目录结构"""
    try:
        import os
        
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
                            'link': f'/60sapi/{category_name}/{module_name}/index.html',
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
