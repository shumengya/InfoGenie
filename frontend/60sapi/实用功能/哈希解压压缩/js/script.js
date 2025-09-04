// API配置
const API_BASE_URL = 'https://60s.viki.moe/v2/hash';

// DOM元素
const elements = {
    inputText: document.getElementById('inputText'),
    processBtn: document.getElementById('processBtn'),
    clearBtn: document.getElementById('clearBtn'),
    resultsSection: document.getElementById('resultsSection'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// 结果元素映射
const resultElements = {
    md5: document.getElementById('md5Result'),
    sha1: document.getElementById('sha1Result'),
    sha256: document.getElementById('sha256Result'),
    sha512: document.getElementById('sha512Result'),
    base64Encode: document.getElementById('base64EncodeResult'),
    base64Decode: document.getElementById('base64DecodeResult'),
    urlEncode: document.getElementById('urlEncodeResult'),
    urlDecode: document.getElementById('urlDecodeResult'),
    gzipCompress: document.getElementById('gzipCompressResult'),
    deflateCompress: document.getElementById('deflateCompressResult'),
    brotliCompress: document.getElementById('brotliCompressResult')
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    addInputAnimation();
});

// 事件监听器初始化
function initializeEventListeners() {
    // 处理按钮点击
    elements.processBtn.addEventListener('click', handleProcess);
    
    // 清空按钮点击
    elements.clearBtn.addEventListener('click', handleClear);
    
    // 输入框回车键
    elements.inputText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            handleProcess();
        }
    });
    
    // 复制按钮事件委托
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copy-btn')) {
            const copyBtn = e.target.closest('.copy-btn');
            const targetId = copyBtn.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            const textContent = targetElement.textContent.trim();
            
            if (textContent && textContent !== '等待处理...' && textContent !== '处理失败') {
                copyToClipboard(textContent);
            }
        }
    });
    
    // 输入框实时验证
    elements.inputText.addEventListener('input', function() {
        const hasContent = this.value.trim().length > 0;
        elements.processBtn.disabled = !hasContent;
        
        if (hasContent) {
            elements.processBtn.classList.remove('disabled');
        } else {
            elements.processBtn.classList.add('disabled');
        }
    });
}

// 添加输入动画效果
function addInputAnimation() {
    elements.inputText.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    elements.inputText.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
}

// 处理主要功能
async function handleProcess() {
    const inputValue = elements.inputText.value.trim();
    
    if (!inputValue) {
        showToast('请输入要处理的内容', 'error');
        return;
    }
    
    // 显示加载状态
    showLoading(true);
    resetResults();
    
    try {
        // 调用API
        const response = await fetch(`${API_BASE_URL}?content=${encodeURIComponent(inputValue)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            displayResults(data.data);
            showResultsSection();
            showToast('处理完成！', 'success');
        } else {
            throw new Error(data.message || '处理失败');
        }
        
    } catch (error) {
        console.error('处理错误:', error);
        showToast(`处理失败: ${error.message}`, 'error');
        displayError();
    } finally {
        showLoading(false);
    }
}

// 显示结果
function displayResults(data) {
    try {
        // 哈希结果
        updateResultElement('md5', data.md5 || '不可用');
        
        // SHA系列
        if (data.sha) {
            updateResultElement('sha1', data.sha.sha1 || '不可用');
            updateResultElement('sha256', data.sha.sha256 || '不可用');
            updateResultElement('sha512', data.sha.sha512 || '不可用');
        }
        
        // Base64编码
        if (data.base64) {
            updateResultElement('base64Encode', data.base64.encoded || '不可用');
            // BASE64解码：只有当输入本身是BASE64格式时才显示解码结果
            let base64DecodeResult = data.base64.decoded;
            if (!base64DecodeResult) {
                // 检查输入是否为有效的BASE64格式
                const inputValue = elements.inputText.value.trim();
                const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                if (base64Regex.test(inputValue) && inputValue.length % 4 === 0) {
                    try {
                        base64DecodeResult = atob(inputValue);
                    } catch (e) {
                        base64DecodeResult = '解码失败';
                    }
                } else {
                    base64DecodeResult = '输入非BASE64格式';
                }
            }
            updateResultElement('base64Decode', base64DecodeResult || '不可用');
        }
        
        // URL编码
        if (data.url) {
            updateResultElement('urlEncode', data.url.encoded || '不可用');
            updateResultElement('urlDecode', data.url.decoded || '不可用');
        }
        
        // 压缩结果（仅显示压缩，不显示解压）
        if (data.gzip) {
            updateResultElement('gzipCompress', data.gzip.encoded || '不可用');
        }
        
        if (data.deflate) {
            updateResultElement('deflateCompress', data.deflate.encoded || '不可用');
        }
        
        if (data.brotli) {
            updateResultElement('brotliCompress', data.brotli.encoded || '不可用');
        }
        
    } catch (error) {
        console.error('显示结果时出错:', error);
        showToast('显示结果时出错', 'error');
    }
}

// 更新单个结果元素
function updateResultElement(key, value) {
    const element = resultElements[key];
    if (element) {
        const textSpan = element.querySelector('span') || element;
        textSpan.textContent = value;
        textSpan.classList.remove('placeholder');
        
        // 添加动画效果
        element.classList.add('slide-in');
        setTimeout(() => {
            element.classList.remove('slide-in');
        }, 300);
    }
}

// 重置结果
function resetResults() {
    Object.values(resultElements).forEach(element => {
        if (element) {
            const textSpan = element.querySelector('span') || element;
            textSpan.textContent = '等待处理...';
            textSpan.classList.add('placeholder');
        }
    });
}

// 显示错误状态
function displayError() {
    Object.values(resultElements).forEach(element => {
        if (element) {
            const textSpan = element.querySelector('span') || element;
            textSpan.textContent = '处理失败';
            textSpan.classList.add('placeholder');
        }
    });
}

// 显示结果区域
function showResultsSection() {
    elements.resultsSection.classList.add('show');
    
    // 平滑滚动到结果区域
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// 清空功能
function handleClear() {
    elements.inputText.value = '';
    elements.inputText.focus();
    elements.resultsSection.classList.remove('show');
    resetResults();
    elements.processBtn.disabled = true;
    elements.processBtn.classList.add('disabled');
    
    showToast('内容已清空', 'info');
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        
        showToast('复制成功！', 'success');
    } catch (error) {
        console.error('复制失败:', error);
        showToast('复制失败，请手动复制', 'error');
    }
}

// 显示/隐藏加载状态
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
        elements.processBtn.disabled = true;
        elements.processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    } else {
        elements.loadingOverlay.classList.remove('show');
        elements.processBtn.disabled = false;
        elements.processBtn.innerHTML = '<i class="fas fa-cogs"></i> 开始处理';
    }
}

// 显示提示消息
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    
    // 设置图标和样式
    const icon = elements.toast.querySelector('i');
    icon.className = getToastIcon(type);
    
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    
    // 自动隐藏
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 获取提示图标
function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    return icons[type] || icons.success;
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

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter 处理
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!elements.processBtn.disabled) {
            handleProcess();
        }
    }
    
    // Escape 清空
    if (e.key === 'Escape') {
        handleClear();
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时的处理
        console.log('页面已隐藏');
    } else {
        // 页面显示时的处理
        console.log('页面已显示');
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    showToast('发生未知错误，请刷新页面重试', 'error');
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
    showToast('网络请求失败，请检查网络连接', 'error');
});

// 导出函数供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleProcess,
        copyToClipboard,
        showToast,
        debounce,
        throttle
    };
}