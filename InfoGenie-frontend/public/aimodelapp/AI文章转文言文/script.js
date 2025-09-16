// 从配置文件导入设置
// 配置在 env.js 文件中定义

// DOM 元素
const modernTextInput = document.getElementById('modernText');
const styleSelect = document.getElementById('styleSelect');
const articleTypeSelect = document.getElementById('articleTypeSelect');
const convertBtn = document.getElementById('convertBtn');
const loadingDiv = document.getElementById('loading');
const conversionResultContainer = document.getElementById('conversionResult');

// 调用后端API
async function callBackendAPI(modernText, style, articleType) {
    try {
        const response = await fetch('http://127.0.0.1:5002/api/aimodelapp/classical_conversion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modern_text: modernText,
                style: style,
                article_type: articleType
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            return data.conversion_result;
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

// 显示转换结果
function displayConversionResult(result) {
    conversionResultContainer.innerHTML = '';
    
    if (!result || !result.classical_text) {
        conversionResultContainer.innerHTML = '<div class="placeholder">转换失败，请尝试重新转换</div>';
        return;
    }
    
    // 创建结果容器
    const resultDiv = document.createElement('div');
    resultDiv.className = 'conversion-result';
    
    // 转换信息
    const infoDiv = document.createElement('div');
    infoDiv.className = 'conversion-info';
    infoDiv.innerHTML = `
        <div class="info-item">
            <span class="label">转换风格：</span>
            <span class="value">${result.style || '经典文言文'}</span>
        </div>
        <div class="info-item">
            <span class="label">文章类型：</span>
            <span class="value">${result.article_type || '记叙文'}</span>
        </div>
    `;
    resultDiv.appendChild(infoDiv);
    
    // 原文显示
    const originalDiv = document.createElement('div');
    originalDiv.className = 'original-text';
    originalDiv.innerHTML = `
        <div class="text-header">
            <span class="label">原现代文：</span>
            <button class="copy-btn" onclick="copyToClipboard('${(result.original_text || '').replace(/'/g, "\\'")}')">复制</button>
        </div>
        <div class="text-content">${result.original_text || modernTextInput.value}</div>
    `;
    resultDiv.appendChild(originalDiv);
    
    // 文言文结果
    const classicalDiv = document.createElement('div');
    classicalDiv.className = 'classical-text';
    classicalDiv.innerHTML = `
        <div class="text-header">
            <span class="label">文言文转换：</span>
            <button class="copy-btn" onclick="copyToClipboard('${result.classical_text.replace(/'/g, "\\'")}')">复制</button>
        </div>
        <div class="text-content classical">${result.classical_text}</div>
    `;
    resultDiv.appendChild(classicalDiv);
    
    // 关键转换说明
    if (result.key_transformations && result.key_transformations.length > 0) {
        const transformationsDiv = document.createElement('div');
        transformationsDiv.className = 'transformations';
        transformationsDiv.innerHTML = '<div class="transformations-title">关键转换说明：</div>';
        
        result.key_transformations.forEach((transformation, index) => {
            if (transformation && transformation.trim()) {
                const transformDiv = document.createElement('div');
                transformDiv.className = 'transformation-item';
                transformDiv.innerHTML = `<span class="number">${index + 1}.</span><span class="text">${transformation}</span>`;
                transformationsDiv.appendChild(transformDiv);
            }
        });
        
        resultDiv.appendChild(transformationsDiv);
    }
    
    // 文言文特色分析
    if (result.classical_features) {
        const featuresDiv = document.createElement('div');
        featuresDiv.className = 'classical-features';
        featuresDiv.innerHTML = '<div class="features-title">文言文特色分析：</div>';
        
        if (result.classical_features.sentence_patterns) {
            const patternDiv = document.createElement('div');
            patternDiv.className = 'feature-item';
            patternDiv.innerHTML = `<span class="feature-label">句式特点：</span><span class="feature-text">${result.classical_features.sentence_patterns}</span>`;
            featuresDiv.appendChild(patternDiv);
        }
        
        if (result.classical_features.vocabulary) {
            const vocabDiv = document.createElement('div');
            vocabDiv.className = 'feature-item';
            vocabDiv.innerHTML = `<span class="feature-label">词汇运用：</span><span class="feature-text">${result.classical_features.vocabulary}</span>`;
            featuresDiv.appendChild(vocabDiv);
        }
        
        if (result.classical_features.grammar) {
            const grammarDiv = document.createElement('div');
            grammarDiv.className = 'feature-item';
            grammarDiv.innerHTML = `<span class="feature-label">语法特色：</span><span class="feature-text">${result.classical_features.grammar}</span>`;
            featuresDiv.appendChild(grammarDiv);
        }
        
        resultDiv.appendChild(featuresDiv);
    }
    
    // 转换说明
    if (result.explanation) {
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.innerHTML = `<span class="label">转换说明：</span><div class="explanation-text">${result.explanation}</div>`;
        resultDiv.appendChild(explanationDiv);
    }
    
    // 发音指导
    if (result.pronunciation_guide) {
        const pronunciationDiv = document.createElement('div');
        pronunciationDiv.className = 'pronunciation';
        pronunciationDiv.innerHTML = `<span class="label">古音指导：</span><span class="value">${result.pronunciation_guide}</span>`;
        resultDiv.appendChild(pronunciationDiv);
    }
    
    conversionResultContainer.appendChild(resultDiv);
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
    conversionResultContainer.innerHTML = '';
    conversionResultContainer.appendChild(errorDiv);
}

// 显示加载状态
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    convertBtn.disabled = show;
    convertBtn.textContent = show ? '转换中...' : '开始转换';
}

// 执行转换
async function performConversion() {
    const modernText = modernTextInput.value.trim();
    const style = styleSelect.value;
    const articleType = articleTypeSelect.value;
    
    if (!modernText) {
        showErrorMessage('请输入要转换的现代文内容');
        return;
    }
    
    showLoading(true);
    conversionResultContainer.innerHTML = '';
    
    try {
        const result = await callBackendAPI(modernText, style, articleType);
        const parsedResult = parseAIResponse(result);
        displayConversionResult(parsedResult);
    } catch (error) {
        console.error('转换失败:', error);
        showErrorMessage(`转换失败: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 事件监听器
convertBtn.addEventListener('click', performConversion);

// 回车键转换
modernTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        performConversion();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认占位符
    conversionResultContainer.innerHTML = '<div class="placeholder">请输入现代文内容，选择转换风格和文章类型，然后点击转换按钮</div>';
});

// 导出函数供HTML调用
window.copyToClipboard = copyToClipboard;
window.performConversion = performConversion;