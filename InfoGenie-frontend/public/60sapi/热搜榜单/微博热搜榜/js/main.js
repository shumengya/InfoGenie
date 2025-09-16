// API接口列表
const API_ENDPOINTS = [
    "https://60s.api.shumengya.top/v2/weibo",
    "https://60s-cf.viki.moe/v2/weibo",
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

// 渲染热搜列表
function renderHotList(data) {
    hotListElement.innerHTML = '';
    
    data.forEach((item, index) => {
        const hotItem = document.createElement('div');
        hotItem.className = 'hot-item';
        
        const rankClass = index < 3 ? `top-${index + 1}` : '';
        
        hotItem.innerHTML = `
            <div class="hot-rank ${rankClass}">${index + 1}</div>
            <div class="hot-content">
                <a href="${item.link}" class="hot-title" target="_blank">${item.title}</a>
                ${item.hot_value ? `<div class="hot-value">${item.hot_value}</div>` : ''}
            </div>
        `;
        
        hotListElement.appendChild(hotItem);
    });
    
    // 更新时间
    updateTimeElement.textContent = `更新时间：${formatDate(new Date())}`;
}

// 获取微博热搜数据
async function fetchWeiboHotList() {
    try {
        const response = await fetch(API_ENDPOINTS[currentApiIndex]);
        
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
            renderHotList(result.data);
        } else {
            throw new Error('数据格式错误');
        }
    } catch (error) {
        console.error('获取数据失败:', error);
        
        // 尝试切换到下一个API
        currentApiIndex = (currentApiIndex + 1) % API_ENDPOINTS.length;
        
        // 显示错误信息
        hotListElement.innerHTML = `
            <div class="loading">
                正在尝试其他接口...
            </div>
        `;
        
        // 延迟后重试
        setTimeout(fetchWeiboHotList, 2000);
    }
}

// 页面加载完成后获取数据
document.addEventListener('DOMContentLoaded', () => {
    fetchWeiboHotList();
    
    // 每隔5分钟刷新一次数据
    setInterval(fetchWeiboHotList, 5 * 60 * 1000);
});