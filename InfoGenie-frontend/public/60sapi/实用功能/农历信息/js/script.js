// API接口列表
const API_ENDPOINTS = [
    "https://60s.api.shumengya.top",
];

// 当前使用的API索引
let currentApiIndex = 0;

// DOM元素
const loadingElement = document.getElementById('loading');
const lunarInfoElement = document.getElementById('lunarInfo');
const errorMessageElement = document.getElementById('errorMessage');
const updateTimeElement = document.getElementById('updateTime');
const dateInput = document.getElementById('dateInput');
const queryBtn = document.getElementById('queryBtn');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 初始化页面
function initializePage() {
    // 设置默认日期为今天
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    dateInput.value = dateString;
    
    // 绑定事件
    queryBtn.addEventListener('click', queryLunarInfo);
    dateInput.addEventListener('change', queryLunarInfo);
    
    // 自动查询当天信息
    queryLunarInfo();
}

// 查询农历信息
async function queryLunarInfo() {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        showError('请选择查询日期');
        return;
    }
    
    showLoading();
    hideError();
    hideLunarInfo();
    
    try {
        const data = await fetchLunarData(selectedDate);
        displayLunarInfo(data.data);
        updateQueryTime();
    } catch (error) {
        console.error('查询失败:', error);
        showError('查询农历信息失败，请稍后重试');
    }
    
    hideLoading();
}

// 获取农历数据
async function fetchLunarData(date) {
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const apiUrl = API_ENDPOINTS[currentApiIndex];
        
        try {
            const response = await fetch(`${apiUrl}/v2/lunar?date=${date}`, {
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

// 显示农历信息
function displayLunarInfo(lunarData) {
    lunarInfoElement.innerHTML = `
        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">📅</div>
                <div class="card-title">公历信息</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">🗓️</div>
                    <div class="item-label">公历日期</div>
                    <div class="item-value">${lunarData.solar.year}年${String(lunarData.solar.month).padStart(2, '0')}月${String(lunarData.solar.day).padStart(2, '0')}日</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🌍</div>
                    <div class="item-label">星期</div>
                    <div class="item-value">${lunarData.solar.week_desc}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🍂</div>
                    <div class="item-label">季节</div>
                    <div class="item-value">${lunarData.solar.season_name_desc}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">⭐</div>
                    <div class="item-label">星座</div>
                    <div class="item-value">${lunarData.constellation.name}</div>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">🌙</div>
                <div class="card-title">农历信息</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">🏮</div>
                    <div class="item-label">农历日期</div>
                    <div class="item-value">${lunarData.lunar.desc_short}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🐲</div>
                    <div class="item-label">生肖年</div>
                    <div class="item-value">${lunarData.zodiac.year}年</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">☯️</div>
                    <div class="item-label">天干地支</div>
                    <div class="item-value">${lunarData.sixty_cycle.year.name}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🌙</div>
                    <div class="item-label">月相</div>
                    <div class="item-value">${lunarData.phase.name}</div>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">🌾</div>
                <div class="card-title">节气节日</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">🌱</div>
                    <div class="item-label">当前节气</div>
                    <div class="item-value">${lunarData.term.stage ? lunarData.term.stage.name : '无节气'}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🎉</div>
                    <div class="item-label">法定假日</div>
                    <div class="item-value">${lunarData.legal_holiday ? lunarData.legal_holiday.name : '无假日'}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🎊</div>
                    <div class="item-label">传统节日</div>
                    <div class="item-value">${lunarData.festival.both_desc || '无特殊节日'}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">📊</div>
                    <div class="item-label">一年第几天</div>
                    <div class="item-value">第${lunarData.stats.day_of_year}天</div>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">⏰</div>
                <div class="card-title">时辰干支</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">🕐</div>
                    <div class="item-label">当前时辰</div>
                    <div class="item-value">${lunarData.lunar.hour_desc}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">☯️</div>
                    <div class="item-label">时辰干支</div>
                    <div class="item-value">${lunarData.sixty_cycle.hour.name}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🐾</div>
                    <div class="item-label">时辰生肖</div>
                    <div class="item-value">${lunarData.zodiac.hour}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🎵</div>
                    <div class="item-label">纳音</div>
                    <div class="item-value">${lunarData.nayin.hour}</div>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">📖</div>
                <div class="card-title">黄历宜忌</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">✅</div>
                    <div class="item-label">宜</div>
                    <div class="item-value">${formatTabooText(lunarData.taboo.day.recommends)}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">❌</div>
                    <div class="item-label">忌</div>
                    <div class="item-value">${formatTabooText(lunarData.taboo.day.avoids)}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🕐</div>
                    <div class="item-label">时辰宜</div>
                    <div class="item-value">${formatTabooText(lunarData.taboo.hour.recommends)}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🚫</div>
                    <div class="item-label">时辰忌</div>
                    <div class="item-value">${formatTabooText(lunarData.taboo.hour.avoids)}</div>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">🌟</div>
                <div class="card-title">运势财运</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">🍀</div>
                    <div class="item-label">今日运势</div>
                    <div class="item-value">${lunarData.fortune.today_luck}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">💼</div>
                    <div class="item-label">事业运</div>
                    <div class="item-value">${lunarData.fortune.career}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">💰</div>
                    <div class="item-label">财运</div>
                    <div class="item-value">${lunarData.fortune.money}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">💖</div>
                    <div class="item-label">感情运</div>
                    <div class="item-value">${lunarData.fortune.love}</div>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="card-header">
                <div class="card-icon">📈</div>
                <div class="card-title">年度统计</div>
            </div>
            <div class="card-content">
                <div class="info-item">
                    <div class="item-icon">📊</div>
                    <div class="item-label">年度进度</div>
                    <div class="item-value">${lunarData.stats.percents_formatted.year}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">📅</div>
                    <div class="item-label">本月进度</div>
                    <div class="item-value">${lunarData.stats.percents_formatted.month}</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">🗓️</div>
                    <div class="item-label">本周第几天</div>
                    <div class="item-value">第${lunarData.stats.week_of_month}周</div>
                </div>
                <div class="info-item">
                    <div class="item-icon">⏰</div>
                    <div class="item-label">今日进度</div>
                    <div class="item-value">${lunarData.stats.percents_formatted.day}</div>
                </div>
            </div>
        </div>

        ${generateHourlyTaboo(lunarData.taboo.hours)}
    `;
    
    showLunarInfo();
}

// 格式化宜忌文本
function formatTabooText(text) {
    if (!text) return '无';
    return text.replace(/\./g, '、');
}

// 生成十二时辰宜忌
function generateHourlyTaboo(hours) {
    if (!hours || hours.length === 0) return '';
    
    const hourCards = hours.map(hour => `
        <div class="hour-item">
            <div class="hour-name">${hour.hour}</div>
            <div class="hour-content">
                <div class="hour-recommends">
                    <span class="hour-label">宜:</span>
                    <span class="hour-text">${formatTabooText(hour.recommends) || '无'}</span>
                </div>
                <div class="hour-avoids">
                    <span class="hour-label">忌:</span>
                    <span class="hour-text">${formatTabooText(hour.avoids) || '无'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="info-card hours-card">
            <div class="card-header">
                <div class="card-icon">⏰</div>
                <div class="card-title">十二时辰宜忌</div>
            </div>
            <div class="card-content">
                <div class="hours-grid">
                    ${hourCards}
                </div>
            </div>
        </div>
    `;
}

// 更新查询时间
function updateQueryTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    updateTimeElement.textContent = `查询时间: ${timeStr}`;
    
    // 添加成功提示
    showSuccessMessage('🌙 农历信息已更新');
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
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        color: #1a1a1a;
        padding: 12px 20px;
        border-radius: 25px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
        z-index: 1000;
        font-weight: 600;
        font-size: 0.9em;
        animation: glassToastSlide 0.5s ease-out;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.style.animation = 'glassToastSlideOut 0.5s ease-in forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 显示加载状态
function showLoading() {
    loadingElement.style.display = 'block';
}

// 隐藏加载状态
function hideLoading() {
    loadingElement.style.display = 'none';
}

// 显示农历信息
function showLunarInfo() {
    lunarInfoElement.style.display = 'block';
}

// 隐藏农历信息
function hideLunarInfo() {
    lunarInfoElement.style.display = 'none';
}

// 显示错误信息
function showError(message = '查询失败，请稍后重试') {
    errorMessageElement.style.display = 'block';
    const errorContent = errorMessageElement.querySelector('.error-content p');
    if (errorContent) {
        errorContent.textContent = message;
    }
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
        @keyframes glassToastSlide {
            from {
                opacity: 0;
                transform: translateX(100px) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
        }
        
        @keyframes glassToastSlideOut {
            from {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
            to {
                opacity: 0;
                transform: translateX(100px) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
}

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        queryLunarInfo();
    }
    
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        queryLunarInfo();
    }
});
