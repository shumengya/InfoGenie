// API接口列表
const API_ENDPOINTS = [
    "https://60s-cf.viki.moe",
    "https://60s.viki.moe", 
    "https://60s.b23.run",
    "https://60s.114128.xyz",
    "https://60s-cf.114128.xyz"
];

// 当前使用的API索引
let currentApiIndex = 0;
let currentType = 'top';

// DOM元素
const loadingElement = document.getElementById('loading');
const newsListElement = document.getElementById('newsList');
const errorMessageElement = document.getElementById('errorMessage');
const updateTimeElement = document.getElementById('updateTime');
const refreshBtn = document.getElementById('refreshBtn');
const tabBtns = document.querySelectorAll('.tab-btn');

// 页面加载完成后自动加载数据
document.addEventListener('DOMContentLoaded', function() {
    loadNewsList();
    initTabEvents();
});

// 初始化标签事件
function initTabEvents() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            if (type !== currentType) {
                currentType = type;
                updateActiveTab(this);
                loadNewsList();
            }
        });
    });
}

// 更新活跃标签
function updateActiveTab(activeBtn) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// 刷新按钮点击事件
refreshBtn.addEventListener('click', function() {
    loadNewsList();
});

// 加载新闻列表
async function loadNewsList() {
    showLoading();
    hideError();
    
    try {
        const data = await fetchData();
        displayNewsList(data.data);
        updateRefreshTime();
    } catch (error) {
        console.error('加载失败:', error);
        showError();
    }
    
    hideLoading();
}

// 获取数据
async function fetchData() {
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const apiUrl = API_ENDPOINTS[currentApiIndex];
        
        try {
            const response = await fetch(`${apiUrl}/v2/hacker-news/${currentType}`, {
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

// 显示新闻列表
function displayNewsList(newsData) {
    newsListElement.innerHTML = '';
    
    newsData.forEach((item, index) => {
        const newsItem = createNewsItem(item, index + 1);
        newsListElement.appendChild(newsItem);
    });
}

// 创建新闻项目
function createNewsItem(item, rank) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    
    const rankClass = rank <= 5 ? 'news-rank top-5' : 'news-rank';
    const formattedScore = formatScore(item.score);
    const formattedTime = formatTime(item.created);
    
    // 根据排名添加特殊标识
    let rankEmoji = '';
    if (rank === 1) rankEmoji = '🏆';
    else if (rank === 2) rankEmoji = '🥈';
    else if (rank === 3) rankEmoji = '🥉';
    else if (rank <= 10) rankEmoji = '💎';
    else rankEmoji = '⭐';
    
    // 根据评分添加热度指示
    let heatLevel = '';
    if (item.score >= 1000) heatLevel = '🔥🔥🔥';
    else if (item.score >= 500) heatLevel = '🔥🔥';
    else if (item.score >= 100) heatLevel = '🔥';
    else heatLevel = '💫';
    
    newsItem.innerHTML = `
        <div class="news-header">
            <div class="${rankClass}">${rank}</div>
            <div class="news-score">${heatLevel} ${formattedScore}</div>
        </div>
        <div class="news-title">${rankEmoji} ${escapeHtml(item.title)}</div>
        <div class="news-meta">
            <div class="news-author">👤 ${escapeHtml(item.author)}</div>
            <div class="news-time">🕒 ${formattedTime}</div>
        </div>
        <a href="${item.link}" target="_blank" class="news-link">
            🚀 阅读全文
        </a>
    `;
    
    return newsItem;
}

// 格式化评分
function formatScore(score) {
    if (score >= 1000) {
        return (score / 1000).toFixed(1) + 'K';
    } else {
        return score.toString();
    }
}

// 格式化时间
function formatTime(timeStr) {
    try {
        const date = new Date(timeStr);
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
    showSuccessMessage('🌈 数据已更新');
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
        background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
        z-index: 1000;
        font-weight: 600;
        font-size: 0.9em;
        animation: rainbowToastSlide 0.5s ease-out;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.style.animation = 'rainbowToastSlideOut 0.5s ease-in forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 显示加载状态
function showLoading() {
    loadingElement.style.display = 'block';
    newsListElement.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
    loadingElement.style.display = 'none';
    newsListElement.style.display = 'block';
}

// 显示错误信息
function showError() {
    errorMessageElement.style.display = 'block';
    newsListElement.style.display = 'none';
}

// 隐藏错误信息
function hideError() {
    errorMessageElement.style.display = 'none';
}

// 添加CSS动画到页面
if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes rainbowToastSlide {
            from {
                opacity: 0;
                transform: translateX(100px) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
        }
        
        @keyframes rainbowToastSlideOut {
            from {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
            to {
                opacity: 0;
                transform: translateX(100px) scale(0.8);
            }
        }
        
        .success-toast {
            background-size: 200% 200%;
            animation: rainbowToastSlide 0.5s ease-out, toastRainbow 2s ease-in-out infinite !important;
        }
        
        @keyframes toastRainbow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
    `;
    document.head.appendChild(style);
}

// 自动刷新 (每5分钟)
setInterval(function() {
    loadNewsList();
}, 5 * 60 * 1000);

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        loadNewsList();
    }
    
    // 数字键切换标签
    if (e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const typeMap = { '1': 'top', '2': 'new', '3': 'best' };
        const targetType = typeMap[e.key];
        const targetBtn = document.querySelector(`[data-type="${targetType}"]`);
        if (targetBtn && targetType !== currentType) {
            currentType = targetType;
            updateActiveTab(targetBtn);
            loadNewsList();
        }
    }
});
