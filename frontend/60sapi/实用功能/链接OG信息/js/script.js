// 链接OG信息查询 - JavaScript功能代码
// 神秘高级风格的交互体验

class OGAnalyzer {
    constructor() {
        this.apiUrl = 'https://60s.viki.moe/v2/og';
        this.isAnalyzing = false;
        this.currentUrl = '';
        this.animationFrameId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.createBackgroundEffects();
        this.initializeAnimations();
        this.showWelcomeMessage();
        this.initPageAnimations();
    }

    // 初始化页面动画
    initPageAnimations() {
        // 延迟添加动画类，确保CSS已加载
        setTimeout(() => {
            const header = document.querySelector('.header');
            const querySection = document.querySelector('.query-section');
            
            if (header) header.classList.add('animate-in');
            if (querySection) querySection.classList.add('animate-in');
        }, 100);
    }

    bindEvents() {
        const urlInput = document.getElementById('url-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const copyBtn = document.getElementById('copy-btn');
        const clearBtn = document.getElementById('clear-btn');

        // 输入框事件
        urlInput.addEventListener('input', (e) => this.handleUrlInput(e));
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isAnalyzing) {
                this.analyzeUrl();
            }
        });
        urlInput.addEventListener('focus', () => this.handleInputFocus());
        urlInput.addEventListener('blur', () => this.handleInputBlur());

        // 按钮事件
        analyzeBtn.addEventListener('click', () => this.analyzeUrl());
        copyBtn.addEventListener('click', () => this.copyResults());
        clearBtn.addEventListener('click', () => this.clearResults());

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleUrlInput(e) {
        const url = e.target.value.trim();
        const analyzeBtn = document.getElementById('analyze-btn');
        
        if (this.isValidUrl(url)) {
            analyzeBtn.classList.add('ready');
            e.target.classList.remove('error');
        } else {
            analyzeBtn.classList.remove('ready');
            if (url.length > 0) {
                e.target.classList.add('error');
            } else {
                e.target.classList.remove('error');
            }
        }
    }

    handleInputFocus() {
        const inputContainer = document.querySelector('.input-container');
        inputContainer.classList.add('focused');
        this.createInputGlow();
    }

    handleInputBlur() {
        const inputContainer = document.querySelector('.input-container');
        inputContainer.classList.remove('focused');
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + Enter 快速分析
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!this.isAnalyzing) {
                this.analyzeUrl();
            }
        }
        
        // Escape 清除结果
        if (e.key === 'Escape') {
            this.clearResults();
        }
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    async analyzeUrl() {
        const urlInput = document.getElementById('url-input');
        const url = urlInput.value.trim();

        if (!this.isValidUrl(url)) {
            this.showError('请输入有效的URL地址');
            this.shakeInput();
            return;
        }

        if (this.isAnalyzing) {
            return;
        }

        this.currentUrl = url;
        this.isAnalyzing = true;
        this.startTime = Date.now(); // 记录开始时间
        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            const response = await fetch(`${this.apiUrl}?url=${encodeURIComponent(url)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                await this.displayResults(data.data);
                this.showSuccessMessage('分析完成！');
                
                // 添加按钮闪烁效果
                const analyzeBtn = document.getElementById('analyze-btn');
                analyzeBtn.classList.add('flash');
                setTimeout(() => {
                    analyzeBtn.classList.remove('flash');
                }, 300);
            } else {
                throw new Error(data.message || '获取OG信息失败');
            }
        } catch (error) {
            console.error('分析失败:', error);
            this.showError(`分析失败: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
            this.hideLoading();
        }
    }

    showLoading() {
        const loadingElement = document.getElementById('loading');
        const analyzeBtn = document.getElementById('analyze-btn');
        
        loadingElement.classList.add('active');
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '分析中...';
        
        this.startScannerAnimation();
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading');
        const analyzeBtn = document.getElementById('analyze-btn');
        
        loadingElement.classList.remove('active');
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '开始分析';
        
        this.stopScannerAnimation();
    }

    async displayResults(data) {
        const resultsElement = document.getElementById('results');
        const ogCard = document.getElementById('og-card');
        
        // 检查是否有有效数据 - 放宽检查条件，只要有任何非空字段就显示
        const hasValidData = Object.values(data).some(value => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim() !== '';
            return true; // 其他类型的值都认为是有效的
        });
        
        if (!hasValidData) {
            this.showError('该链接暂无可获取的OG信息，请检查链接是否正确或稍后重试');
            return;
        }
        
        // 基础信息 - 只显示有数据的字段
        this.updateElementWithVisibility('og-title', data.title, '标题');
        this.updateElementWithVisibility('og-description', data.description, '描述');
        this.updateElement('og-url', data.url || this.currentUrl); // URL始终显示
        this.updateElementWithVisibility('og-site-name', data.site_name, '网站名称');
        this.updateElement('og-type', data.type || 'website'); // 类型始终显示
        
        // 媒体信息
        this.updateImageElementWithVisibility('og-image', data.image);
        this.updateElementWithVisibility('og-image-alt', data.image_alt, '图片描述');
        
        // 技术信息
        this.updateElementWithVisibility('og-locale', data.locale, '语言');
        this.updateElementWithVisibility('og-updated-time', this.formatDate(data.updated_time), '更新时间');
        this.updateElement('response-time', `${Date.now() - this.startTime}ms`); // 响应时间始终显示
        
        // 显示结果
        resultsElement.style.display = 'block';
        resultsElement.classList.add('active');
        
        // 添加动画效果
        await this.animateResults();
        
        // 启用操作按钮
        document.getElementById('copy-btn').disabled = false;
        document.getElementById('clear-btn').disabled = false;
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    updateElementWithVisibility(id, content, fieldName) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const parentItem = element.closest('.info-item');
        if (!parentItem) return;
        
        if (content && content.trim() !== '') {
            element.textContent = content;
            parentItem.style.display = 'block';
        } else {
            parentItem.style.display = 'none';
        }
    }

    updateImageElement(id, imageSrc) {
        const element = document.getElementById(id);
        if (element && imageSrc) {
            element.src = imageSrc;
            element.style.display = 'block';
            element.onerror = () => {
                element.style.display = 'none';
                const placeholder = element.nextElementSibling;
                if (placeholder && placeholder.classList.contains('image-placeholder')) {
                    placeholder.style.display = 'flex';
                }
            };
        } else if (element) {
            element.style.display = 'none';
            const placeholder = element.nextElementSibling;
            if (placeholder && placeholder.classList.contains('image-placeholder')) {
                placeholder.style.display = 'flex';
            }
        }
    }

    updateImageElementWithVisibility(id, imageSrc) {
        const element = document.getElementById(id);
        const mediaSection = document.querySelector('.media-info');
        const mediaPreview = document.getElementById('media-preview');
        
        if (imageSrc && imageSrc.trim() !== '') {
            element.textContent = imageSrc;
            if (mediaSection) mediaSection.style.display = 'block';
            
            if (mediaPreview) {
                mediaPreview.innerHTML = `
                    <img src="${imageSrc}" alt="OG Image" class="og-preview-image" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="no-media" style="display: none;">
                        <i class="fas fa-image-slash"></i>
                        <span>图片加载失败</span>
                    </div>
                `;
            }
        } else {
            if (mediaSection) mediaSection.style.display = 'none';
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return '未知';
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('zh-CN');
        } catch (e) {
            return '格式错误';
        }
    }

    async animateResults() {
        const cards = document.querySelectorAll('.info-card');
        
        for (let i = 0; i < cards.length; i++) {
            setTimeout(() => {
                cards[i].classList.add('animate-in');
            }, i * 100);
        }
        
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, cards.length * 100 + 300));
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        const errorText = errorElement.querySelector('.error-text');
        const inputContainer = document.querySelector('.input-container');
        
        errorText.textContent = message;
        errorElement.classList.add('active');
        
        // 添加震动效果
        if (inputContainer) {
            inputContainer.classList.add('shake');
            setTimeout(() => {
                inputContainer.classList.remove('shake');
            }, 600);
        }
        
        // 自动隐藏错误信息
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        const errorElement = document.getElementById('error-message');
        errorElement.classList.remove('active');
    }

    hideResults() {
        const resultsElement = document.getElementById('results');
        resultsElement.style.display = 'none';
        resultsElement.classList.remove('active');
        
        // 重置动画状态
        const cards = document.querySelectorAll('.info-card');
        cards.forEach(card => card.classList.remove('animate-in'));
    }

    showSuccessMessage(message) {
        const tipElement = document.getElementById('tip-message');
        const tipText = tipElement.querySelector('.tip-text');
        
        tipText.textContent = message;
        tipElement.classList.add('active');
        
        setTimeout(() => {
            tipElement.classList.remove('active');
        }, 3000);
    }

    shakeInput() {
        const inputContainer = document.querySelector('.input-container');
        inputContainer.classList.add('shake');
        
        setTimeout(() => {
            inputContainer.classList.remove('shake');
        }, 600);
    }

    copyResults() {
        const ogData = {
            title: document.getElementById('og-title').textContent,
            description: document.getElementById('og-description').textContent,
            url: document.getElementById('og-url').textContent,
            site_name: document.getElementById('og-site-name').textContent,
            type: document.getElementById('og-type').textContent,
            image: document.getElementById('og-image').src,
            locale: document.getElementById('og-locale').textContent
        };
        
        const jsonString = JSON.stringify(ogData, null, 2);
        
        navigator.clipboard.writeText(jsonString).then(() => {
            this.showSuccessMessage('结果已复制到剪贴板！');
            this.flashCopyButton();
        }).catch(err => {
            console.error('复制失败:', err);
            this.showError('复制失败，请手动选择内容');
        });
    }

    flashCopyButton() {
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.classList.add('flash');
        
        setTimeout(() => {
            copyBtn.classList.remove('flash');
        }, 300);
    }

    clearResults() {
        const urlInput = document.getElementById('url-input');
        const resultsElement = document.getElementById('results');
        const errorElement = document.getElementById('error-message');
        
        urlInput.value = '';
        urlInput.classList.remove('error');
        resultsElement.style.display = 'none';
        resultsElement.classList.remove('active');
        errorElement.classList.remove('active');
        
        document.getElementById('analyze-btn').classList.remove('ready');
        document.getElementById('copy-btn').disabled = true;
        document.getElementById('clear-btn').disabled = true;
        
        this.currentUrl = '';
        
        // 重置所有字段的显示状态
        const infoItems = document.querySelectorAll('.info-item');
        infoItems.forEach(item => item.style.display = 'block');
        
        const mediaSection = document.querySelector('.media-info');
        if (mediaSection) mediaSection.style.display = 'block';
        
        // 重置动画状态
        const cards = document.querySelectorAll('.info-card');
        cards.forEach(card => card.classList.remove('animate-in'));
        
        this.showSuccessMessage('已清除所有内容');
    }

    createBackgroundEffects() {
        const container = document.querySelector('.background-container');
        
        // 创建各种背景效果层
        const effects = [
            'geometric-grid',
            'neural-network', 
            'particle-system',
            'scan-lines',
            'holographic-overlay',
            'data-stream',
            'quantum-waves'
        ];
        
        effects.forEach(effectClass => {
            const layer = document.createElement('div');
            layer.className = effectClass;
            container.appendChild(layer);
        });
    }

    createInputGlow() {
        const inputContainer = document.querySelector('.input-container');
        
        // 创建光晕效果
        const glow = document.createElement('div');
        glow.className = 'input-glow';
        inputContainer.appendChild(glow);
        
        setTimeout(() => {
            if (glow.parentNode) {
                glow.remove();
            }
        }, 2000);
    }

    startScannerAnimation() {
        const scanner = document.querySelector('.scanner');
        if (scanner) {
            scanner.classList.add('active');
        }
    }

    stopScannerAnimation() {
        const scanner = document.querySelector('.scanner');
        if (scanner) {
            scanner.classList.remove('active');
        }
    }

    initializeAnimations() {
        // 初始化页面动画
        const header = document.querySelector('.header');
        const querySection = document.querySelector('.query-section');
        
        setTimeout(() => {
            header.classList.add('animate-in');
        }, 100);
        
        setTimeout(() => {
            querySection.classList.add('animate-in');
        }, 300);
    }

    showWelcomeMessage() {
        const tips = [
            '支持分析网页的标题、描述、图片等元信息',
            '可以预览社交媒体分享时的显示效果',
            '检测网页的SEO优化情况',
            '分析Open Graph协议标签'
        ];
        
        setTimeout(() => {
            this.showSuccessMessage('欢迎使用链接OG信息分析器！');
        }, 1000);
        
        // 显示提示信息
        this.showTips(tips);
    }

    // 显示提示信息
    showTips(tips) {
        const tipElement = document.getElementById('tip-message');
        const tipText = tipElement.querySelector('.tip-text');
        
        let currentTip = 0;
        
        const showNextTip = () => {
            tipText.textContent = tips[currentTip];
            tipElement.classList.add('active');
            tipElement.style.animation = 'fadeInUp 0.5s ease-out';
            
            setTimeout(() => {
                tipElement.style.animation = 'fadeOutDown 0.5s ease-in';
                setTimeout(() => {
                    tipElement.classList.remove('active');
                    currentTip = (currentTip + 1) % tips.length;
                }, 500);
            }, 3000);
        };
        
        // 首次显示
        setTimeout(showNextTip, 2000);
        
        // 每8秒显示一次
        setInterval(showNextTip, 8000);
    }
}

// 工具函数
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查必要的DOM元素
    const requiredElements = [
        'url-input', 'analyze-btn', 'copy-btn', 'clear-btn',
        'loading', 'results', 'error-message', 'tip-message'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('缺少必要的DOM元素:', missingElements);
        return;
    }
    
    // 初始化应用
    window.ogAnalyzer = new OGAnalyzer();
    
    // 添加全局错误处理
    window.addEventListener('error', (e) => {
        console.error('全局错误:', e.error);
        if (window.ogAnalyzer) {
            window.ogAnalyzer.showError('发生未知错误，请刷新页面重试');
        }
    });
    
    // 添加网络状态监听
    window.addEventListener('online', () => {
        if (window.ogAnalyzer) {
            window.ogAnalyzer.showSuccessMessage('网络连接已恢复');
        }
    });
    
    window.addEventListener('offline', () => {
        if (window.ogAnalyzer) {
            window.ogAnalyzer.showError('网络连接已断开');
        }
    });
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OGAnalyzer, debounce, throttle };
}