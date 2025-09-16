// 全局变量
let supportedLanguages = {};
let isTranslating = false;

// DOM元素
const elements = {
    fromLang: null,
    toLang: null,
    inputText: null,
    outputText: null,
    translateBtn: null,
    swapBtn: null,
    clearBtn: null,
    copyBtn: null,
    charCount: null,
    detectedLang: null,
    targetLang: null,
    pronounceSection: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    loadSupportedLanguages();
    bindEvents();
    updateCharCount();
});

// 初始化DOM元素
function initializeElements() {
    elements.fromLang = document.getElementById('from-lang');
    elements.toLang = document.getElementById('to-lang');
    elements.inputText = document.getElementById('input-text');
    elements.outputText = document.getElementById('output-text');
    elements.translateBtn = document.getElementById('translate-btn');
    elements.swapBtn = document.getElementById('swap-btn');
    elements.clearBtn = document.getElementById('clear-btn');
    elements.copyBtn = document.getElementById('copy-btn');
    elements.charCount = document.getElementById('char-count');
    elements.detectedLang = document.getElementById('detected-lang');
    elements.targetLang = document.getElementById('target-lang');
    elements.pronounceSection = document.getElementById('pronounce-section');
}

// 加载支持的语言列表
async function loadSupportedLanguages() {
    try {
        const response = await fetch('https://60s.viki.moe/v2/fanyi/langs');
        const data = await response.json();
        
        if (data.code === 200 && data.data && Array.isArray(data.data)) {
            // 转换数组格式为对象格式
            supportedLanguages = {};
            supportedLanguages['auto'] = '自动检测';
            data.data.forEach(lang => {
                supportedLanguages[lang.code] = lang.label;
            });
            populateLanguageSelectors();
        } else {
            throw new Error('获取语言列表失败');
        }
    } catch (error) {
        console.error('加载语言列表失败:', error);
        showToast('加载语言列表失败，请刷新页面重试', 'error');
        // 使用默认语言列表
        useDefaultLanguages();
    }
}

// 使用默认语言列表（备用方案）
function useDefaultLanguages() {
    supportedLanguages = {
        'auto': '自动检测',
        'zh-CHS': '中文',
        'en': '英语',
        'ja': '日语',
        'ko': '韩语',
        'fr': '法语',
        'de': '德语',
        'es': '西班牙语',
        'ru': '俄语',
        'th': '泰语',
        'ar': '阿拉伯语',
        'pt': '葡萄牙语',
        'it': '意大利语'
    };
    populateLanguageSelectors();
}

// 填充语言选择器
function populateLanguageSelectors() {
    const fromSelect = elements.fromLang;
    const toSelect = elements.toLang;
    
    // 清空现有选项
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    // 添加语言选项
    Object.entries(supportedLanguages).forEach(([code, name]) => {
        const fromOption = new Option(name, code);
        const toOption = new Option(name, code);
        
        fromSelect.appendChild(fromOption);
        toSelect.appendChild(toOption);
    });
    
    // 设置默认值
    fromSelect.value = 'auto';
    toSelect.value = 'en';
    
    // 如果没有auto选项，则设置为中文
    if (!supportedLanguages['auto']) {
        fromSelect.value = 'zh-CHS';
    }
}

// 绑定事件
function bindEvents() {
    // 输入框事件
    elements.inputText.addEventListener('input', function() {
        updateCharCount();
        clearOutput();
    });
    
    elements.inputText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            translateText();
        }
    });
    
    // 按钮事件
    elements.translateBtn.addEventListener('click', translateText);
    elements.swapBtn.addEventListener('click', swapLanguages);
    elements.clearBtn.addEventListener('click', clearInput);
    elements.copyBtn.addEventListener('click', copyOutput);
    
    // 语言选择器事件
    elements.fromLang.addEventListener('change', function() {
        clearOutput();
        updateLanguageLabels();
    });
    
    elements.toLang.addEventListener('change', function() {
        clearOutput();
        updateLanguageLabels();
    });
}

// 更新字符计数
function updateCharCount() {
    const text = elements.inputText.value;
    const count = text.length;
    elements.charCount.textContent = `${count}/5000`;
    
    if (count > 5000) {
        elements.charCount.style.color = '#e74c3c';
    } else {
        elements.charCount.style.color = '#74c69d';
    }
}

// 更新语言标签
function updateLanguageLabels() {
    const fromLang = elements.fromLang.value;
    const toLang = elements.toLang.value;
    
    elements.detectedLang.textContent = supportedLanguages[fromLang] || '未知语言';
    elements.targetLang.textContent = supportedLanguages[toLang] || '未知语言';
}

// 翻译文本
async function translateText() {
    const text = elements.inputText.value.trim();
    
    if (!text) {
        showToast('请输入要翻译的文本', 'error');
        return;
    }
    
    if (text.length > 5000) {
        showToast('文本长度不能超过5000字符', 'error');
        return;
    }
    
    if (isTranslating) {
        return;
    }
    
    setTranslating(true);
    
    try {
        const fromLang = elements.fromLang.value;
        const toLang = elements.toLang.value;
        
        // 构建请求URL
        const params = new URLSearchParams({
            text: text,
            from: fromLang,
            to: toLang
        });
        
        const response = await fetch(`https://60s.viki.moe/v2/fanyi?${params}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            displayTranslationResult(data.data);
        } else {
            throw new Error(data.msg || '翻译失败');
        }
    } catch (error) {
        console.error('翻译失败:', error);
        showToast('翻译失败: ' + error.message, 'error');
        elements.outputText.textContent = '翻译失败，请重试';
    } finally {
        setTranslating(false);
    }
}

// 显示翻译结果
function displayTranslationResult(data) {
    // 显示翻译结果
    const translation = data.target ? data.target.text : '';
    elements.outputText.textContent = translation;
    
    // 更新检测到的语言
    if (data.source && data.source.type_desc) {
        elements.detectedLang.textContent = `检测: ${data.source.type_desc}`;
    }
    
    // 显示发音信息
    displayPronunciation(data);
    
    // 如果翻译结果为空
    if (!translation) {
        elements.outputText.textContent = '未获取到翻译结果';
    }
}

// 显示发音信息
function displayPronunciation(data) {
    const pronounceSection = elements.pronounceSection;
    if (!pronounceSection) {
        return;
    }
    pronounceSection.innerHTML = '';
    
    // 原文发音
    if (data.source && data.source.pronounce) {
        const sourcePhoneticDiv = document.createElement('div');
        sourcePhoneticDiv.className = 'pronounce-item show';
        sourcePhoneticDiv.textContent = `原文发音: [${data.source.pronounce}]`;
        pronounceSection.appendChild(sourcePhoneticDiv);
    }
    
    // 译文发音
    if (data.target && data.target.pronounce) {
        const targetPhoneticDiv = document.createElement('div');
        targetPhoneticDiv.className = 'pronounce-item show';
        targetPhoneticDiv.textContent = `译文发音: [${data.target.pronounce}]`;
        pronounceSection.appendChild(targetPhoneticDiv);
    }
}

// 设置翻译状态
function setTranslating(translating) {
    isTranslating = translating;
    elements.translateBtn.disabled = translating;
    
    if (translating) {
        elements.translateBtn.classList.add('loading');
    } else {
        elements.translateBtn.classList.remove('loading');
    }
}

// 交换语言
function swapLanguages() {
    const fromValue = elements.fromLang.value;
    const toValue = elements.toLang.value;
    
    // 不能交换自动检测
    if (fromValue === 'auto') {
        showToast('自动检测语言无法交换', 'error');
        return;
    }
    
    elements.fromLang.value = toValue;
    elements.toLang.value = fromValue;
    
    // 交换文本内容
    const inputText = elements.inputText.value;
    const outputText = elements.outputText.textContent;
    
    if (outputText && outputText !== '翻译结果将在这里显示...' && outputText !== '翻译失败，请重试' && outputText !== '未获取到翻译结果') {
        elements.inputText.value = outputText;
        elements.outputText.textContent = inputText;
    }
    
    updateCharCount();
    updateLanguageLabels();
    clearPronunciation();
}

// 清空输入
function clearInput() {
    elements.inputText.value = '';
    updateCharCount();
    clearOutput();
}

// 清空输出
function clearOutput() {
    elements.outputText.textContent = '翻译结果将在这里显示...';
    clearPronunciation();
}

// 清空发音信息
function clearPronunciation() {
    if (elements.pronounceSection) {
        elements.pronounceSection.innerHTML = '';
    }
}

// 复制输出
function copyOutput() {
    const text = elements.outputText.textContent;
    
    if (!text || text === '翻译结果将在这里显示...' || text === '翻译失败，请重试' || text === '未获取到翻译结果') {
        showToast('没有可复制的内容', 'error');
        return;
    }
    
    // 使用现代API复制
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制到剪贴板');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// 备用复制方法
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('已复制到剪贴板');
    } catch (err) {
        showToast('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 显示提示消息
function showToast(message, type = 'success') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter 翻译
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        translateText();
    }
    
    // Ctrl+Shift+C 复制结果
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyOutput();
    }
    
    // Ctrl+Shift+X 清空输入
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        clearInput();
    }
    
    // Ctrl+Shift+S 交换语言
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        swapLanguages();
    }
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停翻译请求
        if (isTranslating) {
            setTranslating(false);
        }
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
});