// 每天60s读懂世界 - JavaScript功能实现

const API = {
    endpoints: [],
    currentIndex: 0,
    params: {
        encoding: 'json'
    },
    localFallback: '返回接口.json',
    // 初始化API接口列表
    async init() {
        try {
            const res = await fetch('./接口集合.json');
            const endpoints = await res.json();
            this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/60s`);
        } catch (e) {
            // 如果无法加载接口集合，使用默认接口
            this.endpoints = ['https://60s.viki.moe/v2/60s'];
        }
    },
    // 获取当前接口URL
    getCurrentUrl() {
        if (this.endpoints.length === 0) return null;
        const url = new URL(this.endpoints[this.currentIndex]);
        Object.entries(this.params).forEach(([k, v]) => url.searchParams.append(k, v));
        return url.toString();
    },
    // 切换到下一个接口
    switchToNext() {
        this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
        return this.currentIndex < this.endpoints.length;
    },
    // 重置到第一个接口
    reset() {
        this.currentIndex = 0;
    }
};

class NewsApp {
    constructor() {
        this.apiUrl = 'https://60s.viki.moe/v2/60s';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTodayNews();
    }

    bindEvents() {
        // 移除了刷新按钮，不需要绑定事件
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    showLoading() {
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>正在获取最新资讯...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="error">
                    <h3>😔 获取失败</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    async loadNews() {
        try {
            this.showLoading();
            
            // 尝试从API获取数据
            let data = await this.fetchFromAPI();
            
            // 如果API失败，尝试本地数据
            if (!data) {
                data = await this.fetchFromLocal();
            }
            
            if (!data) {
                throw new Error('无法获取数据，请检查网络连接或稍后重试');
            }
            
            if (data.code !== 200) {
                throw new Error(data.message || '获取数据失败');
            }
            
            this.renderNews(data.data);
            
        } catch (error) {
            console.error('获取新闻失败:', error);
            this.showError(error.message || '网络连接失败，请检查网络后重试');
        }
    }

    async fetchFromAPI() {
        // 初始化API接口列表
        await API.init();
        
        // 重置API索引到第一个接口
        API.reset();
        
        // 尝试所有API接口
        for (let i = 0; i < API.endpoints.length; i++) {
            try {
                const url = API.getCurrentUrl();
                console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
                
                const resp = await fetch(url, { 
                    cache: 'no-store'
                });
                
                if (!resp.ok) {
                    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                }
                
                const data = await resp.json();
                
                if (data && data.code === 200) {
                    console.log(`接口 ${i + 1} 请求成功`);
                    return data;
                }
                
                throw new Error(data && data.message ? data.message : '接口返回异常');
                
            } catch (e) {
                console.warn(`接口 ${i + 1} 失败:`, e.message);
                
                // 如果不是最后一个接口，切换到下一个
                if (i < API.endpoints.length - 1) {
                    API.switchToNext();
                    continue;
                }
                
                // 所有接口都失败了
                console.warn('所有远程接口都失败，尝试本地数据');
                return null;
            }
        }
    }

    async fetchFromLocal() {
        try {
            const resp = await fetch(API.localFallback + `?t=${Date.now()}`);
            if (!resp.ok) throw new Error(`本地文件HTTP ${resp.status}`);
            const data = await resp.json();
            return data;
        } catch (e) {
            console.error('读取本地返回接口.json失败:', e);
            return null;
        }
    }

    loadTodayNews() {
        this.loadNews();
    }

    renderNews(newsData) {
        const contentDiv = document.getElementById('content');
        if (!contentDiv || !newsData) return;

        const {
            date,
            day_of_week,
            lunar_date,
            news,
            tip,
            link
        } = newsData;

        let newsListHtml = '';
        if (news && news.length > 0) {
            newsListHtml = news.map(item => `
                <div class="news-item">
                    ${this.escapeHtml(item)}
                </div>
            `).join('');
        }

        // 移除图片显示功能

        const tipHtml = tip ? `
            <div class="daily-tip">
                💡 ${this.escapeHtml(tip)}
            </div>
        ` : '';

        const linkHtml = link ? `
            <div style="text-align: center; margin-top: 20px;">
                <a href="${this.escapeHtml(link)}" target="_blank" class="btn" style="text-decoration: none; display: inline-block;">
                    📖 查看原文
                </a>
            </div>
        ` : '';

        contentDiv.innerHTML = `
            <div class="news-header">
                <div>
                    <div class="news-date">${this.escapeHtml(date)} ${this.escapeHtml(day_of_week || '')}</div>
                    ${lunar_date ? `<div class="lunar-date">${this.escapeHtml(lunar_date)}</div>` : ''}
                </div>
            </div>
            
            ${tipHtml}
            
            <div class="news-list">
                <h3 style="margin-bottom: 20px; color: #2d5016; font-size: 1.3rem;">📰 今日要闻</h3>
                ${newsListHtml}
            </div>
            
            ${linkHtml}
            
            <div style="text-align: center; margin-top: 30px; color: #5a7c65; font-size: 0.9rem;">
                <p>数据来源：每天60秒读懂世界</p>
                <p>更新时间：${newsData.api_updated || '未知'}</p>
            </div>
        `;
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    window.newsApp = new NewsApp();
});

// 添加一些实用功能
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制');
    });
}

function showToast(message) {
    // 创建提示框
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a5568;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 3000);
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R 刷新数据
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (window.newsApp) {
            window.newsApp.loadNews();
        }
    }
});