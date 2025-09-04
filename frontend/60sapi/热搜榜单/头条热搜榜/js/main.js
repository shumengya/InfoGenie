// API接口列表
const API_ENDPOINTS = [
    "https://60s.viki.moe/v2/toutiao",
    "https://60s-cf.viki.moe/v2/toutiao",
    "https://60s.b23.run/v2/toutiao",
    "https://60s.114128.xyz/v2/toutiao",
    "https://60s-cf.114128.xyz/v2/toutiao"
];

// 当前使用的API索引
let currentApiIndex = 0;

// DOM元素
const hotListElement = document.getElementById('hotList');
const updateTimeElement = document.getElementById('updateTime');

// 格式化时间
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

// 渲染热搜列表
function renderHotList(data) {
    hotListElement.innerHTML = '';
    
    // 几何装饰符号数组
    const geometricSymbols = ['◆', '■', '▲', '●', '★', '◈', '◇', '□', '△', '○'];
    
    data.forEach((item, index) => {
        const hotItem = document.createElement('div');
        hotItem.className = 'hot-item';
        
        const rankClass = index < 3 ? `top-${index + 1}` : '';
        
        // 随机选择几何符号作为装饰
        const randomSymbol = geometricSymbols[index % geometricSymbols.length];
        
        // 处理热度值显示
        const hotValueDisplay = item.hot_value ? 
            `<div class="stat-item"><span class="hot-value">${randomSymbol} ${formatNumber(item.hot_value)} 热度</span></div>` : '';
        
        // 处理标签显示
        const tagDisplay = item.tag ? 
            `<div class="stat-item"><span class="hot-tag">${randomSymbol} ${item.tag}</span></div>` : '';
        
        hotItem.innerHTML = `
            <div class="hot-rank ${rankClass}">${index + 1}</div>
            <div class="hot-content">
                <a href="${item.link}" class="hot-title" target="_blank">
                    <span class="title-decoration">${randomSymbol}</span> ${item.title}
                </a>
                <div class="hot-stats">
                    ${hotValueDisplay}
                    ${tagDisplay}
                    ${item.source ? `<div class="stat-item"><span class="source-icon">${randomSymbol}</span> ${item.source}</div>` : ''}
                    ${item.time ? `<div class="stat-item"><span class="time-icon">${randomSymbol}</span> ${item.time}</div>` : ''}
                </div>
            </div>
        `;
        
        hotListElement.appendChild(hotItem);
    });
    
    // 添加几何装饰到列表项
    const hotItems = document.querySelectorAll('.hot-item');
    hotItems.forEach((item, index) => {
        // 为奇数和偶数项添加不同的装饰类
        if (index % 2 === 0) {
            item.classList.add('even-item');
        } else {
            item.classList.add('odd-item');
        }
    });
    
    // 更新时间
    updateTimeElement.textContent = `更新时间：${formatDate(new Date())}`;
}

// 显示加载状态
function showLoading() {
    hotListElement.innerHTML = '<div class="loading">加载中...</div>';
}

// 显示错误状态
function showError(message) {
    hotListElement.innerHTML = `<div class="loading">${message}</div>`;
}

// 获取头条热搜数据
async function fetchToutiaoHotList() {
    showLoading();
    
    try {
        const response = await fetch(API_ENDPOINTS[currentApiIndex]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.code === 200 && result.data && Array.isArray(result.data)) {
            if (result.data.length > 0) {
                renderHotList(result.data);
            } else {
                showError('暂无热搜数据');
            }
        } else {
            throw new Error('数据格式错误或无数据');
        }
    } catch (error) {
        console.error('获取数据失败:', error);
        
        // 尝试切换到下一个API
        const nextApiIndex = (currentApiIndex + 1) % API_ENDPOINTS.length;
        
        if (nextApiIndex !== 0) {
            // 还有其他API可以尝试
            currentApiIndex = nextApiIndex;
            showError('获取数据失败，正在尝试其他接口...');
            
            // 延迟后重试
            setTimeout(fetchToutiaoHotList, 2000);
        } else {
            // 所有API都尝试过了
            currentApiIndex = 0;
            showError('所有接口都无法访问，请稍后再试');
        }
    }
}

// 手动刷新数据
function refreshData() {
    currentApiIndex = 0; // 重置API索引
    fetchToutiaoHotList();
}

// 页面加载完成后获取数据
document.addEventListener('DOMContentLoaded', () => {
    fetchToutiaoHotList();
    
    // 每隔5分钟刷新一次数据
    setInterval(fetchToutiaoHotList, 5 * 60 * 1000);
    
    // 添加键盘快捷键支持（按R键刷新）
    document.addEventListener('keydown', (event) => {
        if (event.key === 'r' || event.key === 'R') {
            event.preventDefault();
            refreshData();
        }
    });
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        refreshData();
    }
});