// 必应每日壁纸 JavaScript 功能

// API配置
const API = {
    endpoints: [],
    currentIndex: 0,
    params: {
        encoding: 'json'
    },
    // 初始化API接口列表
    async init() {
        try {
            const res = await fetch('./接口集合.json');
            const endpoints = await res.json();
            this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/bing`);
        } catch (e) {
            // 如果无法加载接口集合，使用默认接口
            this.endpoints = ['https://60s.viki.moe/v2/bing'];
        }
    },
    // 获取当前接口URL
    getCurrentUrl() {
        if (this.endpoints.length === 0) return null;
        const url = new URL(this.endpoints[this.currentIndex]);
        Object.keys(this.params).forEach(key => {
            url.searchParams.append(key, this.params[key]);
        });
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

// DOM元素
let elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initElements();
    loadWallpaper();
});

// 初始化DOM元素
function initElements() {
    elements = {
        container: document.getElementById('wallpaper-content'),
        loading: document.getElementById('loading')
    };
}

// 加载壁纸数据
async function loadWallpaper() {
    try {
        showLoading(true);
        
        // 初始化API接口列表
        await API.init();
        
        // 重置API索引到第一个接口
        API.reset();
        
        // 尝试所有API接口
        for (let i = 0; i < API.endpoints.length; i++) {
            try {
                const url = API.getCurrentUrl();
                console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
                
                const response = await fetch(url, { 
                    cache: 'no-store',
                    timeout: 10000 // 10秒超时
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('API响应数据:', data);
                
                // 检查数据有效性
                if (data && (data.code === 200 || data.data)) {
                    console.log(`接口 ${i + 1} 请求成功`);
                    displayWallpaper(data);
                    return;
                }
                
                throw new Error(data && data.message ? data.message : '接口返回异常');
                
            } catch (error) {
                console.warn(`接口 ${i + 1} 失败:`, error.message);
                
                // 如果不是最后一个接口，切换到下一个
                if (i < API.endpoints.length - 1) {
                    API.switchToNext();
                    continue;
                }
                
                // 所有接口都失败了，抛出错误
                throw new Error('所有接口都无法访问');
            }
        }
        
    } catch (error) {
        console.error('加载壁纸失败:', error);
        showError('加载壁纸失败，请稍后重试');
    } finally {
        showLoading(false);
    }
}

// 显示壁纸
function displayWallpaper(data) {
    if (!data) {
        showError('没有获取到壁纸数据');
        return;
    }
    
    // 提取壁纸信息
    const wallpaperInfo = extractWallpaperInfo(data);
    
    if (!wallpaperInfo || !wallpaperInfo.imageUrl) {
        showError('壁纸图片链接无效');
        return;
    }
    
    // 生成HTML内容
    const html = generateWallpaperHTML(wallpaperInfo);
    
    // 显示内容
    elements.container.innerHTML = html;
    elements.container.classList.add('fade-in');
    
    // 绑定图片加载事件
    bindImageEvents();
}

// 提取壁纸信息
function extractWallpaperInfo(data) {
    // 根据API响应结构提取信息
    let imageUrl = '';
    let title = '必应每日壁纸';
    let description = '';
    let date = new Date().toLocaleDateString('zh-CN');
    let copyright = '';
    
    // 处理新的API响应格式
    if (data.data) {
        const wallpaperData = data.data;
        title = wallpaperData.title || title;
        description = wallpaperData.description || wallpaperData.main_text || '';
        copyright = wallpaperData.copyright || '';
        date = wallpaperData.update_date || date;
        
        // 提取图片URL，去除反引号
        if (wallpaperData.cover) {
            imageUrl = wallpaperData.cover.replace(/`/g, '').trim();
        }
    }
    // 处理其他可能的API响应格式
    else if (data.url) {
        imageUrl = data.url;
    } else if (data.image_url) {
        imageUrl = data.image_url;
    } else if (data.images && data.images.length > 0) {
        imageUrl = data.images[0].url || data.images[0].image_url;
        title = data.images[0].title || title;
        description = data.images[0].description || data.images[0].copyright || '';
        copyright = data.images[0].copyright || '';
    }
    
    // 如果是相对路径，转换为完整URL
    if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = 'https://www.bing.com' + imageUrl;
    }
    
    // 确保图片URL有效
    if (!imageUrl || imageUrl === '') {
        console.error('无法提取图片URL，原始数据:', data);
        return null;
    }
    
    return {
        imageUrl,
        title,
        description: description || copyright,
        date,
        copyright
    };
}

// 生成壁纸HTML
function generateWallpaperHTML(info) {
    return `
        <div class="wallpaper-container">
            <div class="wallpaper-info">
                <h2 class="wallpaper-title">${escapeHtml(info.title)}</h2>
                <div class="wallpaper-date">${info.date}</div>
                ${info.description ? `<div class="wallpaper-description">${escapeHtml(info.description)}</div>` : ''}
            </div>
            
            <div class="wallpaper-image">
                <img src="${info.imageUrl}" alt="${escapeHtml(info.title)}" loading="lazy">
            </div>
            
            <div class="download-section">
                <a href="${info.imageUrl}" class="download-btn" download="bing-wallpaper-${info.date}.jpg" target="_blank">
                    <span>📥</span>
                    下载壁纸
                </a>
            </div>
        </div>
        
        ${info.copyright ? `
        <div class="copyright">
            <p>${escapeHtml(info.copyright)}</p>
        </div>
        ` : ''}
    `;
}

// 绑定图片事件
function bindImageEvents() {
    const images = elements.container.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        img.addEventListener('error', function() {
            console.error('图片加载失败:', this.src);
            this.parentElement.innerHTML = `
                <div class="error">
                    <p>🖼️ 图片加载失败</p>
                    <p>请检查网络连接或稍后重试</p>
                </div>
            `;
        });
    });
}

// 显示/隐藏加载状态
function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? 'block' : 'none';
    }
    if (elements.container) {
        elements.container.style.display = show ? 'none' : 'block';
    }
}

// 显示错误信息
function showError(message) {
    if (elements.container) {
        elements.container.innerHTML = `
            <div class="error">
                <h3>⚠️ 加载失败</h3>
                <p>${escapeHtml(message)}</p>
                <p>请检查网络连接或稍后重试</p>
            </div>
        `;
        elements.container.style.display = 'block';
    }
}

// HTML转义
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化日期
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('页面错误:', event.error);
});

// 网络状态监听
window.addEventListener('online', function() {
    console.log('网络已连接');
});

window.addEventListener('offline', function() {
    console.log('网络已断开');
    showError('网络连接已断开，请检查网络设置');
});

// 导出函数供外部调用
window.BingWallpaper = {
    loadWallpaper,
    showError,
    showLoading
};