// 从配置文件导入设置
// 配置在 env.js 文件中定义

// 表情配置
const CONFIG = {
    intensityLevels: {
        'low': { color: '#4CAF50' },
        'medium': { color: '#FF9800' },
        'high': { color: '#F44336' },
        'very_high': { color: '#9C27B0' }
    },
    expressionCategories: {
        'emoji': { className: 'emoji' },
        'kaomoji': { className: 'kaomoji' },
        'combination': { className: 'combination' }
    },
    expressionStyles: {
        'cute': { name: '可爱风', description: '适合表达可爱、萌系情感' },
        'cool': { name: '酷炫风', description: '适合表达酷炫、帅气情感' },
        'angry': { name: '愤怒风', description: '适合表达愤怒、生气情感' },
        'sad': { name: '悲伤风', description: '适合表达悲伤、难过情感' },
        'happy': { name: '开心风', description: '适合表达开心、快乐情感' },
        'mixed': { name: '混合风', description: '多种风格混合，适应各种情感' }
    }
};

// DOM 元素
const textInput = document.getElementById('text-input');
const styleSelect = document.getElementById('style-select');
const generateBtn = document.getElementById('generateBtn');
const loadingDiv = document.getElementById('loading');
const expressionsContainer = document.getElementById('expressions');

// 调用后端API
async function callBackendAPI(text, style) {
    try {
        // 获取JWT token
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('未登录，请先登录后使用AI功能');
        }
        
        const response = await fetch(`${window.API_CONFIG.baseUrl}/api/aimodelapp/expression-maker`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: text,
                style: style
            })
        });

        if (!response.ok) {
            if (response.status === 402) {
                throw new Error('您的萌芽币余额不足，无法使用此功能');
            }
            const errorData = await response.json();
            throw new Error(errorData.error || `API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            return data.expressions;
        } else {
            throw new Error(data.error || 'API响应格式异常');
        }
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 解析AI响应
function parseAIResponse(response) {
    try {
        // 尝试直接解析JSON
        const parsed = JSON.parse(response);
        return parsed.expressions || {};
    } catch (error) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.expressions || {};
            } catch (e) {
                console.error('JSON解析失败:', e);
            }
        }
        
        // 如果JSON解析失败，返回空对象
        console.error('无法解析AI响应:', response);
        return {};
    }
}

// 显示表情建议
function displayExpressions(expressions) {
    expressionsContainer.innerHTML = '';
    
    if (!expressions || Object.keys(expressions).length === 0) {
        expressionsContainer.innerHTML = '<div class="placeholder">暂无表情建议，请尝试重新生成</div>';
        return;
    }
    
    // 表情分类的显示名称
    const categoryNames = {
        'emoji': 'Emoji表情',
        'kaomoji': '颜文字',
        'combination': '组合表情'
    };
    
    // 按分类显示表情
    Object.keys(expressions).forEach(category => {
        if (expressions[category] && expressions[category].length > 0) {
            // 创建分组标题
            const groupTitle = document.createElement('div');
            groupTitle.className = 'expression-group-title';
            groupTitle.textContent = categoryNames[category] || category;
            expressionsContainer.appendChild(groupTitle);
            
            // 显示该分类下的表情
            expressions[category].forEach(expression => {
                const expressionElement = document.createElement('div');
                expressionElement.className = 'expression-item';
                
                // 获取情感强度颜色
                const intensityColor = CONFIG.intensityLevels[expression.intensity]?.color || '#86868B';
                
                expressionElement.innerHTML = `
                    <div class="expression-content">
                        <div class="expression-symbol ${CONFIG.expressionCategories[category]?.className || 'emoji'}">${expression.symbol}</div>
                        <div class="expression-info">
                            <div class="expression-text">${expression.symbol}</div>
                            <div class="expression-description">
                                ${expression.description}<br>
                                <span style="color: ${intensityColor}; font-weight: 600;">强度: ${expression.intensity}</span>
                                ${expression.usage ? ` | ${expression.usage}` : ''}
                            </div>
                        </div>
                    </div>
                    <button class="copy-btn" onclick="copyToClipboard('${expression.symbol}', this)">复制</button>
                `;
                expressionsContainer.appendChild(expressionElement);
            });
        }
    });
}

// 复制到剪贴板
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessToast('已复制到剪贴板');
        button.textContent = '已复制';
        setTimeout(() => {
            button.textContent = '复制';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        // 备用复制方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccessToast('已复制到剪贴板');
            button.textContent = '已复制';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        } catch (e) {
            showErrorMessage('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    });
}

// 显示成功提示
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 显示错误信息
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    expressionsContainer.innerHTML = '';
    expressionsContainer.appendChild(errorDiv);
}

// 显示加载状态
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    generateBtn.disabled = show;
    generateBtn.textContent = show ? '生成中...' : '生成表情';
}

// 生成表情建议
async function generateExpressions() {
    const text = textInput.value.trim();
    const style = styleSelect.value;
    
    if (!text) {
        showErrorMessage('请输入要表达的文字内容');
        return;
    }
    
    showLoading(true);
    expressionsContainer.innerHTML = '';
    
    try {
        const expressions = await callBackendAPI(text, style);
        displayExpressions(expressions);
    } catch (error) {
        console.error('生成表情失败:', error);
        // 检查是否是萌芽币不足导致的错误
        if (error.message && error.message.includes('萌芽币余额不足')) {
            showErrorMessage(`萌芽币不足: 每次使用AI功能需要消耗100萌芽币，请通过每日签到获取更多萌芽币`);
        } else {
            showErrorMessage(`生成失败: ${error.message}`);
        }
    } finally {
        showLoading(false);
    }
}

// 初始化样式选择器
function initializeStyleSelector() {
    // 清空现有选项
    styleSelect.innerHTML = '';
    
    // 添加样式选项
    Object.keys(CONFIG.expressionStyles).forEach(styleKey => {
        const option = document.createElement('option');
        option.value = styleKey;
        option.textContent = `${CONFIG.expressionStyles[styleKey].name} - ${CONFIG.expressionStyles[styleKey].description}`;
        styleSelect.appendChild(option);
    });
    
    // 设置默认选项
    styleSelect.value = 'mixed';
}

// 事件监听器
generateBtn.addEventListener('click', generateExpressions);

// 回车键生成
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateExpressions();
    }
});

// 样式选择变化时的提示
styleSelect.addEventListener('change', (e) => {
    const selectedStyle = CONFIG.expressionStyles[e.target.value];
    if (selectedStyle) {
        // 可以在这里添加样式变化的提示
        console.log(`已选择样式: ${selectedStyle.name} - ${selectedStyle.description}`);
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化样式选择器
    initializeStyleSelector();
    
    // 设置默认占位符
    expressionsContainer.innerHTML = '<div class="placeholder">请输入要表达的文字，然后点击生成按钮获取相应的表情符号</div>';
    
    // 设置默认文本
    if (!textInput.value.trim()) {
        textInput.value = '开心';
    }
});

// 导出函数供HTML调用
window.copyToClipboard = copyToClipboard;
window.generateExpressions = generateExpressions;

// 添加一些实用的辅助函数
function getRandomExpression(expressions) {
    const allExpressions = [];
    Object.values(expressions).forEach(categoryExpressions => {
        if (Array.isArray(categoryExpressions)) {
            allExpressions.push(...categoryExpressions);
        }
    });
    
    if (allExpressions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allExpressions.length);
        return allExpressions[randomIndex];
    }
    
    return null;
}

// 表情使用统计（可选功能）
function trackExpressionUsage(expression) {
    const usage = JSON.parse(localStorage.getItem('expressionUsage') || '{}');
    usage[expression] = (usage[expression] || 0) + 1;
    localStorage.setItem('expressionUsage', JSON.stringify(usage));
}

// 获取常用表情（可选功能）
function getPopularExpressions(limit = 5) {
    const usage = JSON.parse(localStorage.getItem('expressionUsage') || '{}');
    return Object.entries(usage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([expression]) => expression);
}

// 导出辅助函数
window.getRandomExpression = getRandomExpression;
window.trackExpressionUsage = trackExpressionUsage;
window.getPopularExpressions = getPopularExpressions;