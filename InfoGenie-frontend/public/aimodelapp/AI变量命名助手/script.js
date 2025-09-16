// 从配置文件导入设置
// 配置在 env.js 文件中定义

// DOM 元素
const descriptionInput = document.getElementById('description');
const generateBtn = document.getElementById('generateBtn');
const loadingDiv = document.getElementById('loading');
const suggestionsContainer = document.getElementById('suggestions');

// 命名规范转换函数
const namingConventions = {
    camelCase: (words) => {
        if (words.length === 0) return '';
        return words[0].toLowerCase() + words.slice(1).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('');
    },
    
    PascalCase: (words) => {
        return words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('');
    },
    
    snake_case: (words) => {
        return words.map(word => word.toLowerCase()).join('_');
    },
    
    'kebab-case': (words) => {
        return words.map(word => word.toLowerCase()).join('-');
    },
    
    CONSTANT_CASE: (words) => {
        return words.map(word => word.toUpperCase()).join('_');
    }
};



// 调用后端API
async function callBackendAPI(description) {
    try {
        const response = await fetch('http://127.0.0.1:5002/api/aimodelapp/variable-naming', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            return data.suggestions;
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
        return parsed.suggestions || {};
    } catch (error) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.suggestions || {};
            } catch (e) {
                console.error('JSON解析失败:', e);
            }
        }
        
        // 如果JSON解析失败，返回空对象
        console.error('无法解析AI响应:', response);
        return {};
    }
}



// 显示建议
function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    
    if (!suggestions || Object.keys(suggestions).length === 0) {
        suggestionsContainer.innerHTML = '<div class="placeholder">暂无建议，请尝试重新生成</div>';
        return;
    }
    
    // 命名规范的显示名称
    const conventionNames = {
        'camelCase': 'camelCase (驼峰命名法)',
        'PascalCase': 'PascalCase (帕斯卡命名法)',
        'snake_case': 'snake_case (下划线命名法)',
        'kebab-case': 'kebab-case (短横线命名法)',
        'CONSTANT_CASE': 'CONSTANT_CASE (常量命名法)'
    };
    
    // 按命名规范分组显示
    Object.keys(suggestions).forEach(convention => {
        if (suggestions[convention] && suggestions[convention].length > 0) {
            // 创建分组标题
            const groupTitle = document.createElement('div');
            groupTitle.className = 'convention-group-title';
            groupTitle.textContent = conventionNames[convention] || convention;
            suggestionsContainer.appendChild(groupTitle);
            
            // 显示该规范下的建议
            suggestions[convention].forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.className = 'suggestion-item';
                suggestionElement.innerHTML = `
                    <div class="variable-name">${suggestion.name}</div>
                    <div class="variable-description">${suggestion.description}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${suggestion.name}', this)">复制</button>
                `;
                suggestionsContainer.appendChild(suggestionElement);
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
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.appendChild(errorDiv);
}

// 显示加载状态
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    generateBtn.disabled = show;
    generateBtn.textContent = show ? '生成中...' : '生成变量名';
}

// 生成变量名建议
async function generateSuggestions() {
    const description = descriptionInput.value.trim();
    
    if (!description) {
        showErrorMessage('请输入变量描述');
        return;
    }
    
    showLoading(true);
    suggestionsContainer.innerHTML = '';
    
    try {
        const suggestions = await callBackendAPI(description);
        displaySuggestions(suggestions);
    } catch (error) {
        console.error('生成建议失败:', error);
        showErrorMessage(`生成失败: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 事件监听器
generateBtn.addEventListener('click', generateSuggestions);

// 回车键生成
descriptionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateSuggestions();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认占位符
    suggestionsContainer.innerHTML = '<div class="placeholder">请输入变量描述，然后点击生成按钮获取所有命名规范的建议</div>';
});

// 导出函数供HTML调用
window.copyToClipboard = copyToClipboard;
window.generateSuggestions = generateSuggestions;