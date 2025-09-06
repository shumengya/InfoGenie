// 猫眼票房排行榜 - JavaScript 实现

const API = {
    endpoints: [],
    currentIndex: 0,
    params: {
        encoding: 'json'
    },
    localFallback: '返回接口.json',
    // 初始化API接口列表
    async init() {
        try {
            const res = await fetch('./接口集合.json');
            const endpoints = await res.json();
            this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/maoyan`);
        } catch (e) {
            // 如果无法加载接口集合，使用默认接口
            this.endpoints = ['https://60s.viki.moe/v2/maoyan'];
        }
    },
    // 获取当前接口URL
    getCurrentUrl() {
        if (this.endpoints.length === 0) return null;
        const url = new URL(this.endpoints[this.currentIndex]);
        Object.entries(this.params).forEach(([k, v]) => url.searchParams.append(k, v));
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

let elements = {};

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    initElements();
    loadMaoyanList();
});

function initElements() {
    elements = {
        container: document.getElementById('ranking-content'),
        loading: document.getElementById('loading'),
        updateTime: document.getElementById('api-update-time'),
        statsTotal: document.getElementById('stats-total'),
        statsTop10: document.getElementById('stats-top10')
    };
}

async function loadMaoyanList() {
    try {
        showLoading(true);

        // 优先从线上API请求
        let data = await fetchFromAPI();

        // 如果线上失败，尝试从本地返回接口.json加载
        if (!data) {
            data = await fetchFromLocal();
        }

        if (!data || data.code !== 200 || !data.data) {
            throw new Error(data && data.message ? data.message : '未能获取到有效数据');
        }

        renderRanking(data.data);
    } catch (error) {
        console.error('加载排行榜失败:', error);
        showError(error.message || '加载失败，请稍后重试');
    } finally {
        showLoading(false);
    }
}

async function fetchFromAPI() {
    // 初始化API接口列表
    await API.init();
    
    // 重置API索引到第一个接口
    API.reset();
    
    // 尝试所有API接口
    for (let i = 0; i < API.endpoints.length; i++) {
        try {
            const url = API.getCurrentUrl();
            console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
            
            const resp = await fetch(url, { 
                cache: 'no-store',
                timeout: 10000 // 10秒超时
            });
            
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            }
            
            const data = await resp.json();
            
            if (data && data.code === 200) {
                console.log(`接口 ${i + 1} 请求成功`);
                return data;
            }
            
            throw new Error(data && data.message ? data.message : '接口返回异常');
            
        } catch (e) {
            console.warn(`接口 ${i + 1} 失败:`, e.message);
            
            // 如果不是最后一个接口，切换到下一个
            if (i < API.endpoints.length - 1) {
                API.switchToNext();
                continue;
            }
            
            // 所有接口都失败了
            console.warn('所有远程接口都失败，尝试本地数据');
            return null;
        }
    }
}

async function fetchFromLocal() {
    try {
        const resp = await fetch(API.localFallback + `?t=${Date.now()}`);
        if (!resp.ok) throw new Error(`本地文件HTTP ${resp.status}`);
        const data = await resp.json();
        return data;
    } catch (e) {
        console.error('读取本地返回接口.json失败:', e);
        return null;
    }
}

function renderRanking(payload) {
    const { list = [], tip = '', update_time = '', update_time_at } = payload || {};

    // 更新时间
    if (elements.updateTime) {
        elements.updateTime.textContent = update_time ? `更新时间：${update_time}` : '';
    }

    // 统计信息
    if (elements.statsTotal) {
        elements.statsTotal.textContent = list.length;
    }
    if (elements.statsTop10) {
        elements.statsTop10.textContent = Math.min(10, list.length);
    }

    // 渲染列表
    const html = `
        <section class="ranking-container">
            <h2 class="ranking-title">全球电影总票房排行榜</h2>
            <div class="movie-list">
                ${list.map(item => renderMovieItem(item)).join('')}
            </div>
        </section>
        ${tip ? `<div class="update-time">${escapeHtml(tip)}</div>` : ''}
        ${update_time ? `<div class="update-time" id="api-update-time">更新时间：${escapeHtml(update_time)}</div>` : ''}
    `;

    elements.container.innerHTML = html;
    elements.container.classList.add('fade-in');
}

// 格式化票房数据，将数字转换为更易读的形式
function formatBoxOffice(value) {
    if (!value) return '未知';
    
    // 将字符串转换为数字
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    
    if (isNaN(num)) return value;
    
    if (num >= 100000000) {
        return (num / 100000000).toFixed(2) + ' 亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(2) + ' 万';
    } else {
        return num.toLocaleString();
    }
}

function renderMovieItem(item) {
    const rank = item.rank;
    const cls = rank === 1 ? 'top-1' : rank === 2 ? 'top-2' : rank === 3 ? 'top-3' : '';
    const badgeCls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'regular';
    
    // 格式化票房数据
    const boxOffice = formatBoxOffice(item.boxoffice || item.box_office);
    
    // 美化排名显示
    let rankDisplay;
    if (rank === 1) {
        rankDisplay = '🏆 1';
    } else if (rank === 2) {
        rankDisplay = '🥈 2';
    } else if (rank === 3) {
        rankDisplay = '🥉 3';
    } else {
        rankDisplay = `NO.${rank}`;
    }

    return `
        <div class="movie-item ${cls}">
            <div class="rank-badge ${badgeCls}">${rankDisplay}</div>
            <div class="movie-info">
                <div class="movie-name">${escapeHtml(item.movie_name)}</div>
                <div class="movie-detail"><span class="label">上映:</span> ${escapeHtml(item.release_year || '未知')}</div>
                <div class="movie-boxoffice"><span class="currency">¥</span> ${boxOffice}</div>
            </div>
        </div>`;
}


function formatCurrencyDesc(desc, num) {
    if (desc && typeof desc === 'string' && desc.trim()) return desc;
    if (typeof num === 'number') {
        // 人民币按亿元显示
        if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿元';
        if (num >= 1e4) return (num / 1e4).toFixed(2) + '万元';
        return num.toLocaleString('zh-CN') + '元';
    }
    return '—';
}

function showLoading(show) {
    if (elements.loading) elements.loading.style.display = show ? 'block' : 'none';
    if (elements.container) elements.container.style.display = show ? 'none' : 'block';
}

function showError(message) {
    if (!elements.container) return;
    elements.container.innerHTML = `
        <div class="error">
            <h3>⚠️ 加载失败</h3>
            <p>${escapeHtml(message)}</p>
            <p>请稍后重试</p>
        </div>
    `;
    elements.container.style.display = 'block';
}

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// 键盘刷新快捷键 Ctrl/Cmd + R 刷新数据区域（不刷新整页）
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        loadMaoyanList();
    }
});