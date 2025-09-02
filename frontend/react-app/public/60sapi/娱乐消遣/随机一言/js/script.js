// 随机一言 JavaScript 功能实现

class HitokotoApp {
    constructor() {
        // API接口列表
        this.apiEndpoints = [
            "https://60s-cf.viki.moe",
            "https://60s.viki.moe",
            "https://60s.b23.run",
            "https://60s.114128.xyz",
            "https://60s-cf.114128.xyz"
        ];
        
        this.currentEndpointIndex = 0;
        this.isLoading = false;
        
        // DOM 元素
        this.elements = {
            loading: document.getElementById('loading'),
            quoteDisplay: document.getElementById('quoteDisplay'),
            quoteText: document.getElementById('quoteText'),
            quoteIndex: document.getElementById('quoteIndex'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            refreshBtn: document.getElementById('refreshBtn')
        };
        
        this.init();
    }
    
    // 初始化应用
    init() {
        this.bindEvents();
        this.hideAllStates();
        this.showQuoteDisplay();
    }
    
    // 绑定事件
    bindEvents() {
        this.elements.refreshBtn.addEventListener('click', () => {
            this.fetchHitokoto();
        });
        
        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isLoading) {
                e.preventDefault();
                this.fetchHitokoto();
            }
        });
    }
    
    // 隐藏所有状态
    hideAllStates() {
        this.elements.loading.classList.remove('show');
        this.elements.quoteDisplay.classList.remove('hide');
        this.elements.errorMessage.classList.remove('show');
    }
    
    // 显示加载状态
    showLoading() {
        this.hideAllStates();
        this.elements.loading.classList.add('show');
        this.elements.quoteDisplay.classList.add('hide');
        this.elements.refreshBtn.disabled = true;
        this.isLoading = true;
    }
    
    // 显示一言内容
    showQuoteDisplay() {
        this.hideAllStates();
        this.elements.quoteDisplay.classList.remove('hide');
        this.elements.refreshBtn.disabled = false;
        this.isLoading = false;
    }
    
    // 显示错误信息
    showError(message) {
        this.hideAllStates();
        this.elements.errorMessage.classList.add('show');
        this.elements.errorText.textContent = message;
        this.elements.refreshBtn.disabled = false;
        this.isLoading = false;
    }
    
    // 获取一言数据
    async fetchHitokoto() {
        if (this.isLoading) return;
        
        this.showLoading();
        
        // 尝试所有API接口
        for (let i = 0; i < this.apiEndpoints.length; i++) {
            const endpointIndex = (this.currentEndpointIndex + i) % this.apiEndpoints.length;
            const endpoint = this.apiEndpoints[endpointIndex];
            
            try {
                const result = await this.tryFetchFromEndpoint(endpoint);
                if (result.success) {
                    this.currentEndpointIndex = endpointIndex;
                    this.displayHitokoto(result.data);
                    return;
                }
            } catch (error) {
                console.warn(`接口 ${endpoint} 请求失败:`, error.message);
                continue;
            }
        }
        
        // 所有接口都失败
        this.showError('所有接口都无法访问，请检查网络连接或稍后重试');
    }
    
    // 尝试从指定接口获取数据
    async tryFetchFromEndpoint(endpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        try {
            const response = await fetch(`${endpoint}/v2/hitokoto?encoding=text`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 验证返回数据格式
            if (data.code === 200 && data.data && data.data.hitokoto) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                throw new Error('返回数据格式不正确');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            
            throw error;
        }
    }
    
    // 显示一言内容
    displayHitokoto(data) {
        // 更新一言文本
        this.elements.quoteText.textContent = data.hitokoto;
        
        // 更新序号信息
        if (data.index) {
            this.elements.quoteIndex.textContent = `第 ${data.index} 条`;
        } else {
            this.elements.quoteIndex.textContent = '';
        }
        
        // 添加淡入动画效果
        this.elements.quoteText.style.opacity = '0';
        this.elements.quoteIndex.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.quoteText.style.transition = 'opacity 0.5s ease';
            this.elements.quoteIndex.style.transition = 'opacity 0.5s ease';
            this.elements.quoteText.style.opacity = '1';
            this.elements.quoteIndex.style.opacity = '1';
        }, 100);
        
        this.showQuoteDisplay();
        
        // 控制台输出调试信息
        console.log('一言获取成功:', {
            content: data.hitokoto,
            index: data.index,
            endpoint: this.apiEndpoints[this.currentEndpointIndex]
        });
    }
    
    // 获取随机接口（用于负载均衡）
    getRandomEndpoint() {
        const randomIndex = Math.floor(Math.random() * this.apiEndpoints.length);
        return this.apiEndpoints[randomIndex];
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new HitokotoApp();
    
    // 添加全局错误处理
    window.addEventListener('error', (event) => {
        console.error('页面发生错误:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
    });
    
    // 页面可见性变化时的处理
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !app.isLoading) {
            // 页面重新可见时，可以选择刷新内容
            console.log('页面重新可见');
        }
    });
    
    console.log('随机一言应用初始化完成');
});

// 导出应用类（如果需要在其他地方使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HitokotoApp;
}