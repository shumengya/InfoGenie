// DOM元素获取
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const tvListElement = document.getElementById('tvList');
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
        
        // 调用百度电视剧榜API
        const response = await fetch('https://60s.api.shumengya.top/v2/baidu/teleplay');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            renderTvList(data.data);
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

// 渲染电视剧列表
function renderTvList(tvData) {
    if (!tvData || !Array.isArray(tvData)) {
        showError();
        return;
    }
    
    const listHTML = tvData.map((item, index) => {
        const rank = item.rank || (index + 1);
        const rankClass = rank <= 3 ? (rank === 1 ? 'top1' : 'top3') : '';
        
        // 处理封面图片
        const coverImg = item.cover ? 
            `<img src="${item.cover}" alt="${item.title}" class="item-cover" onerror="this.style.display='none'">` : 
            '';
        
        // 处理描述信息
        const description = item.desc || '';
        
        // 处理评分信息
        const score = item.score || '';
        const scoreDesc = item.score_desc || '';
        
        // 处理链接
        const linkUrl = item.url || '#';
        
        return `
            <div class="tv-item" onclick="openLink('${linkUrl}')">
                <div class="rank ${rankClass}">${rank}</div>
                ${coverImg}
                <div class="item-content">
                    <div class="item-header">
                        <h3 class="item-title">${item.title || '无标题'}</h3>
                    </div>
                    ${description ? `<p class="item-desc">${description}</p>` : ''}
                    <div class="item-footer">
                        <div class="item-score">
                            ${score ? `<span>${formatScore(score)}</span>` : ''}
                            ${scoreDesc ? `<span class="item-score-desc">${scoreDesc}</span>` : ''}
                        </div>
                        <div class="item-type">
                            <span class="type-text">电视剧</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    tvListElement.innerHTML = listHTML;
    tvListElement.style.display = 'block';
}

// 格式化评分
function formatScore(score) {
    if (!score) return '';
    
    // 如果是数字，进行格式化
    if (typeof score === 'number') {
        if (score >= 10000) {
            return (score / 10000).toFixed(1) + '万';
        }
        return score.toString();
    }
    
    // 如果是字符串，直接返回
    return score.toString();
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
    tvListElement.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
    loadingElement.style.display = 'none';
}

// 显示错误信息
function showError() {
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    tvListElement.style.display = 'none';
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

// 图片懒加载优化
function lazyLoadImages() {
    const images = document.querySelectorAll('.item-cover');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 添加键盘导航支持
document.addEventListener('keydown', function(e) {
    const items = document.querySelectorAll('.tv-item');
    const currentFocus = document.activeElement;
    let currentIndex = Array.from(items).indexOf(currentFocus);
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            currentIndex = Math.min(currentIndex + 1, items.length - 1);
            items[currentIndex]?.focus();
            break;
        case 'ArrowUp':
            e.preventDefault();
            currentIndex = Math.max(currentIndex - 1, 0);
            items[currentIndex]?.focus();
            break;
        case 'Enter':
            if (currentFocus && currentFocus.classList.contains('tv-item')) {
                currentFocus.click();
            }
            break;
    }
});

// 使电视剧项目可聚焦
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .tv-item {
            outline: none;
            transition: all 0.3s ease;
        }
        .tv-item:focus {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(139, 195, 74, 0.25);
            border-color: #8bc34a;
        }
    `;
    document.head.appendChild(style);
    
    // 为所有电视剧项目添加tabindex
    setTimeout(() => {
        const items = document.querySelectorAll('.tv-item');
        items.forEach((item, index) => {
            item.setAttribute('tabindex', '0');
        });
    }, 100);
});