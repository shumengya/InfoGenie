// API接口列表
const API_ENDPOINTS = [
    "https://60s.api.shumengya.top/v2/zhihu",
];

// 当前使用的API索引
let currentApiIndex = 0;

// DOM元素
const topicListElement = document.getElementById('topicList');
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

// 渲染话题列表
function renderTopicList(data) {
    topicListElement.innerHTML = '';
    
    data.forEach((item, index) => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        
        const rankClass = index < 3 ? `top-${index + 1}` : '';
        
        // 处理封面图片
        const coverImg = item.cover ? 
            `<img src="${item.cover}" alt="话题封面" class="topic-cover" onerror="this.style.display='none'">` : '';
        
        // 判断文本内容长度，决定图片位置
        // 如果detail存在且长度较长，或者没有detail但标题较长，则图片放在下方
        const detailLength = item.detail ? item.detail.length : 0;
        const titleLength = item.title ? item.title.length : 0;
        const isLongContent = detailLength > 100 || (detailLength === 0 && titleLength > 30);
        
        // 根据内容长度决定布局类名
        const layoutClass = isLongContent ? 'long-content' : 'short-content';
        
        topicItem.innerHTML = `
            <div class="topic-header ${layoutClass}">
                <div class="topic-rank ${rankClass}">${index + 1}</div>
                <div class="topic-content">
                    <a href="${item.link}" class="topic-title" target="_blank">🔥 ${item.title}</a>
                    ${item.detail ? `<div class="topic-detail">${item.detail}</div>` : ''}
                    <div class="topic-stats">
                        ${item.hot_value_desc ? `<div class="stat-item"><span class="hot-value">🔥 ${item.hot_value_desc}</span></div>` : ''}
                        ${item.answer_cnt ? `<div class="stat-item">💬 ${formatNumber(item.answer_cnt)} 回答</div>` : ''}
                        ${item.follower_cnt ? `<div class="stat-item">👥 ${formatNumber(item.follower_cnt)} 关注</div>` : ''}
                    </div>
                </div>
                ${coverImg}
            </div>`;
        
        topicListElement.appendChild(topicItem);
    });
    
    // 更新时间
    updateTimeElement.textContent = `更新时间：${formatDate(new Date())}`;
}

// 显示加载状态
function showLoading() {
    topicListElement.innerHTML = '<div class="loading">加载中...</div>';
}

// 显示错误状态
function showError(message) {
    topicListElement.innerHTML = `<div class="loading">${message}</div>`;
}

// 获取知乎热门话题数据
async function fetchZhihuTopics() {
    showLoading();
    
    try {
        const response = await fetch(API_ENDPOINTS[currentApiIndex]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.code === 200 && result.data && Array.isArray(result.data)) {
            if (result.data.length > 0) {
                renderTopicList(result.data);
            } else {
                showError('暂无热门话题数据');
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
            setTimeout(fetchZhihuTopics, 2000);
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
    fetchZhihuTopics();
}

// 页面加载完成后获取数据
document.addEventListener('DOMContentLoaded', () => {
    fetchZhihuTopics();
    
    // 每隔5分钟刷新一次数据
    setInterval(fetchZhihuTopics, 5 * 60 * 1000);
    
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