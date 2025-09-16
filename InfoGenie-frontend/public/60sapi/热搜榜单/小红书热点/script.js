// 小红书热点榜单 JavaScript 逻辑

// DOM 元素
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const hotListEl = document.getElementById('hotList');
const updateTimeEl = document.getElementById('updateTime');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 加载数据函数
async function loadData() {
    try {
        showLoading();
        
        // 从API接口获取数据
        const response = await fetch('https://60s.api.shumengya.top/v2/rednote');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            renderHotList(data.data);
            updateTime();
            showSuccess();
        } else {
            throw new Error('数据格式错误');
        }
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError();
    }
}

// 显示加载状态
function showLoading() {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    hotListEl.style.display = 'none';
}

// 显示错误状态
function showError() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    hotListEl.style.display = 'none';
}

// 显示成功状态
function showSuccess() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    hotListEl.style.display = 'block';
}

// 渲染热点列表
function renderHotList(hotData) {
    hotListEl.innerHTML = '';
    
    hotData.forEach((item, index) => {
        const hotItem = createHotItem(item, index);
        hotListEl.appendChild(hotItem);
    });
}

// 创建热点项目元素
function createHotItem(item, index) {
    const itemEl = document.createElement('div');
    itemEl.className = 'hot-item';
    
    // 添加点击事件
    itemEl.addEventListener('click', () => {
        if (item.link) {
            window.open(item.link, '_blank');
        }
    });
    
    // 构建HTML内容
    itemEl.innerHTML = `
        <div class="item-header">
            <div class="rank ${item.rank <= 3 ? 'top3' : ''}">${item.rank}</div>
            <div class="word-type">
                ${item.work_type_icon ? `<img src="${item.work_type_icon}" alt="${item.word_type}" class="type-icon">` : ''}
                ${item.word_type && item.word_type !== '无' ? `<span class="type-text type-${getTypeClass(item.word_type)}">${item.word_type}</span>` : ''}
            </div>
        </div>
        <div class="item-content">
            <h3 class="item-title">${escapeHtml(item.title)}</h3>
            <p class="item-score">热度: ${item.score}</p>
        </div>
    `;
    
    return itemEl;
}

// 获取类型样式类名
function getTypeClass(wordType) {
    switch (wordType) {
        case '热':
            return 'hot';
        case '新':
            return 'new';
        default:
            return 'default';
    }
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 更新时间显示
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    updateTimeEl.textContent = `最后更新: ${timeString}`;
}

// 添加页面可见性变化监听，当页面重新可见时刷新数据
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面变为可见时，延迟1秒后刷新数据
        setTimeout(() => {
            loadData();
        }, 1000);
    }
});

// 添加网络状态监听
window.addEventListener('online', function() {
    // 网络恢复时自动重新加载
    setTimeout(() => {
        loadData();
    }, 500);
});

// 添加错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
});

// 添加未处理的Promise拒绝监听
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
    e.preventDefault();
});

// 添加触摸设备的优化
if ('ontouchstart' in window) {
    // 为触摸设备添加触摸反馈
    document.addEventListener('touchstart', function() {}, { passive: true });
}

// 添加键盘导航支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        loadData();
    }
});

// 导出函数供全局使用
window.loadData = loadData;