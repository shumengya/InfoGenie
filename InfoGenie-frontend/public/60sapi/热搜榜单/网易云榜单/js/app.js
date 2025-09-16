/**
 * 网易云音乐榜单 - 主应用脚本
 * 功能：获取API数据、渲染榜单、处理错误、自动切换API接口
 */

// 全局变量
const apiUrls = [];
let currentApiIndex = 0;
let rankData = null;

// DOM元素
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const rankListElement = document.getElementById('rank-list');
const updateTimeElement = document.getElementById('update-time');
const retryButton = document.getElementById('retry-button');

// 初始化函数
async function init() {
    try {
        // 获取API接口列表
        await loadApiUrls();
        
        // 获取榜单数据
        await fetchRankData();
        
        // 添加音符装饰
        createMusicNotes();
    } catch (error) {
        console.error('初始化失败:', error);
        showError();
    }
}

// 加载API接口列表
async function loadApiUrls() {
    try {
        const response = await fetch('./接口集合.json');
        if (!response.ok) {
            throw new Error('无法加载API接口列表');
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            apiUrls.push(...data);
            console.log('已加载API接口列表:', apiUrls);
        } else {
            throw new Error('API接口列表为空');
        }
    } catch (error) {
        console.error('加载API接口列表失败:', error);
        // 使用默认API
        apiUrls.push('https://60s.api.shumengya.top/v2/ncm-rank');
    }
}

// 获取榜单数据
async function fetchRankData() {
    showLoading();
    
    // 如果没有API接口，显示错误
    if (apiUrls.length === 0) {
        throw new Error('没有可用的API接口');
    }
    
    try {
        const apiUrl = apiUrls[currentApiIndex];
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && Array.isArray(data.data)) {
            rankData = data;
            renderRankList(data.data);
            updateLastUpdateTime(data);
            hideLoading();
        } else {
            throw new Error('API返回数据格式错误');
        }
    } catch (error) {
        console.error('获取榜单数据失败:', error);
        // 尝试切换到下一个API
        if (tryNextApi()) {
            return fetchRankData();
        } else {
            showError();
        }
    }
}

// 尝试切换到下一个API
function tryNextApi() {
    if (currentApiIndex < apiUrls.length - 1) {
        currentApiIndex++;
        console.log(`切换到下一个API: ${apiUrls[currentApiIndex]}`);
        return true;
    }
    return false;
}

// 渲染榜单列表
function renderRankList(ranks) {
    if (!Array.isArray(ranks) || ranks.length === 0) {
        showError('没有榜单数据');
        return;
    }
    
    rankListElement.innerHTML = '';
    
    ranks.forEach(rank => {
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        
        // 构建榜单项HTML
        rankItem.innerHTML = `
            <div class="rank-cover">
                <img src="${rank.cover}" alt="${rank.name}" loading="lazy">
                <div class="rank-update">${rank.update_frequency || '定期更新'}</div>
            </div>
            <div class="rank-info">
                <h3 class="rank-name">${rank.name}</h3>
                <p class="rank-desc">${rank.description || '暂无描述'}</p>
                <div class="rank-meta">
                    <span class="rank-updated">更新: ${formatDate(rank.updated)}</span>
                </div>
                <a href="${rank.link}" target="_blank" class="rank-link">查看详情</a>
            </div>
        `;
        
        rankListElement.appendChild(rankItem);
    });
    
    rankListElement.style.display = 'grid';
}

// 更新最后更新时间
function updateLastUpdateTime(data) {
    if (data && data.data && data.data.length > 0) {
        const latestRank = data.data.reduce((latest, current) => {
            const latestDate = latest.updated_at || 0;
            const currentDate = current.updated_at || 0;
            return currentDate > latestDate ? current : latest;
        }, data.data[0]);
        
        if (latestRank && latestRank.updated) {
            updateTimeElement.textContent = `最近更新: ${formatDate(latestRank.updated)}`;
        } else {
            updateTimeElement.textContent = '数据已更新';
        }
    }
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '未知';
    
    try {
        const date = new Date(dateStr.replace('2025-', '2024-'));
        if (isNaN(date.getTime())) return dateStr;
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-');
    } catch (e) {
        return dateStr;
    }
}

// 创建音符装饰
function createMusicNotes() {
    const notesContainer = document.getElementById('music-notes-container');
    const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // 清空容器
    notesContainer.innerHTML = '';
    
    // 创建15个音符
    for (let i = 0; i < 15; i++) {
        const note = document.createElement('div');
        note.className = 'music-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        
        // 随机位置
        const left = Math.random() * containerWidth;
        const top = Math.random() * containerHeight;
        
        // 随机动画延迟
        const delay = Math.random() * 20;
        const duration = 15 + Math.random() * 15;
        
        // 设置样式
        note.style.left = `${left}px`;
        note.style.top = `${top}px`;
        note.style.animationDelay = `${delay}s`;
        note.style.animationDuration = `${duration}s`;
        
        notesContainer.appendChild(note);
    }
}

// 显示加载中
function showLoading() {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    rankListElement.style.display = 'none';
}

// 隐藏加载中
function hideLoading() {
    loadingElement.style.display = 'none';
}

// 显示错误信息
function showError(message = '加载失败，请稍后再试') {
    loadingElement.style.display = 'none';
    errorElement.querySelector('p').textContent = message;
    errorElement.style.display = 'block';
}

// 重试按钮点击事件
retryButton.addEventListener('click', () => {
    // 重置API索引
    currentApiIndex = 0;
    // 重新获取数据
    fetchRankData();
});

// 窗口大小改变时重新创建音符
window.addEventListener('resize', debounce(createMusicNotes, 300));

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);