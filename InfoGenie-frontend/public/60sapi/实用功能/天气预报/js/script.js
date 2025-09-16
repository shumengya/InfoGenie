// 天气查询应用
class WeatherApp {
    constructor() {
        this.apiEndpoints = [
            "https://60s.api.shumengya.top/v2/weather/forecast",
            "https://60s-cf.viki.moe/v2/weather/forecast"
        ];
        this.currentEndpointIndex = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        // 页面加载时自动查询北京天气
        this.searchWeather('北京');
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');

        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                this.searchWeather(city);
            } else {
                this.showError('请输入城市名称');
            }
        });

        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) {
                    this.searchWeather(city);
                } else {
                    this.showError('请输入城市名称');
                }
            }
        });

        // 防止输入框为空时查询
        cityInput.addEventListener('input', () => {
            const searchBtn = document.getElementById('searchBtn');
            searchBtn.disabled = !cityInput.value.trim();
        });
    }

    async searchWeather(city) {
        this.showLoading();
        
        for (let i = 0; i < this.apiEndpoints.length; i++) {
            try {
                const endpoint = this.apiEndpoints[this.currentEndpointIndex];
                const response = await this.fetchWeatherData(endpoint, city);
                
                if (response && response.code === 200) {
                    this.displayWeatherData(response.data);
                    return;
                }
            } catch (error) {
                console.warn(`API ${this.apiEndpoints[this.currentEndpointIndex]} 请求失败:`, error);
            }
            
            // 切换到下一个API端点
            this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.apiEndpoints.length;
        }
        
        // 所有API都失败了
        this.showError('获取天气信息失败，请检查网络连接或稍后重试');
    }

    async fetchWeatherData(endpoint, city) {
        const url = `${endpoint}?query=${encodeURIComponent(city)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }

    displayWeatherData(data) {
        const { location, daily_forecast, hourly_forecast } = data;
        
        // 显示位置信息
        document.getElementById('locationName').textContent = location.name || '未知位置';
        document.getElementById('locationDetail').textContent = 
            `${location.province || ''} ${location.city || ''} ${location.county || ''}`.trim();

        // 使用第一天的预报数据作为当前天气（今天的天气）
        const todayWeather = daily_forecast && daily_forecast[0];
        
        if (todayWeather) {
            // 显示当前天气（使用今天的最高温度）
            document.getElementById('temperature').textContent = todayWeather.max_temperature;
            document.getElementById('weatherCondition').textContent = 
                `${todayWeather.day_condition} 转 ${todayWeather.night_condition}`;
            
            // 体感温度（使用温度范围）
            document.getElementById('feelsLike').textContent = 
                `温度范围 ${todayWeather.min_temperature}°C - ${todayWeather.max_temperature}°C`;
        } else {
            // 如果没有日预报数据，尝试使用小时预报数据
            const currentHour = hourly_forecast && hourly_forecast[0];
            if (currentHour) {
                document.getElementById('temperature').textContent = currentHour.temperature;
                document.getElementById('weatherCondition').textContent = currentHour.condition;
                document.getElementById('feelsLike').textContent = 
                    `风向: ${currentHour.wind_direction} ${currentHour.wind_power}`;
            }
        }

        // 显示更新时间（使用当前时间）
        document.getElementById('updateTime').textContent = 
            `${this.formatDate(new Date())} (基于预报数据)`;

        // 显示天气预报
        this.displayForecast(daily_forecast || []);

        this.showWeatherContainer();
    }

    displayForecast(forecast) {
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = '';
        
        if (!forecast || forecast.length === 0) {
            forecastGrid.innerHTML = '<div class="no-forecast">暂无预报数据</div>';
            return;
        }
        
        forecast.forEach((day, index) => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            // 格式化日期显示
            const dateStr = day.date || '';
            const dateDesc = this.formatDateDesc(dateStr);
            
            forecastItem.innerHTML = `
                <div class="forecast-date">${dateDesc}</div>
                <div class="forecast-weather">
                    <div class="weather-day">${day.day_condition || '未知'}</div>
                    <div class="weather-night">${day.night_condition || '未知'}</div>
                </div>
                <div class="forecast-temp">
                    <span class="temp-high">${day.max_temperature || '--'}°</span>
                    <span class="temp-low">${day.min_temperature || '--'}°</span>
                </div>
                <div class="forecast-wind">
                    <div>${day.day_wind_direction || ''} ${day.day_wind_power || ''}</div>
                </div>
                <div class="forecast-air">空气质量: ${day.air_quality || '未知'}</div>
            `;
            
            forecastGrid.appendChild(forecastItem);
        });
    }

    // 华氏度转摄氏度
    fahrenheitToCelsius(fahrenheit) {
        const celsius = (fahrenheit - 32) * 5 / 9;
        return Math.round(celsius * 10) / 10; // 保留一位小数
    }

    // 格式化时间
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 格式化日期描述
    formatDateDesc(dateStr) {
        if (!dateStr) return '未知日期';
        
        try {
            const date = new Date(dateStr);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // 判断是今天、明天还是其他日期
            if (date.toDateString() === today.toDateString()) {
                return `今天 ${month}-${day}`;
            } else if (date.toDateString() === tomorrow.toDateString()) {
                return `明天 ${month}-${day}`;
            } else {
                const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                const weekday = weekdays[date.getDay()];
                return `${weekday} ${month}-${day}`;
            }
        } catch (error) {
            return dateStr;
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('weatherContainer').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
    }

    showWeatherContainer() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('weatherContainer').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('weatherContainer').style.display = 'none';
        const errorElement = document.getElementById('errorMessage');
        errorElement.style.display = 'block';
        errorElement.querySelector('p').textContent = message;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// 添加页面可见性检测，当页面重新可见时刷新数据
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim() || '北京';
        // 延迟1秒刷新，避免频繁请求
        setTimeout(() => {
            if (window.weatherApp) {
                window.weatherApp.searchWeather(city);
            }
        }, 1000);
    }
});

// 将应用实例暴露到全局，方便调试和其他功能调用
window.weatherApp = null;
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});