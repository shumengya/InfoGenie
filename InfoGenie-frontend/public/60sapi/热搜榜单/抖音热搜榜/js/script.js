// 本地后端API接口
const LOCAL_API_BASE = 'https://infogenie.api.shumengya.top/api/60s';

// API接口列表（备用）
const API_ENDPOINTS = [
    "https://60s.api.shumengya.top",
];

// 当前使用的API索引
let currentApiIndex = 0;
let useLocalApi = true;

// DOM元素
const loadingElement = document.getElementById('loading');
const hotListElement = document.getElementById('hotList');
const errorMessageElement = document.getElementById('errorMessage');
const updateTimeElement = document.getElementById('updateTime');
const refreshBtn = document.getElementById('refreshBtn');

// 页面加载完成后自动加载数据
document.addEventListener('DOMContentLoaded', function() {
    loadHotList();
});

// 刷新按钮点击事件
refreshBtn.addEventListener('click', function() {
    loadHotList();
});

// 加载热搜列表
async function loadHotList() {
    showLoading();
    hideError();
    
    try {
        const data = await fetchData();
        displayHotList(data.data);
        updateRefreshTime();
    } catch (error) {
        console.error('加载失败:', error);
        showError();
    }
    
    hideLoading();
}

// 获取数据
async function fetchData() {
    // 优先尝试本地API
    if (useLocalApi) {
        try {
            const response = await fetch(`${LOCAL_API_BASE}/douyin`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                timeout: 10000
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.code === 200 && data.data) {
                    return data;
                }
            }
        } catch (error) {
            console.warn('本地API请求失败，切换到外部API:', error);
            useLocalApi = false;
        }
    }
    
    // 使用外部API作为备用
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const apiUrl = API_ENDPOINTS[currentApiIndex];
        
        try {
            const response = await fetch(`${apiUrl}/v2/douyin`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                timeout: 10000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                return data;
            } else {
                throw new Error('数据格式错误');
            }
        } catch (error) {
            console.error(`API ${apiUrl} 请求失败:`, error);
            currentApiIndex = (currentApiIndex + 1) % API_ENDPOINTS.length;
            
            if (i === API_ENDPOINTS.length - 1) {
                throw new Error('所有API接口都无法访问');
            }
        }
    }
}

// 显示热搜列表
function displayHotList(hotData) {
    hotListElement.innerHTML = '';
    
    hotData.forEach((item, index) => {
        const hotItem = createHotItem(item, index + 1);
        hotListElement.appendChild(hotItem);
    });
}

// 创建热搜项目
function createHotItem(item, rank) {
    const hotItem = document.createElement('div');
    hotItem.className = 'hot-item';
    
    // 排名样式类
    let rankClass = 'hot-rank';
    if (rank === 1) rankClass += ' rank-1';
    else if (rank === 2) rankClass += ' rank-2';
    else if (rank === 3) rankClass += ' rank-3';
    
    const formattedHotValue = formatHotValue(item.hot_value);
    const formattedTime = formatTime(item.event_time);
    
    // 根据排名添加特殊标识
    let rankEmoji = '';
    if (rank === 1) rankEmoji = '👑';
    else if (rank === 2) rankEmoji = '🥈';
    else if (rank === 3) rankEmoji = '🥉';
    else if (rank <= 10) rankEmoji = '🔥';
    
    // 根据热度值添加火焰等级
    let fireLevel = '';
    if (item.hot_value >= 10000000) fireLevel = '🔥';
    else if (item.hot_value >= 5000000) fireLevel = '🔥';
    else fireLevel = '🔥';
    
    hotItem.innerHTML = `
        <div class="hot-rank-container">
            <div class="${rankClass}">
                <div class="rank-number">${rank}</div>
                <div class="rank-emoji">${rankEmoji}</div>
            </div>
        </div>
        <img src="${item.cover}" alt="${escapeHtml(item.title)}" class="hot-cover" onerror="handleImageError(this)">
        <div class="hot-content-wrapper">
            <div class="hot-title">${escapeHtml(item.title)}</div>
            <div class="hot-bottom-row">
                <div class="hot-time">
                    <span class="meta-text">${formattedTime}</span>
                </div>
                <div class="hot-value">
                    <span class="heat-level">${fireLevel}</span>
                    <span class="value-text">${formattedHotValue}</span>
                </div>
                <a href="${item.link}" target="_blank" class="hot-link">
                    <span class="link-text">观看视频</span>
                </a>
            </div>
        </div>
    `;
    
    return hotItem;
}

// 格式化热度值
function formatHotValue(value) {
    if (value >= 100000000) {
        return (value / 100000000).toFixed(1) + '亿';
    } else if (value >= 10000) {
        return (value / 10000).toFixed(1) + '万';
    } else {
        return value.toLocaleString();
    }
}

// 格式化时间
function formatTime(timeStr) {
    try {
        const formattedTime = timeStr.replace(/\//g, '-');
        const date = new Date(formattedTime);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}天前`;
        } else if (hours > 0) {
            return `${hours}小时前`;
        } else if (minutes > 0) {
            return `${minutes}分钟前`;
        } else {
            return '刚刚';
        }
    } catch (error) {
        return timeStr;
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 图片加载错误处理
function handleImageError(img) {
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik00MCAyMEM0NCAyMCA0NyAyMyA0NyAyN1Y1M0M0NyA1NyA0NCA2MCA0MCA2MEgxNkMxMiA2MCA5IDU3IDkgNTNWMjdDOSAyMyAxMiAyMCAxNiAyMEg0MFoiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjMzIiBjeT0iMzIiIHI9IjMiIGZpbGw9IiNjY2NjY2MiLz4KPHBhdGggZD0iTTEzIDQ4TDIzIDM4TDMzIDQ4TDQzIDM4TDUzIDQ4IiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
    img.alt = '图片加载失败';
}

// 更新刷新时间
function updateRefreshTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    updateTimeElement.textContent = `最后更新: ${timeStr}`;
    
    // 添加成功提示
    showSuccessMessage('🎉 数据已更新');
}

// 显示成功消息
function showSuccessMessage(message) {
    // 移除之前的提示
    const existingToast = document.querySelector('.success-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #66bb6a);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        font-weight: 600;
        font-size: 0.9em;
        animation: slideIn 0.3s ease-out;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 添加CSS动画到页面
if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(style);
}

// 显示加载状态
function showLoading() {
    loadingElement.style.display = 'block';
    hotListElement.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
    loadingElement.style.display = 'none';
    hotListElement.style.display = 'block';
}

// 显示错误信息
function showError() {
    errorMessageElement.style.display = 'block';
    hotListElement.style.display = 'none';
}

// 隐藏错误信息
function hideError() {
    errorMessageElement.style.display = 'none';
}

// 自动刷新 (每5分钟)
setInterval(function() {
    loadHotList();
}, 5 * 60 * 1000);
