/**
 * 懂车帝热搜应用主程序
 * 整合API和UI模块，管理应用生命周期
 */
class CarHotTopicsApp {
    constructor() {
        this.api = null;
        this.ui = null;
        this.autoRefreshInterval = null;
        this.autoRefreshDelay = 5 * 60 * 1000; // 5分钟自动刷新
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('[App] 开始初始化懂车帝热搜应用...');
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 检查必需的类是否存在
            if (!window.CarHotTopicsAPI || !window.UIManager) {
                throw new Error('缺少必需的模块：CarHotTopicsAPI 或 UIManager');
            }
            
            // 初始化模块
            this.api = new window.CarHotTopicsAPI();
            this.ui = new window.UIManager();
            
            // 检查必需的DOM元素
            this.checkRequiredElements();
            
            // 绑定事件
            this.bindEvents();
            
            // 首次加载数据
            await this.loadData();
            
            // 设置自动刷新
            this.setupAutoRefresh();
            
            // 设置页面可见性监听
            this.setupVisibilityListener();
            
            this.isInitialized = true;
            console.log('[App] 应用初始化完成');
            
        } catch (error) {
            console.error('[App] 初始化失败:', error);
            this.handleInitError(error);
        }
    }

    /**
     * 检查必需的DOM元素
     */
    checkRequiredElements() {
        const requiredIds = ['loading', 'error', 'hotList', 'topicsContainer', 'refreshBtn'];
        const missingElements = requiredIds.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`缺少必需的DOM元素: ${missingElements.join(', ')}`);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 监听UI触发的刷新事件
        document.addEventListener('refreshData', () => {
            this.handleManualRefresh();
        });

        // 监听网络状态变化
        window.addEventListener('online', () => {
            console.log('[App] 网络已连接，尝试刷新数据');
            this.ui.showToast('网络已连接');
            this.loadData();
        });

        window.addEventListener('offline', () => {
            console.log('[App] 网络已断开');
            this.ui.showToast('网络连接已断开');
        });

        // 监听页面错误
        window.addEventListener('error', (event) => {
            console.error('[App] 页面错误:', event.error);
        });

        // 监听未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] 未处理的Promise拒绝:', event.reason);
            event.preventDefault();
        });
    }

    /**
     * 加载热搜数据
     * @param {boolean} showLoading - 是否显示加载状态
     */
    async loadData(showLoading = true) {
        try {
            if (showLoading) {
                this.ui.showLoading();
            }
            
            console.log('[App] 开始加载热搜数据...');
            const data = await this.api.fetchHotTopics();
            
            console.log('[App] 数据加载成功:', data);
            this.ui.showHotList(data);
            
            // 重置自动刷新计时器
            this.resetAutoRefresh();
            
        } catch (error) {
            console.error('[App] 数据加载失败:', error);
            this.ui.showError(error.message);
            
            // 如果是网络错误，延迟重试
            if (this.isNetworkError(error)) {
                setTimeout(() => {
                    if (navigator.onLine) {
                        this.loadData(false);
                    }
                }, 30000); // 30秒后重试
            }
        }
    }

    /**
     * 处理手动刷新
     */
    async handleManualRefresh() {
        console.log('[App] 手动刷新数据');
        await this.loadData();
    }

    /**
     * 设置自动刷新
     */
    setupAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        this.autoRefreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && navigator.onLine) {
                console.log('[App] 自动刷新数据');
                this.loadData(false);
            }
        }, this.autoRefreshDelay);
        
        console.log(`[App] 自动刷新已设置，间隔: ${this.autoRefreshDelay / 1000}秒`);
    }

    /**
     * 重置自动刷新计时器
     */
    resetAutoRefresh() {
        this.setupAutoRefresh();
    }

    /**
     * 设置页面可见性监听
     */
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[App] 页面变为可见');
                
                // 检查数据是否需要更新
                const currentData = this.ui.getCurrentData();
                if (currentData) {
                    const lastUpdate = new Date(currentData.updateTime);
                    const now = new Date();
                    const timeDiff = now - lastUpdate;
                    
                    // 如果数据超过3分钟，自动刷新
                    if (timeDiff > 3 * 60 * 1000) {
                        console.log('[App] 数据已过期，自动刷新');
                        this.loadData(false);
                    }
                }
            } else {
                console.log('[App] 页面变为隐藏');
            }
        });
    }

    /**
     * 判断是否为网络错误
     * @param {Error} error - 错误对象
     * @returns {boolean} 是否为网络错误
     */
    isNetworkError(error) {
        const networkErrorMessages = [
            'fetch',
            'network',
            'timeout',
            'connection',
            'offline'
        ];
        
        return networkErrorMessages.some(msg => 
            error.message.toLowerCase().includes(msg)
        );
    }

    /**
     * 处理初始化错误
     * @param {Error} error - 错误对象
     */
    handleInitError(error) {
        // 显示基本错误信息
        const errorContainer = document.getElementById('error');
        if (errorContainer) {
            errorContainer.style.display = 'flex';
            const errorMessage = errorContainer.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = `初始化失败: ${error.message}`;
            }
        }
        
        // 隐藏加载状态
        const loadingContainer = document.getElementById('loading');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
    }

    /**
     * 获取应用状态
     * @returns {Object} 应用状态信息
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasData: !!this.ui?.getCurrentData(),
            autoRefreshEnabled: !!this.autoRefreshInterval,
            isOnline: navigator.onLine,
            isVisible: document.visibilityState === 'visible'
        };
    }

    /**
     * 销毁应用
     */
    destroy() {
        console.log('[App] 销毁应用');
        
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        if (this.ui) {
            this.ui.clearData();
        }
        
        this.isInitialized = false;
    }
}

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('[Global] JavaScript错误:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global] 未处理的Promise拒绝:', event.reason);
});

// 应用启动
let app;

// 确保在DOM加载完成后启动应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new CarHotTopicsApp();
    });
} else {
    app = new CarHotTopicsApp();
}

// 导出应用实例（用于调试）
window.CarHotTopicsApp = CarHotTopicsApp;
window.app = app;

// 调试信息
console.log('[App] 懂车帝热搜应用脚本已加载');
console.log('[Debug] 可用的全局对象:', {
    CarHotTopicsAPI: !!window.CarHotTopicsAPI,
    UIManager: !!window.UIManager,
    CarHotTopicsApp: !!window.CarHotTopicsApp
});