// 历史上的今天 - JavaScript 功能实现

// API 配置
const API = {
    endpoints: [],
    currentIndex: 0,
    encoding: 'utf-8',
    // 初始化API接口列表
    async init() {
        try {
            const res = await fetch('./接口集合.json');
            const endpoints = await res.json();
            this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/today_in_history`);
        } catch (e) {
            // 如果无法加载接口集合，使用默认接口
            this.endpoints = ['https://60s.viki.moe/v2/today_in_history'];
        }
    },
    // 获取当前接口URL
    getCurrentUrl() {
        if (this.endpoints.length === 0) return null;
        const url = new URL(this.endpoints[this.currentIndex]);
        url.searchParams.append('encoding', this.encoding);
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

// 事件类型映射
const EVENT_TYPE_MAP = {
    'birth': { name: '诞生', icon: '🎂', color: '#27ae60' },
    'death': { name: '逝世', icon: '🕊️', color: '#e67e22' },
    'event': { name: '事件', icon: '📰', color: '#3498db' }
};

// DOM 元素
let elements = {};
let currentData = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initElements();
    loadTodayInHistory();
});

// 初始化 DOM 元素
function initElements() {
    elements = {
        loading: document.getElementById('loading'),
        content: document.getElementById('history-content'),
        dateInfo: document.getElementById('date-info'),
        dateText: document.getElementById('date-text'),
        totalEvents: document.getElementById('total-events'),
        birthEvents: document.getElementById('birth-events'),
        deathEvents: document.getElementById('death-events'),
        otherEvents: document.getElementById('other-events'),
        eventsList: document.getElementById('events-list')
    };
}

// 加载历史上的今天数据
async function loadTodayInHistory() {
    try {
        showLoading(true);
        
        // 初始化API接口列表
        await API.init();
        
        // 重置API索引到第一个接口
        API.reset();
        
        // 尝试所有API接口
        for (let i = 0; i < API.endpoints.length; i++) {
            try {
                const url = API.getCurrentUrl();
                console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
                
                const response = await fetch(url, { 
                    cache: 'no-store',
                    timeout: 10000 // 10秒超时
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('API响应数据:', data);
                
                if (data.code === 200 && data.data) {
                    console.log(`接口 ${i + 1} 请求成功`);
                    currentData = data.data;
                    displayHistoryData(data.data);
                    return;
                } else {
                    throw new Error(data.message || '获取数据失败');
                }
                
            } catch (error) {
                console.warn(`接口 ${i + 1} 失败:`, error.message);
                
                // 如果不是最后一个接口，切换到下一个
                if (i < API.endpoints.length - 1) {
                    API.switchToNext();
                    continue;
                }
                
                // 所有接口都失败了，抛出错误
                throw new Error('所有接口都无法访问');
            }
        }
        
    } catch (error) {
        console.error('加载历史数据失败:', error);
        showError(`加载失败: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 显示历史数据
function displayHistoryData(data) {
    if (!data || !data.items) {
        showError('没有获取到历史数据');
        return;
    }
    
    // 更新日期信息
    updateDateInfo(data);
    
    // 更新统计信息
    updateStats(data.items);
    
    // 显示事件列表
    renderEventsList(data.items);
    
    // 显示内容区域
    if (elements.content) {
        elements.content.classList.add('fade-in');
        elements.content.style.display = 'block';
    }
}

// 更新日期信息
function updateDateInfo(data) {
    if (elements.dateText && data.date) {
        const today = new Date();
        const year = today.getFullYear();
        elements.dateText.textContent = `${year}年${data.month}月${data.day}日`;
    }
}

// 更新统计信息
function updateStats(items) {
    const stats = {
        total: items.length,
        birth: items.filter(item => item.event_type === 'birth').length,
        death: items.filter(item => item.event_type === 'death').length,
        event: items.filter(item => item.event_type === 'event').length
    };
    
    if (elements.totalEvents) {
        elements.totalEvents.textContent = stats.total;
    }
    
    if (elements.birthEvents) {
        elements.birthEvents.textContent = stats.birth;
    }
    
    if (elements.deathEvents) {
        elements.deathEvents.textContent = stats.death;
    }
    
    if (elements.otherEvents) {
        elements.otherEvents.textContent = stats.event;
    }
}

// 渲染事件列表
function renderEventsList(items) {
    if (!elements.eventsList || !items) return;
    
    // 按年份排序（从今到古）
    const sortedItems = [...items].sort((a, b) => {
        return parseInt(b.year) - parseInt(a.year);
    });
    
    elements.eventsList.innerHTML = '';
    
    sortedItems.forEach(item => {
        const eventCard = createEventCard(item);
        elements.eventsList.appendChild(eventCard);
    });
}

// 创建事件卡片
function createEventCard(item) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const eventType = EVENT_TYPE_MAP[item.event_type] || EVENT_TYPE_MAP['event'];
    
    card.innerHTML = `
        <div class="event-type ${item.event_type}">${eventType.name}</div>
        <div class="event-year">${formatYear(item.year)}</div>
        <div class="event-title">${escapeHtml(item.title)}</div>
        <div class="event-description">${escapeHtml(item.description)}</div>
        ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="event-link">了解更多</a>` : ''}
    `;
    
    return card;
}

// 格式化年份显示
function formatYear(year) {
    const yearNum = parseInt(year);
    if (yearNum < 0) {
        return `公元前${Math.abs(yearNum)}年`;
    } else if (yearNum < 1000) {
        return `公元${yearNum}年`;
    } else {
        return `${yearNum}年`;
    }
}

// 显示加载状态
function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? 'block' : 'none';
    }
    
    if (elements.content) {
        elements.content.style.display = show ? 'none' : 'block';
    }
}

// 显示错误信息
function showError(message) {
    if (elements.content) {
        elements.content.innerHTML = `
            <div class="error">
                <h3>😔 加载失败</h3>
                <p>${escapeHtml(message)}</p>
                <button onclick="loadTodayInHistory()" style="
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">重新加载</button>
            </div>
        `;
        elements.content.style.display = 'block';
    }
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('页面错误:', event.error);
});

// 网络状态监听
window.addEventListener('online', function() {
    console.log('网络已连接');
});

window.addEventListener('offline', function() {
    console.log('网络已断开');
    showError('网络连接已断开，请检查网络设置');
});

// 导出全局方法
window.TodayInHistory = {
    loadTodayInHistory,
    showError,
    showLoading
};