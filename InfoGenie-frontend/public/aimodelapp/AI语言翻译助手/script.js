// 从配置文件导入设置
// 配置在 env.js 文件中定义

// DOM 元素
const sourceTextInput = document.getElementById('sourceText');
const targetLanguageSelect = document.getElementById('targetLanguage');
const translateBtn = document.getElementById('translateBtn');
const loadingDiv = document.getElementById('loading');
const translationResultContainer = document.getElementById('translationResult');

// 调用后端API
async function callBackendAPI(sourceText, targetLanguage) {
    try {
        // 获取JWT token
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('未登录，请先登录后使用AI功能');
        }
        
        const response = await fetch(`${window.API_CONFIG.baseUrl}/api/aimodelapp/translation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                source_text: sourceText,
                target_language: targetLanguage
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
            return data.translation_result;
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
        return parsed;
    } catch (error) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed;
            } catch (e) {
                console.error('JSON解析失败:', e);
            }
        }
        
        // 如果JSON解析失败，返回空对象
        console.error('无法解析AI响应:', response);
        return {};
    }
}

// 显示翻译结果
function displayTranslationResult(result) {
    translationResultContainer.innerHTML = '';
    
    if (!result || !result.translation) {
        translationResultContainer.innerHTML = '<div class="placeholder">翻译失败，请尝试重新翻译</div>';
        return;
    }
    
    // 创建结果容器
    const resultDiv = document.createElement('div');
    resultDiv.className = 'translation-result';
    
    // 检测到的源语言
    if (result.detected_language) {
        const detectedLangDiv = document.createElement('div');
        detectedLangDiv.className = 'detected-language';
        detectedLangDiv.innerHTML = `<span class="label">检测到的语言：</span><span class="value">${result.detected_language}</span>`;
        resultDiv.appendChild(detectedLangDiv);
    }
    
    // 主要翻译结果
    const mainTranslationDiv = document.createElement('div');
    mainTranslationDiv.className = 'main-translation';
    mainTranslationDiv.innerHTML = `
        <div class="translation-header">
            <span class="label">翻译结果：</span>
            <button class="copy-btn" onclick="copyToClipboard('${result.translation.replace(/'/g, "\\'")}')">复制</button>
        </div>
        <div class="translation-text">${result.translation}</div>
    `;
    resultDiv.appendChild(mainTranslationDiv);
    
    // 发音指导
    if (result.pronunciation) {
        const pronunciationDiv = document.createElement('div');
        pronunciationDiv.className = 'pronunciation';
        pronunciationDiv.innerHTML = `<span class="label">发音：</span><span class="value">${result.pronunciation}</span>`;
        resultDiv.appendChild(pronunciationDiv);
    }
    
    // 备选翻译
    if (result.alternative_translations && result.alternative_translations.length > 0) {
        const alternativesDiv = document.createElement('div');
        alternativesDiv.className = 'alternatives';
        alternativesDiv.innerHTML = '<div class="alternatives-title">备选翻译：</div>';
        
        result.alternative_translations.forEach((alt, index) => {
            if (alt && alt.trim()) {
                const altDiv = document.createElement('div');
                altDiv.className = 'alternative-item';
                altDiv.innerHTML = `
                    <span class="alternative-text">${alt}</span>
                    <button class="copy-btn-small" onclick="copyToClipboard('${alt.replace(/'/g, "\\'")}')">复制</button>
                `;
                alternativesDiv.appendChild(altDiv);
            }
        });
        
        resultDiv.appendChild(alternativesDiv);
    }
    
    // 翻译说明
    if (result.explanation) {
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.innerHTML = `<span class="label">翻译说明：</span><div class="explanation-text">${result.explanation}</div>`;
        resultDiv.appendChild(explanationDiv);
    }
    
    translationResultContainer.appendChild(resultDiv);
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessToast('已复制到剪贴板');
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
    translationResultContainer.innerHTML = '';
    translationResultContainer.appendChild(errorDiv);
}

// 显示加载状态
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    translateBtn.disabled = show;
    translateBtn.textContent = show ? '翻译中...' : '开始翻译';
}

// 执行翻译
async function performTranslation() {
    const sourceText = sourceTextInput.value.trim();
    const targetLanguage = targetLanguageSelect.value;
    
    if (!sourceText) {
        showErrorMessage('请输入要翻译的内容');
        return;
    }
    
    showLoading(true);
    translationResultContainer.innerHTML = '';
    
    try {
        const result = await callBackendAPI(sourceText, targetLanguage);
        const parsedResult = parseAIResponse(result);
        displayTranslationResult(parsedResult);
    } catch (error) {
        console.error('翻译失败:', error);
        showErrorMessage(`翻译失败: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 事件监听器
translateBtn.addEventListener('click', performTranslation);

// 回车键翻译
sourceTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        performTranslation();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认占位符
    translationResultContainer.innerHTML = '<div class="placeholder">请输入要翻译的内容，然后选择目标语言并点击翻译按钮</div>';
});

// 导出函数供HTML调用
window.copyToClipboard = copyToClipboard;
window.performTranslation = performTranslation;