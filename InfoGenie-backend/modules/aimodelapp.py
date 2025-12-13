#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
AI模型应用服务模块
Created by: 万象口袋
Date: 2025-01-15
"""

from flask import Blueprint, request, jsonify, current_app
import requests
import json
import os
from datetime import datetime
from bson import ObjectId
from functools import wraps

# 创建蓝图
aimodelapp_bp = Blueprint('aimodelapp', __name__)

# AI功能萌芽币消耗配置
AI_COST = 100  # 每次调用AI功能消耗的萌芽币数量

# 验证用户萌芽币余额装饰器
def verify_user_coins(f):
    """验证用户萌芽币余额并在调用AI功能后扣除相应数量的萌芽币"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # 获取用户认证信息
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({
                    'success': False, 
                    'message': '未提供认证信息',
                    'error_code': 'auth_required'
                }), 401
            
            if token.startswith('Bearer '):
                token = token[7:]
            
            # 解析JWT token
            import jwt
            try:
                payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
                user_id = payload['user_id']
            except Exception as jwt_error:
                print(f"JWT解析错误: {str(jwt_error)}")
                return jsonify({
                    'success': False, 
                    'message': '无效的认证信息',
                    'error_code': 'invalid_token'
                }), 401
            
            # 查询用户萌芽币余额
            users_collection = current_app.mongo.db.userdata
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            
            if not user:
                return jsonify({
                    'success': False, 
                    'message': '用户不存在',
                    'error_code': 'user_not_found'
                }), 404
            
            # 检查萌芽币余额
            current_coins = user.get('萌芽币', 0)
            if current_coins < AI_COST:
                return jsonify({
                    'success': False, 
                    'message': f'萌芽币余额不足！当前余额: {current_coins}, 需要: {AI_COST}',
                    'error_code': 'insufficient_coins',
                    'current_coins': current_coins,
                    'required_coins': AI_COST
                }), 402
            
            # 先扣除萌芽币，确保无论服务是否成功都会扣费
            deduct_result = users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$inc': {'萌芽币': -AI_COST}}
            )
            
            if deduct_result.modified_count < 1:
                print(f"警告: 用户 {user_id} 萌芽币扣除失败")
            
            # 为请求添加用户信息，以便在函数内部使用
            request.current_user = {
                'user_id': user_id,
                'username': user.get('用户名', ''),
                'email': user.get('邮箱', '')
            }
            
            # 保存API调用类型
            api_type = request.path.split('/')[-1]
            
            # 添加使用记录
            usage_record = {
                'api_type': api_type,
                'timestamp': datetime.now().isoformat(),
                'cost': AI_COST
            }
            
            # 更新用户的AI使用历史记录
            users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$push': {'ai_usage_history': usage_record}}
            )
            
            # 调用原函数
            result = f(*args, **kwargs)
            
            return result
            
        except Exception as e:
            print(f"验证萌芽币时发生错误: {str(e)}")
            return jsonify({
                'success': False, 
                'message': '处理请求时出错',
                'error': str(e)
            }), 500
            
    return decorated

#加载AI配置文件
def load_ai_config():
    """加载AI配置文件"""
    try:
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai_config.json')
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"加载AI配置失败: {e}")
        return None

#调用DeepSeek API，带重试机制
def call_deepseek_api(messages, model="deepseek-chat", max_retries=3):
    """调用DeepSeek API，带重试机制"""
    config = load_ai_config()
    if not config or 'deepseek' not in config:
        return None, "AI配置加载失败"
    
    deepseek_config = config['deepseek']
    
    headers = {
        'Authorization': f'Bearer {deepseek_config["api_key"]}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': model,
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 2000
    }
    
    import time
    
    for attempt in range(max_retries):
        try:
            # 增加超时时间到90秒
            response = requests.post(
                f"{deepseek_config['api_base']}/chat/completions",
                headers=headers,
                json=data,
                timeout=90
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'], None
            else:
                error_msg = f"API调用失败: {response.status_code} - {response.text}"
                if attempt < max_retries - 1:
                    print(f"第{attempt + 1}次尝试失败，等待重试: {error_msg}")
                    time.sleep(2 ** attempt)  # 指数退避
                    continue
                return None, error_msg
                
        except requests.exceptions.Timeout:
            error_msg = "API请求超时"
            if attempt < max_retries - 1:
                print(f"第{attempt + 1}次尝试超时，等待重试")
                time.sleep(2 ** attempt)  # 指数退避
                continue
            return None, f"{error_msg}（已重试{max_retries}次）"
            
        except Exception as e:
            error_msg = f"API调用异常: {str(e)}"
            if attempt < max_retries - 1:
                print(f"第{attempt + 1}次尝试异常，等待重试: {error_msg}")
                time.sleep(2 ** attempt)  # 指数退避
                continue
            return None, f"{error_msg}（已重试{max_retries}次）"

#调用Kimi API
def call_kimi_api(messages, model="kimi-k2-0905-preview"):
    """调用Kimi API"""
    config = load_ai_config()
    if not config or 'kimi' not in config:
        return None, "AI配置加载失败"
    
    kimi_config = config['kimi']
    
    headers = {
        'Authorization': f'Bearer {kimi_config["api_key"]}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': model,
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 2000
    }
    
    try:
        response = requests.post(
            f"{kimi_config['api_base']}/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'], None
        else:
            return None, f"API调用失败: {response.status_code} - {response.text}"
            
    except Exception as e:
        return None, f"API调用异常: {str(e)}"

#统一的AI聊天接口
@aimodelapp_bp.route('/chat', methods=['POST'])
@verify_user_coins
def ai_chat():
    """统一的AI聊天接口"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求数据为空'}), 400
        
        # 获取请求参数
        messages = data.get('messages', [])
        model_provider = data.get('provider', 'deepseek')  # 默认使用deepseek
        model_name = data.get('model', 'deepseek-chat')  # 默认模型
        
        if not messages:
            return jsonify({'error': '消息内容不能为空'}), 400
        
        # 根据提供商调用对应的API
        if model_provider == 'deepseek':
            content, error = call_deepseek_api(messages, model_name)
        elif model_provider == 'kimi':
            content, error = call_kimi_api(messages, model_name)
        else:
            return jsonify({'error': f'不支持的AI提供商: {model_provider}'}), 400
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'content': content,
            'provider': model_provider,
            'model': model_name,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

#姓名分析专用接口
@aimodelapp_bp.route('/name-analysis', methods=['POST'])
@verify_user_coins
def name_analysis():
    """姓名分析专用接口"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({'error': '姓名不能为空'}), 400
        
        # 构建姓名分析的专业提示词
        prompt = f"""你是一位专业的姓名学专家和语言学家，请对输入的姓名进行全面分析。请直接输出分析结果，不要包含任何思考过程或<think>标签。

姓名：{name}

请按照以下格式严格输出分析结果：

【稀有度评分】
评分：X%
评价：[对稀有度的详细说明，包括姓氏和名字的常见程度分析]

【音韵评价】
评分：X%
评价：[对音韵美感的分析，包括声调搭配、读音流畅度、音律和谐度等]

【含义解读】
[详细分析姓名的寓意内涵，包括：
1. 姓氏的历史渊源和文化背景
2. 名字各字的含义和象征
3. 整体姓名的寓意组合
4. 可能体现的父母期望或文化内涵
5. 与传统文化、诗词典故的关联等]

要求：
1. 评分必须是1-100的整数百分比，要有明显区分度，避免雷同
2. 分析要专业、客观、有依据，评分要根据实际情况有所差异
3. 含义解读要详细深入，至少150字
4. 严格按照上述格式输出，不要添加思考过程、<think>标签或其他内容
5. 如果是生僻字或罕见姓名，要特别说明
6. 直接输出最终结果，不要显示推理过程"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行分析
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'analysis': content,
            'name': name,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'姓名分析失败: {str(e)}'}), 500

#变量命名助手接口
@aimodelapp_bp.route('/variable-naming', methods=['POST'])
@verify_user_coins
def variable_naming():
    """变量命名助手接口"""
    try:
        data = request.get_json()
        description = data.get('description', '').strip()
        language = data.get('language', 'javascript').lower()
        
        if not description:
            return jsonify({'error': '变量描述不能为空'}), 400
        
        # 构建变量命名的提示词
        prompt = f"""你是一个专业的变量命名助手。请根据以下描述为变量生成合适的名称：

描述：{description}

请为每种命名规范生成3个变量名建议：
1. camelCase (驼峰命名法)
2. PascalCase (帕斯卡命名法) 
3. snake_case (下划线命名法)
4. kebab-case (短横线命名法)
5. CONSTANT_CASE (常量命名法)

要求：
- 变量名要准确反映功能和用途
- 严格遵循各自的命名规范
- 避免使用缩写，除非是广泛认知的缩写
- 名称要简洁但具有描述性
- 考虑代码的可读性和维护性

请按以下JSON格式返回：
{{
  "suggestions": {{
    "camelCase": [
      {{"name": "变量名1", "description": "解释说明1"}},
      {{"name": "变量名2", "description": "解释说明2"}},
      {{"name": "变量名3", "description": "解释说明3"}}
    ],
    "PascalCase": [
      {{"name": "变量名1", "description": "解释说明1"}},
      {{"name": "变量名2", "description": "解释说明2"}},
      {{"name": "变量名3", "description": "解释说明3"}}
    ],
    "snake_case": [
      {{"name": "变量名1", "description": "解释说明1"}},
      {{"name": "变量名2", "description": "解释说明2"}},
      {{"name": "变量名3", "description": "解释说明3"}}
    ],
    "kebab-case": [
      {{"name": "变量名1", "description": "解释说明1"}},
      {{"name": "变量名2", "description": "解释说明2"}},
      {{"name": "变量名3", "description": "解释说明3"}}
    ],
    "CONSTANT_CASE": [
      {{"name": "变量名1", "description": "解释说明1"}},
      {{"name": "变量名2", "description": "解释说明2"}},
      {{"name": "变量名3", "description": "解释说明3"}}
    ]
  }}
}}

只返回JSON格式的结果，不要包含其他文字。"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行分析
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        # 解析AI返回的JSON格式数据
        try:
            # 尝试直接解析JSON
            ai_response = json.loads(content)
            suggestions = ai_response.get('suggestions', {})
        except json.JSONDecodeError:
            # 如果直接解析失败，尝试提取JSON部分
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                try:
                    ai_response = json.loads(json_match.group())
                    suggestions = ai_response.get('suggestions', {})
                except json.JSONDecodeError:
                    return jsonify({'error': 'AI返回的数据格式无法解析'}), 500
            else:
                return jsonify({'error': 'AI返回的数据中未找到有效的JSON格式'}), 500
        
        return jsonify({
            'success': True,
            'suggestions': suggestions,
            'description': description,
            'language': language,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'变量命名失败: {str(e)}'}), 500

#AI写诗助手接口
@aimodelapp_bp.route('/poetry', methods=['POST'])
@verify_user_coins
def poetry_assistant():
    """AI写诗助手接口"""
    try:
        data = request.get_json()
        theme = data.get('theme', '').strip()
        style = data.get('style', '现代诗').strip()
        mood = data.get('mood', '').strip()
        
        if not theme:
            return jsonify({'error': '诗歌主题不能为空'}), 400
        
        # 构建写诗的提示词
        prompt = f"""你是一位才华横溢的诗人，请根据以下要求创作一首诗歌。

主题：{theme}
风格：{style}
情感基调：{mood if mood else '自由发挥'}

创作要求：
1. 紧扣主题，情感真挚
2. 语言优美，意境深远
3. 符合指定的诗歌风格
4. 长度适中，朗朗上口
5. 如果是古体诗，注意平仄和韵律

请直接输出诗歌作品，不需要额外的解释或分析。"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行创作
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'poem': content,
            'theme': theme,
            'style': style,
            'mood': mood,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'诗歌创作失败: {str(e)}'}), 500

#AI语言翻译接口
@aimodelapp_bp.route('/translation', methods=['POST'])
@verify_user_coins
def translation():
    """AI语言翻译接口"""
    try:
        data = request.get_json()
        source_text = data.get('source_text', '').strip()
        target_language = data.get('target_language', 'zh-CN').strip()
        
        if not source_text:
            return jsonify({'error': '翻译内容不能为空'}), 400
        
        # 语言映射
        language_map = {
            'zh-CN': '中文（简体）',
            'zh-TW': '中文（繁体）',
            'en': '英语',
            'ja': '日语',
            'ko': '韩语',
            'fr': '法语',
            'de': '德语',
            'es': '西班牙语',
            'it': '意大利语',
            'pt': '葡萄牙语',
            'ru': '俄语',
            'ar': '阿拉伯语',
            'hi': '印地语',
            'th': '泰语',
            'vi': '越南语'
        }
        
        target_language_name = language_map.get(target_language, target_language)
        
        # 构建翻译的专业提示词
        prompt = f"""你是一位专业的翻译专家，精通多种语言的翻译工作。请将以下文本翻译成{target_language_name}。

原文：{source_text}

翻译要求：
1. 【信】- 忠实原文，准确传达原意，不遗漏、不添加、不歪曲
2. 【达】- 译文通顺流畅，符合目标语言的表达习惯和语法规范
3. 【雅】- 用词优美得体，风格与原文相符，具有良好的可读性

特别注意：
- 自动检测源语言，无需用户指定
- 保持原文的语气、情感色彩和文体风格
- 对于专业术语，提供准确的对应翻译
- 对于文化特色词汇，在保持原意的基础上进行适当的本土化处理
- 如果是单词或短语，提供多个常用含义的翻译
- 如果是句子，确保语法正确、表达自然

请按以下JSON格式返回翻译结果：
{{
  "detected_language": "检测到的源语言名称",
  "target_language": "{target_language_name}",
  "translation": "翻译结果",
  "alternative_translations": [
    "备选翻译1",
    "备选翻译2",
    "备选翻译3"
  ],
  "explanation": "翻译说明（包括语境、用法、注意事项等）",
  "pronunciation": "目标语言的发音指导（如适用）"
}}

只返回JSON格式的结果，不要包含其他文字。"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行翻译
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'translation_result': content,
            'source_text': source_text,
            'target_language': target_language,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'翻译失败: {str(e)}'}), 500

#现代文转文言文接口
@aimodelapp_bp.route('/classical_conversion', methods=['POST'])
@verify_user_coins
def classical_conversion():
    """现代文转文言文接口"""
    try:
        data = request.get_json()
        modern_text = data.get('modern_text', '').strip()
        style = data.get('style', '古雅').strip()
        article_type = data.get('article_type', '散文').strip()
        
        if not modern_text:
            return jsonify({'error': '现代文内容不能为空'}), 400
        
        # 构建文言文转换的专业提示词
        prompt = f"""你是一位精通古代文言文的文学大师，擅长将现代文转换为优美的文言文。请将以下现代文转换为文言文。

现代文：{modern_text}

转换要求：
1. 风格：{style}
2. 文体：{article_type}
3. 保持原文的核心意思和情感色彩
4. 使用恰当的文言文语法和词汇
5. 注重音韵美感和文字的雅致
6. 根据不同风格调整用词和句式

风格说明：
- 古雅：典雅庄重，用词考究，句式工整
- 简洁：言简意赅，删繁就简，朴实无华
- 华丽：辞藻华美，对仗工整，音韵和谐
- 朴实：平实自然，通俗易懂，贴近生活

文体特点：
- 散文：行文自由，情理并茂
- 诗歌：讲究韵律，意境深远
- 议论文：逻辑严密，论证有力
- 记叙文：叙事生动，描写细腻
- 书信：格式规范，情真意切
- 公文：庄重严肃，用词准确

请按以下JSON格式返回转换结果：
{{
  "classical_text": "转换后的文言文",
  "translation_notes": "转换说明，包括重要词汇的选择理由和语法特点",
  "style_analysis": "风格分析，说明如何体现所选风格特点",
  "difficulty_level": "难度等级（初级/中级/高级）",
  "key_phrases": [
    {{
      "modern": "现代词汇",
      "classical": "对应文言文词汇",
      "explanation": "转换说明"
    }}
  ],
  "cultural_elements": "文化内涵说明，包含的典故、意象等"
}}

只返回JSON格式的结果，不要包含其他文字。"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行文言文转换
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'conversion_result': content,
            'modern_text': modern_text,
            'style': style,
            'article_type': article_type,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'文言文转换失败: {str(e)}'}), 500

#AI表情制作器接口
@aimodelapp_bp.route('/expression-maker', methods=['POST'])
@verify_user_coins
def expression_maker():
    """AI表情制作器接口"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        style = data.get('style', 'mixed').strip()
        
        if not text:
            return jsonify({'error': '文字内容不能为空'}), 400
        
        # 风格映射
        style_prompts = {
            'mixed': '混合使用Emoji表情和颜文字',
            'emoji': '仅使用Emoji表情符号',
            'kaomoji': '仅使用颜文字（日式表情符号）',
            'cute': '使用可爱风格的表情符号',
            'cool': '使用酷炫风格的表情符号'
        }
        
        style_description = style_prompts.get(style, style_prompts['mixed'])
        
        # 构建表情制作的提示词
        prompt = f"""你是一个专业的表情符号专家，擅长为文字内容生成合适的表情符号。请根据以下文字内容生成相应的表情符号：

文字内容：{text}
表情风格：{style_description}

请为这个文字内容生成表情符号，要求：
1. 准确表达文字的情感和含义
2. 符合指定的表情风格
3. 提供多样化的选择
4. 包含使用场景说明

请按以下分类生成表情符号：
1. Emoji表情（使用Unicode表情符号）
2. 颜文字（使用ASCII字符组成的表情）
3. 组合表情（多个符号组合使用）

每个分类提供5个不同的表情选项，每个选项包含：
- 表情符号本身
- 适用场景说明
- 情感强度（轻微/中等/强烈）

请按以下JSON格式返回：
{{
  "expressions": {{
    "emoji": [
      {{
        "symbol": "😊",
        "description": "适用场景和情感说明",
        "intensity": "中等",
        "usage": "使用建议"
      }}
    ],
    "kaomoji": [
      {{
        "symbol": "(^_^)",
        "description": "适用场景和情感说明",
        "intensity": "轻微",
        "usage": "使用建议"
      }}
    ],
    "combination": [
      {{
        "symbol": "🎉✨",
        "description": "适用场景和情感说明",
        "intensity": "强烈",
        "usage": "使用建议"
      }}
    ]
  }},
  "summary": {{
    "emotion_analysis": "对输入文字的情感分析",
    "recommended_usage": "推荐的使用场景",
    "style_notes": "风格特点说明"
  }}
}}

只返回JSON格式的结果，不要包含其他文字。"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行分析
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        # 解析AI返回的JSON格式数据
        try:
            # 尝试直接解析JSON
            ai_response = json.loads(content)
            expressions = ai_response.get('expressions', {})
            summary = ai_response.get('summary', {})
        except json.JSONDecodeError:
            # 如果直接解析失败，尝试提取JSON部分
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                try:
                    ai_response = json.loads(json_match.group())
                    expressions = ai_response.get('expressions', {})
                    summary = ai_response.get('summary', {})
                except json.JSONDecodeError:
                    return jsonify({'error': 'AI返回的数据格式无法解析'}), 500
            else:
                return jsonify({'error': 'AI返回的数据中未找到有效的JSON格式'}), 500
        
        return jsonify({
            'success': True,
            'expressions': expressions,
            'summary': summary,
            'text': text,
            'style': style,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'表情制作失败: {str(e)}'}), 500

#Linux命令生成接口
@aimodelapp_bp.route('/linux-command', methods=['POST'])
@verify_user_coins
def linux_command_generator():
    """Linux命令生成接口"""
    try:
        data = request.get_json()
        task_description = data.get('task_description', '').strip()
        difficulty_level = data.get('difficulty_level', 'beginner').strip()
        
        if not task_description:
            return jsonify({'error': '任务描述不能为空'}), 400
        
        # 构建Linux命令生成的专业提示词
        prompt = f"""你是一位Linux系统专家，请根据用户的任务描述生成相应的Linux命令。

任务描述：{task_description}
用户水平：{difficulty_level}

请为这个任务生成合适的Linux命令，要求：
1. 命令准确可用，符合Linux标准
2. 根据用户水平提供适当的复杂度
3. 提供多种实现方式（如果有的话）
4. 包含安全提示和注意事项
5. 解释每个命令的作用和参数

用户水平说明：
- beginner（初学者）：提供基础命令，详细解释
- intermediate（中级）：提供常用命令和选项
- advanced（高级）：提供高效命令和高级用法

请按以下JSON格式返回：
{{
  "commands": [
    {{
      "command": "具体的Linux命令",
      "description": "命令的详细说明",
      "safety_level": "safe/caution/dangerous",
      "explanation": "命令各部分的解释",
      "example_output": "预期的命令输出示例",
      "alternatives": ["替代命令1", "替代命令2"]
    }}
  ],
  "safety_warnings": ["安全提示1", "安全提示2"],
  "prerequisites": ["前置条件1", "前置条件2"],
  "related_concepts": ["相关概念1", "相关概念2"]
}}

只返回JSON格式的结果，不要包含其他文字。"""
        
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # 使用DeepSeek进行命令生成
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'success': True,
            'command_result': content,
            'task_description': task_description,
            'difficulty_level': difficulty_level,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Linux命令生成失败: {str(e)}'}), 500

#AI文章排版（Markdown格式化）接口
@aimodelapp_bp.route('/markdown_formatting', methods=['POST'])
@verify_user_coins
def markdown_formatting():
    """AI文章排版（Markdown格式化）接口"""
    try:
        data = request.get_json()
        article_text = data.get('article_text', '').strip()
        emoji_style = data.get('emoji_style', 'balanced').strip()
        markdown_option = data.get('markdown_option', 'standard').strip()
        
        if not article_text:
            return jsonify({'error': '文章内容不能为空'}), 400
        
        # 构建Markdown排版的提示词
        prompt = f"""你是一位专业的文档排版助手。请将用户提供的全文按“标准Markdown格式”进行排版，并在不改变任何原文内容的前提下进行结构化呈现。严格遵守以下规则：

1) 保留所有原始内容，严禁改写、删减或添加新内容。
2) 使用合理的Markdown结构（标题、分节、段落、列表、引用、表格如有必要、代码块仅当原文包含）。
3) 智能添加适量Emoji以增强可读性（{emoji_style}），在标题、关键句、列表项等处点缀；避免过度使用，保持专业。
4) 保持语言与语气不变，只优化排版和表现形式。
5) 输出“纯Markdown文本”，不要包含任何JSON、HTML、XML、解释文字、或代码块围栏标记（例如不要在最外层使用```）。

如果原文本较长，可在开头自动生成简洁的“目录”以便阅读。

原文如下：
{article_text}
"""
        
        messages = [{"role": "user", "content": prompt}]
        
        # 使用DeepSeek进行排版生成
        content, error = call_deepseek_api(messages)
        
        if error:
            return jsonify({'error': error}), 500
        
        # 返回AI生成的Markdown文本
        return jsonify({
            'success': True,
            'formatted_markdown': content,
            'source_text': article_text,
            'emoji_style': emoji_style,
            'markdown_option': markdown_option,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'文章排版失败: {str(e)}'}), 500

#获取用户萌芽币余额
@aimodelapp_bp.route('/coins', methods=['GET'])
def get_user_coins():
    """获取用户萌芽币余额"""
    try:
        # 获取用户认证信息
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({
                'success': False, 
                'message': '未提供认证信息',
                'error_code': 'auth_required'
            }), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        # 解析JWT token
        import jwt
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False, 
                'message': 'Token已过期，请重新登录',
                'error_code': 'token_expired'
            }), 401
        except Exception as e:
            return jsonify({
                'success': False, 
                'message': f'无效的认证信息: {str(e)}',
                'error_code': 'invalid_token'
            }), 401
        
        # 查询用户萌芽币余额
        users_collection = current_app.mongo.db.userdata
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False, 
                'message': '用户不存在',
                'error_code': 'user_not_found'
            }), 404
        
        # 返回萌芽币信息
        current_coins = user.get('萌芽币', 0)
        username = user.get('用户名', '用户')
        
        # 增加额外有用信息
        ai_usage_history = [] 
        if 'ai_usage_history' in user:
            ai_usage_history = user['ai_usage_history'][-5:]  # 最近5条使用记录
            
        return jsonify({
            'success': True,
            'data': {
                'coins': current_coins,
                'ai_cost': AI_COST,
                'can_use_ai': current_coins >= AI_COST,
                'username': username,
                'usage_count': len(ai_usage_history),
                'recent_usage': ai_usage_history
            },
            'message': f'当前萌芽币余额: {current_coins}'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': '处理请求时出错',
            'error': str(e)
        }), 500

#获取可用的AI模型列表
@aimodelapp_bp.route('/models', methods=['GET'])
def get_available_models():
    """获取可用的AI模型列表"""
    try:
        config = load_ai_config()
        if not config:
            return jsonify({'error': 'AI配置加载失败'}), 500
        
        models = {}
        for provider, provider_config in config.items():
            if 'model' in provider_config:
                models[provider] = provider_config['model']
        
        return jsonify({
            'success': True,
            'models': models,
            'default_provider': 'deepseek',
            'default_model': 'deepseek-chat'
        })
        
    except Exception as e:
        return jsonify({'error': f'获取模型列表失败: {str(e)}'}), 500

#中国亲戚称呼计算器接口（普通话版 + 方言）
@aimodelapp_bp.route('/kinship-calculator', methods=['POST'])
@verify_user_coins
def kinship_calculator():
    """中国亲戚称呼计算器接口"""
    try:
        data = request.get_json() or {}
        relation_chain = (data.get('relation_chain') or '').strip()
        dialects = data.get('dialects')  # 可选，指定方言列表

        if not relation_chain:
            return jsonify({'error': '亲属关系链不能为空'}), 400

        # 组装提示词：要求严格JSON输出
        requested_dialects = dialects if isinstance(dialects, list) and dialects else [
            '粤语', '闽南语', '上海话', '四川话', '东北话', '客家话'
        ]

        prompt = f"""你是一位中国亲属称呼专家。请解析下面的亲属关系链，给出最终的亲属称呼。
输入的关系链会用“的”连接，如“妈妈的爸爸”“爸爸的姐姐的儿子”。

请遵循：
1) 以中国大陆通行的标准普通话称呼为准，给出最常用、规范的最终称呼。
2) 同时给出若干方言的对应称呼：{', '.join(requested_dialects)}。
3) 如存在地区差异或性别歧义，请在notes中说明，但最终给出一个最常用称呼。
4) 不要展示推理过程；只输出JSON。

严格按以下JSON结构输出：
{{
  "mandarin_title": "标准普通话称呼",
  "dialect_titles": {{
    "粤语": {{"title": "称呼", "romanization": "粤拼或发音", "notes": "可选说明"}},
    "闽南语": {{"title": "称呼", "romanization": "白话字或发音", "notes": "可选说明"}},
    "上海话": {{"title": "称呼", "romanization": "拟音或IPA", "notes": "可选说明"}},
    "四川话": {{"title": "称呼", "romanization": "拟音或IPA", "notes": "可选说明"}},
    "东北话": {{"title": "称呼", "romanization": "拟音或IPA", "notes": "可选说明"}},
    "客家话": {{"title": "称呼", "romanization": "客家话拟音", "notes": "可选说明"}}
  }},
  "notes": "总体说明（如地区差异、辈分方向、父系/母系等提示）"
}}

关系链：
{relation_chain}
"""

        messages = [{"role": "user", "content": prompt}]
        content, error = call_deepseek_api(messages)

        if error:
            return jsonify({'error': error}), 500

        # 解析AI返回的JSON
        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            import re
            m = re.search(r'\{[\s\S]*\}', content)
            if not m:
                return jsonify({'error': 'AI返回的数据中未找到有效JSON'}), 500
            try:
                result = json.loads(m.group())
            except Exception:
                return jsonify({'error': 'AI返回的JSON格式无法解析'}), 500

        mandarin_title = result.get('mandarin_title')
        dialect_titles = result.get('dialect_titles', {})
        notes = result.get('notes', '')

        if not mandarin_title:
            return jsonify({'error': '未获得标准普通话称呼'}), 500

        return jsonify({
            'success': True,
            'relation_chain': relation_chain,
            'mandarin_title': mandarin_title,
            'dialect_titles': dialect_titles,
            'notes': notes,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': f'亲戚称呼计算失败: {str(e)}'}), 500