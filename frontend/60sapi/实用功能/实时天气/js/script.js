// 天气查询应用
class WeatherApp {
    constructor() {
        this.apiEndpoints = [
            'https://60s-cf.viki.moe',
            'https://60s.viki.moe',
            'https://60s.b23.run',
            'https://60s.114128.xyz',
            'https://60s-cf.114128.xyz'
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
        const url = `${endpoint}/v2/weather?query=${encodeURIComponent(city)}`;
        
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
        const { location, realtime } = data;
        
        // 显示位置信息
        document.getElementById('locationName').textContent = location.formatted;
        document.getElementById('locationDetail').textContent = 
            `${location.province} ${location.city} | 邮编: ${location.zip_code}`;

        // 显示当前天气
        document.getElementById('temperature').textContent = realtime.temperature;
        document.getElementById('weatherCondition').textContent = realtime.weather;
        
        // 体感温度转换（API返回的是华氏度，需要转换为摄氏度）
        const feelsLikeCelsius = this.fahrenheitToCelsius(realtime.temperature_feels_like);
        document.getElementById('feelsLike').textContent = 
            `体感温度 ${feelsLikeCelsius}°C`;

        // 显示天气详情
        document.getElementById('humidity').textContent = `${realtime.humidity}%`;
        document.getElementById('windDirection').textContent = realtime.wind_direction;
        document.getElementById('windStrength').textContent = realtime.wind_strength;
        document.getElementById('pressure').textContent = `${realtime.pressure} hPa`;
        document.getElementById('visibility').textContent = realtime.visibility;
        
        // 空气质量显示
        const aqiElement = document.getElementById('aqi');
        aqiElement.textContent = `${realtime.aqi} (PM2.5: ${realtime.pm25})`;
        aqiElement.className = this.getAQIClass(realtime.aqi);

        // 显示生活指数
        const lifeIndex = realtime.life_index;
        this.displayLifeIndex('comfort', lifeIndex.comfort);
        this.displayLifeIndex('clothing', lifeIndex.clothing);
        this.displayLifeIndex('umbrella', lifeIndex.umbrella);
        this.displayLifeIndex('uv', lifeIndex.uv);
        this.displayLifeIndex('travel', lifeIndex.travel);
        this.displayLifeIndex('sport', lifeIndex.sport);

        // 显示更新时间
        document.getElementById('updateTime').textContent = 
            `${realtime.updated} (${realtime.updated_at})`;

        this.showWeatherContainer();
    }

    displayLifeIndex(type, indexData) {
        const levelElement = document.getElementById(`${type}Level`);
        const descElement = document.getElementById(`${type}Desc`);
        
        if (levelElement && descElement && indexData) {
            levelElement.textContent = indexData.level;
            descElement.textContent = indexData.desc;
            
            // 根据指数级别设置颜色
            levelElement.className = this.getIndexLevelClass(indexData.level);
        }
    }

    getAQIClass(aqi) {
        if (aqi <= 50) return 'aqi-good';
        if (aqi <= 100) return 'aqi-moderate';
        if (aqi <= 150) return 'aqi-unhealthy-sensitive';
        if (aqi <= 200) return 'aqi-unhealthy';
        if (aqi <= 300) return 'aqi-very-unhealthy';
        return 'aqi-hazardous';
    }

    getIndexLevelClass(level) {
        const levelMap = {
            '优': 'level-excellent',
            '良': 'level-good', 
            '适宜': 'level-suitable',
            '舒适': 'level-comfortable',
            '较适宜': 'level-fairly-suitable',
            '不宜': 'level-unsuitable',
            '较不宜': 'level-fairly-unsuitable',
            '带伞': 'level-bring-umbrella',
            '最弱': 'level-weakest',
            '弱': 'level-weak',
            '中等': 'level-moderate',
            '强': 'level-strong',
            '很强': 'level-very-strong'
        };
        
        return levelMap[level] || 'level-default';
    }

    // 华氏度转摄氏度
    fahrenheitToCelsius(fahrenheit) {
        const celsius = (fahrenheit - 32) * 5 / 9;
        return Math.round(celsius * 10) / 10; // 保留一位小数
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

// 添加生活指数级别样式
const style = document.createElement('style');
style.textContent = `
    .aqi-good { color: #52c41a; }
    .aqi-moderate { color: #faad14; }
    .aqi-unhealthy-sensitive { color: #fa8c16; }
    .aqi-unhealthy { color: #f5222d; }
    .aqi-very-unhealthy { color: #a0206e; }
    .aqi-hazardous { color: #722ed1; }
    
    .level-excellent, .level-suitable, .level-comfortable { color: #52c41a; }
    .level-good, .level-fairly-suitable { color: #1890ff; }
    .level-bring-umbrella, .level-moderate { color: #faad14; }
    .level-unsuitable, .level-fairly-unsuitable { color: #f5222d; }
    .level-weakest, .level-weak { color: #52c41a; }
    .level-strong, .level-very-strong { color: #fa8c16; }
    .level-default { color: #666; }
`;
document.head.appendChild(style);

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