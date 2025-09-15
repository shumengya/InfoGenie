// DOM元素获取
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const hotListElement = document.getElementById('hotList');
const updateTimeElement = document.getElementById('updateTime');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // 每5分钟自动刷新数据
    setInterval(loadData, 5 * 60 * 1000);
    
    // 监听页面可见性变化，页面重新可见时刷新数据
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            loadData();
        }
    });
    
    // 监听网络状态变化
    window.addEventListener('online', loadData);
});

// 加载数据函数
async function loadData() {
    try {
        showLoading();
        
        // 调用百度实时热搜API
        const response = await fetch('https://60s.api.shumengya.top/v2/baidu/realtime');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            renderHotList(data.data);
            updateTime();
            hideLoading();
        } else {
            throw new Error(data.message || '数据格式错误');
        }
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError();
    }
}

// 渲染热搜列表
function renderHotList(hotData) {
    if (!hotData || !Array.isArray(hotData)) {
        showError();
        return;
    }
    
    const listHTML = hotData.map((item, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? (rank === 1 ? 'top1' : 'top3') : '';
        
        // 处理封面图片
        const coverImg = item.pic ? 
            `<img src="${item.pic}" alt="${item.title}" class="item-cover" onerror="this.style.display='none'">` : 
            '';
        
        // 处理描述信息
        const description = item.desc || '';
        
        // 处理热度值
        const hotValue = item.hot || '';
        
        // 处理链接
        const linkUrl = item.url || '#';
        
        return `
            <div class="hot-item" onclick="openLink('${linkUrl}')">
                <div class="rank ${rankClass}">${rank}</div>
                ${coverImg}
                <div class="item-content">
                    <div class="item-header">
                        <h3 class="item-title">${item.title || '无标题'}</h3>
                    </div>
                    ${description ? `<p class="item-desc">${description}</p>` : ''}
                    <div class="item-footer">
                        ${hotValue ? `<span class="item-score">${formatHotValue(hotValue)}</span>` : ''}
                        <div class="item-type">
                            <span class="type-text type-hot">热搜</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    hotListElement.innerHTML = listHTML;
    hotListElement.style.display = 'block';
}

// 格式化热度值
function formatHotValue(value) {
    if (!value) return '';
    
    // 如果是数字，进行格式化
    if (typeof value === 'number') {
        if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
        }
        return value.toString();
    }
    
    // 如果是字符串，直接返回
    return value.toString();
}

// 打开链接
function openLink(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    }
}

// 显示加载状态
function showLoading() {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    hotListElement.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
    loadingElement.style.display = 'none';
}

// 显示错误信息
function showError() {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    hotListElement.style.display = 'none';
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
    updateTimeElement.textContent = `最后更新时间: ${timeString}`;
}

// 重试加载数据
function retryLoad() {
    loadData();
}

// 页面滚动优化
let ticking = false;

function updateScrollPosition() {
    // 可以在这里添加滚动相关的优化逻辑
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
    }
});

// 错误处理和日志记录
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
});

// 性能监控
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('页面加载时间:', loadTime + 'ms');
        }, 0);
    });
}