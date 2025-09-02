// 百度百科词条查询应用
class BaikeApp {
    constructor() {
        // API接口列表
        this.apiEndpoints = [
            'https://60s-cf.viki.moe',
            'https://60s.viki.moe',
            'https://60s.b23.run',
            'https://60s.114128.xyz',
            'https://60s-cf.114128.xyz'
        ];
        
        this.currentApiIndex = 0;
        this.isLoading = false;
        
        this.initElements();
        this.bindEvents();
    }
    
    // 初始化DOM元素
    initElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultSection = document.getElementById('resultSection');
        this.loading = document.getElementById('loading');
        this.resultCard = document.getElementById('resultCard');
        this.errorMessage = document.getElementById('errorMessage');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.retryBtn = document.getElementById('retryBtn');
        
        // 结果显示元素
        this.resultTitle = document.getElementById('resultTitle');
        this.resultDescription = document.getElementById('resultDescription');
        this.resultImage = document.getElementById('resultImage');
        this.resultAbstract = document.getElementById('resultAbstract');
        this.resultLink = document.getElementById('resultLink');
        this.errorText = document.getElementById('errorText');
    }
    
    // 绑定事件
    bindEvents() {
        // 搜索按钮点击事件
        this.searchBtn.addEventListener('click', () => {
            this.handleSearch();
        });
        
        // 输入框回车事件
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        // 重试按钮事件
        this.retryBtn.addEventListener('click', () => {
            this.handleSearch();
        });
        
        // 输入框焦点事件
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.select();
        });
    }
    
    // 处理搜索
    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.showError('请输入要查询的词条');
            this.searchInput.focus();
            return;
        }
        
        if (this.isLoading) {
            return;
        }
        
        await this.searchBaike(query);
    }
    
    // 搜索百科词条
    async searchBaike(query) {
        this.showLoading();
        this.isLoading = true;
        
        // 重置API索引
        this.currentApiIndex = 0;
        
        const success = await this.tryApiCall(query);
        
        if (!success) {
            this.showError('所有API接口都无法访问，请稍后重试');
        }
        
        this.isLoading = false;
    }
    
    // 尝试API调用
    async tryApiCall(query) {
        for (let i = 0; i < this.apiEndpoints.length; i++) {
            const endpoint = this.apiEndpoints[this.currentApiIndex];
            
            try {
                const result = await this.callApi(endpoint, query);
                if (result) {
                    this.showResult(result);
                    return true;
                }
            } catch (error) {
                console.warn(`API ${endpoint} 调用失败:`, error.message);
            }
            
            // 切换到下一个API
            this.currentApiIndex = (this.currentApiIndex + 1) % this.apiEndpoints.length;
        }
        
        return false;
    }
    
    // 调用API
    async callApi(endpoint, query) {
        const url = `${endpoint}/v2/baike?word=${encodeURIComponent(query)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return data.data;
            } else {
                throw new Error(data.message || '未找到相关词条');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            
            throw error;
        }
    }
    
    // 显示加载状态
    showLoading() {
        this.hideAllSections();
        this.loading.style.display = 'flex';
    }
    
    // 显示搜索结果
    showResult(data) {
        this.hideAllSections();
        
        // 填充数据
        this.resultTitle.textContent = data.title || '未知标题';
        this.resultDescription.textContent = data.description || '暂无描述';
        this.resultAbstract.textContent = data.abstract || '暂无摘要信息';
        
        // 处理图片
        if (data.cover) {
            this.resultImage.src = data.cover;
            this.resultImage.style.display = 'block';
            this.resultImage.onerror = () => {
                this.resultImage.style.display = 'none';
            };
        } else {
            this.resultImage.style.display = 'none';
        }
        
        // 处理链接
        if (data.link) {
            this.resultLink.href = data.link;
            this.resultLink.style.display = 'inline-flex';
        } else {
            this.resultLink.style.display = 'none';
        }
        
        this.resultCard.style.display = 'block';
        
        // 滚动到结果区域
        this.resultCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // 显示错误信息
    showError(message) {
        this.hideAllSections();
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
    }
    
    // 隐藏所有区域
    hideAllSections() {
        this.loading.style.display = 'none';
        this.resultCard.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.welcomeMessage.style.display = 'none';
    }
    
    // 显示欢迎信息
    showWelcome() {
        this.hideAllSections();
        this.welcomeMessage.style.display = 'flex';
    }
}

// 工具函数
class Utils {
    // 防抖函数
    static debounce(func, wait) {
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
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 格式化文本长度
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
    
    // 检查是否为移动设备
    static isMobile() {
        return window.innerWidth <= 768;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用
    const app = new BaikeApp();
    
    // 添加页面可见性变化监听
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // 页面重新可见时，聚焦搜索框
            if (!app.isLoading) {
                app.searchInput.focus();
            }
        }
    });
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', Utils.throttle(() => {
        // 响应式调整
        if (Utils.isMobile()) {
            // 移动端特殊处理
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }, 250));
    
    // 初始检查设备类型
    if (Utils.isMobile()) {
        document.body.classList.add('mobile');
    }
    
    // 页面加载完成后聚焦搜索框
    setTimeout(() => {
        app.searchInput.focus();
    }, 500);
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            app.searchInput.focus();
            app.searchInput.select();
        }
        
        // ESC 清空搜索框
        if (e.key === 'Escape') {
            app.searchInput.value = '';
            app.showWelcome();
            app.searchInput.focus();
        }
    });
    
    console.log('百度百科词条查询应用已初始化');
});