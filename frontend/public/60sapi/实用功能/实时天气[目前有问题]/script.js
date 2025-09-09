// 天气应用主要功能
class WeatherApp {
    constructor() {
        this.apiUrl = 'https://60s.api.shumengya.top/v2/weather';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadWeather('北京'); // 默认加载北京天气
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');

        // 搜索按钮点击事件
        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                this.loadWeather(city);
            }
        });

        // 输入框回车事件
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) {
                    this.loadWeather(city);
                }
            }
        });
    }

    async loadWeather(city) {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.apiUrl}?query=${encodeURIComponent(city)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('完整API响应:', data); // 调试日志
            
            if (data.code === 200 && data.data) {
                this.displayWeather(data.data);
                this.hideLoading();
            } else {
                throw new Error(data.message || `API返回错误: code=${data.code}`);
            }
        } catch (error) {
            console.error('获取天气数据失败:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack
            });
            this.showError(error.message);
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weatherCard').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message = '获取天气数据失败，请检查网络连接或稍后重试') {
        const errorElement = document.getElementById('errorMessage');
        const errorText = errorElement.querySelector('p');
        
        if (errorText) {
            errorText.textContent = message;
        }
        
        errorElement.style.display = 'block';
        document.getElementById('weatherCard').style.display = 'none';
    }

    displayWeather(data) {
        console.log('API返回数据:', data); // 调试日志
        
        // 根据实际API结构解构数据
        const location = data.location || {};
        const realtime = data.realtime || {};
        const air_quality = realtime.air_quality || {};
        const life_indices = realtime.life_indices || [];
        
        // 显示位置信息
        const locationName = location.formatted || location.city || location.name || '未知位置';
        document.getElementById('locationName').textContent = locationName;
        
        const updateTime = realtime.updated || '未知时间';
        document.getElementById('updateTime').textContent = `更新时间: ${updateTime}`;
        
        // 显示当前天气
        const temperature = realtime.temperature !== undefined ? realtime.temperature : '--';
        document.getElementById('temperature').textContent = `${temperature}°C`;
        
        const condition = realtime.weather || realtime.weather_desc || '未知';
        document.getElementById('weatherDesc').textContent = condition;
        document.getElementById('weatherIcon').textContent = this.getWeatherIcon(condition);
        
        // 显示天气详情
        const feelsLike = realtime.temperature_feels_like !== undefined ? realtime.temperature_feels_like : temperature;
        document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
        
        const humidity = realtime.humidity !== undefined ? realtime.humidity : '--';
        document.getElementById('humidity').textContent = `${humidity}%`;
        
        const windDirection = realtime.wind_direction || '--';
        document.getElementById('windDirection').textContent = windDirection;
        
        const windPower = realtime.wind_power || realtime.wind_strength || '--';
        document.getElementById('windStrength').textContent = windPower;
        
        const pressure = realtime.pressure !== undefined ? realtime.pressure : '--';
        document.getElementById('pressure').textContent = `${pressure} hPa`;
        
        document.getElementById('visibility').textContent = '--'; // API中没有能见度数据
        
        const aqi = air_quality.aqi !== undefined ? air_quality.aqi : '--';
        document.getElementById('aqi').textContent = `AQI ${aqi}`;
        
        const pm25 = air_quality.pm25 !== undefined ? air_quality.pm25 : '--';
        document.getElementById('pm25').textContent = `${pm25} μg/m³`;
        
        // 显示生活指数
        if (life_indices && life_indices.length > 0) {
            this.displayLifeIndex(life_indices);
        } else {
            // 如果没有生活指数数据，重置显示
            this.resetLifeIndex();
        }
        
        // 显示天气卡片
        document.getElementById('weatherCard').style.display = 'block';
    }

    displayLifeIndex(lifeIndices) {
        const indexMap = {
            comfort: { level: 'comfortLevel', desc: 'comfortDesc' },
            clothes: { level: 'clothingLevel', desc: 'clothingDesc' },
            umbrella: { level: 'umbrellaLevel', desc: 'umbrellaDesc' },
            ultraviolet: { level: 'uvLevel', desc: 'uvDesc' },
            carwash: { level: 'carWashLevel', desc: 'carWashDesc' },
            tourism: { level: 'travelLevel', desc: 'travelDesc' },
            sports: { level: 'sportLevel', desc: 'sportDesc' }
        };

        // 重置所有指数显示
        this.resetLifeIndex();

        // 根据新的API数据结构更新生活指数
        if (Array.isArray(lifeIndices)) {
            lifeIndices.forEach(index => {
                if (index && index.key && indexMap[index.key]) {
                    const { level, desc } = indexMap[index.key];
                    const levelElement = document.getElementById(level);
                    const descElement = document.getElementById(desc);
                    
                    if (levelElement) levelElement.textContent = index.level || '--';
                    if (descElement) descElement.textContent = index.description || '--';
                }
            });
        }
    }

    resetLifeIndex() {
        const indexMap = {
            comfort: { level: 'comfortLevel', desc: 'comfortDesc' },
            clothes: { level: 'clothingLevel', desc: 'clothingDesc' },
            umbrella: { level: 'umbrellaLevel', desc: 'umbrellaDesc' },
            ultraviolet: { level: 'uvLevel', desc: 'uvDesc' },
            carwash: { level: 'carWashLevel', desc: 'carWashDesc' },
            tourism: { level: 'travelLevel', desc: 'travelDesc' },
            sports: { level: 'sportLevel', desc: 'sportDesc' }
        };

        Object.values(indexMap).forEach(({ level, desc }) => {
            const levelElement = document.getElementById(level);
            const descElement = document.getElementById(desc);
            
            if (levelElement) levelElement.textContent = '--';
            if (descElement) descElement.textContent = '--';
        });
    }

    getWeatherIcon(weather) {
        const iconMap = {
            '晴': '☀️',
            '多云': '⛅',
            '阴': '☁️',
            '小雨': '🌦️',
            '中雨': '🌧️',
            '大雨': '⛈️',
            '雷阵雨': '⛈️',
            '雪': '❄️',
            '小雪': '🌨️',
            '中雪': '❄️',
            '大雪': '❄️',
            '雾': '🌫️',
            '霾': '😷',
            '沙尘暴': '🌪️'
        };

        // 查找匹配的天气图标
        for (const [key, icon] of Object.entries(iconMap)) {
            if (weather.includes(key)) {
                return icon;
            }
        }
        
        // 默认图标
        return '🌤️';
    }

    // 获取空气质量等级颜色
    getAQIColor(aqi) {
        if (aqi <= 50) return '#00e400';
        if (aqi <= 100) return '#ffff00';
        if (aqi <= 150) return '#ff7e00';
        if (aqi <= 200) return '#ff0000';
        if (aqi <= 300) return '#8f3f97';
        return '#7e0023';
    }

    // 格式化时间
    formatTime(timeString) {
        try {
            const date = new Date(timeString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return timeString;
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// 添加一些实用的工具函数
const utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 检查网络状态
    checkNetworkStatus() {
        return navigator.onLine;
    },

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 网络状态监听
window.addEventListener('online', () => {
    utils.showToast('网络连接已恢复', 'success');
});

window.addEventListener('offline', () => {
    utils.showToast('网络连接已断开', 'error');
});