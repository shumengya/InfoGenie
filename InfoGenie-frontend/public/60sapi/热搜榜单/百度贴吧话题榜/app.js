// 主应用程序文件
class HotTopicsApp {
    constructor() {
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2秒
    }

    // 初始化应用
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('初始化百度贴吧热搜应用...');
            
            // 检查必要的元素是否存在
            this.checkRequiredElements();
            
            // 加载初始数据
            await this.loadHotTopics();
            
            // 设置自动刷新
            this.setupAutoRefresh();
            
            // 设置页面可见性监听
            this.setupVisibilityListener();
            
            this.isInitialized = true;
            console.log('应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            uiManager.showError('应用初始化失败，请刷新页面重试');
        }
    }

    // 检查必要元素
    checkRequiredElements() {
        const requiredElements = ['loading', 'error', 'hotList', 'refreshBtn', 'updateTime'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`缺少必要元素: ${missingElements.join(', ')}`);
        }
    }

    // 加载热搜数据
    async loadHotTopics() {
        try {
            console.log('开始获取热搜数据...');
            uiManager.showLoading();
            
            const result = await hotTopicsAPI.fetchHotTopics();
            
            if (result.success) {
                console.log('数据获取成功:', result.data.data?.length || 0, '条记录');
                uiManager.renderHotTopics(result.data);
                this.retryCount = 0; // 重置重试计数
                
                // 如果是缓存数据，显示提示
                if (result.isCache) {
                    uiManager.showToast('当前显示缓存数据', 3000);
                }
            } else {
                throw new Error(result.error || '数据获取失败');
            }
            
        } catch (error) {
            console.error('加载热搜数据失败:', error);
            
            // 重试逻辑
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`第 ${this.retryCount} 次重试...`);
                
                uiManager.showToast(`加载失败，${this.retryDelay / 1000}秒后重试...`, this.retryDelay);
                
                setTimeout(() => {
                    this.loadHotTopics();
                }, this.retryDelay);
                
                // 增加重试延迟
                this.retryDelay = Math.min(this.retryDelay * 1.5, 10000);
            } else {
                uiManager.showError('数据加载失败，请检查网络连接后重试');
                this.retryCount = 0;
                this.retryDelay = 2000;
            }
        }
    }

    // 设置自动刷新
    setupAutoRefresh() {
        // 每5分钟自动刷新一次
        setInterval(() => {
            if (document.visibilityState === 'visible' && !uiManager.isLoading) {
                console.log('自动刷新数据...');
                this.loadHotTopics();
            }
        }, 5 * 60 * 1000); // 5分钟
    }

    // 设置页面可见性监听
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // 页面变为可见时，检查是否需要刷新数据
                const lastUpdate = localStorage.getItem('lastUpdateTime');
                const now = Date.now();
                
                if (!lastUpdate || (now - parseInt(lastUpdate)) > 10 * 60 * 1000) {
                    // 超过10分钟没更新，自动刷新
                    console.log('页面重新可见，刷新数据...');
                    this.loadHotTopics();
                }
            }
        });
    }

    // 手动刷新
    async refresh() {
        if (uiManager.isLoading) {
            console.log('正在加载中，忽略刷新请求');
            return;
        }
        
        console.log('手动刷新数据...');
        this.retryCount = 0;
        this.retryDelay = 2000;
        await this.loadHotTopics();
    }

    // 获取应用状态
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isLoading: uiManager.isLoading,
            retryCount: this.retryCount,
            lastUpdate: localStorage.getItem('lastUpdateTime')
        };
    }
}

// 创建应用实例
const app = new HotTopicsApp();

// 全局函数，供HTML调用
window.loadHotTopics = () => app.loadHotTopics();
window.refreshData = () => app.refresh();
window.getAppStatus = () => app.getStatus();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    // 如果页面已经加载完成
    app.init();
}

// 错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 如果是网络错误，显示友好提示
    if (event.error?.message?.includes('fetch') || 
        event.error?.message?.includes('network') ||
        event.error?.message?.includes('Failed to fetch')) {
        uiManager.showToast('网络连接异常，请检查网络设置');
    }
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    
    // 防止默认的错误处理
    event.preventDefault();
    
    // 显示用户友好的错误信息
    if (event.reason?.message?.includes('fetch') || 
        event.reason?.message?.includes('network')) {
        uiManager.showToast('网络请求失败，请稍后重试');
    }
});

// 导出应用实例（用于调试）
window.hotTopicsApp = app;

// 开发模式下的调试信息
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 百度贴吧热搜应用已启动');
    console.log('📱 响应式设计已启用');
    console.log('🔄 自动刷新已设置（5分钟间隔）');
    console.log('💡 可用调试命令:');
    console.log('   - hotTopicsApp.getStatus() // 获取应用状态');
    console.log('   - hotTopicsApp.refresh() // 手动刷新');
    console.log('   - loadHotTopics() // 重新加载数据');
}