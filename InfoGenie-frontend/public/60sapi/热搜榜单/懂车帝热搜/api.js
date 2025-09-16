/**
 * 懂车帝热搜API模块
 * 负责数据获取、验证和格式化
 */
class CarHotTopicsAPI {
    constructor() {
        this.baseURL = 'https://60s.api.shumengya.top/v2/dongchedi';
        this.timeout = 10000; // 10秒超时
        this.retryCount = 3;
        this.retryDelay = 1000; // 1秒重试延迟
    }

    /**
     * 获取热搜数据
     * @param {string} encoding - 编码格式（可选）
     * @returns {Promise<Object>} 热搜数据
     */
    async fetchHotTopics(encoding = '') {
        const url = encoding ? `${this.baseURL}?encoding=${encodeURIComponent(encoding)}` : this.baseURL;
        
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                console.log(`[API] 尝试获取数据 (${attempt}/${this.retryCount}): ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('[API] 数据获取成功:', data);
                
                // 验证数据格式
                const validatedData = this.validateData(data);
                return this.formatData(validatedData);
                
            } catch (error) {
                console.error(`[API] 第${attempt}次请求失败:`, error.message);
                
                if (attempt === this.retryCount) {
                    throw new Error(`获取数据失败: ${error.message}`);
                }
                
                // 等待后重试
                await this.delay(this.retryDelay * attempt);
            }
        }
    }

    /**
     * 验证API返回数据格式
     * @param {Object} data - API返回的原始数据
     * @returns {Object} 验证后的数据
     */
    validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('数据格式错误：响应不是有效的JSON对象');
        }

        if (data.code !== 200) {
            throw new Error(`API错误：${data.message || '未知错误'}`);
        }

        if (!Array.isArray(data.data)) {
            throw new Error('数据格式错误：data字段不是数组');
        }

        // 验证每个热搜项目的必需字段
        data.data.forEach((item, index) => {
            const requiredFields = ['rank', 'title', 'score', 'score_desc'];
            const missingFields = requiredFields.filter(field => !(field in item));
            
            if (missingFields.length > 0) {
                console.warn(`[API] 第${index + 1}项数据缺少字段:`, missingFields);
            }
        });

        return data;
    }

    /**
     * 格式化数据
     * @param {Object} data - 验证后的数据
     * @returns {Object} 格式化后的数据
     */
    formatData(data) {
        const formattedTopics = data.data.map(item => ({
            rank: parseInt(item.rank) || 0,
            title: String(item.title || '').trim(),
            score: parseInt(item.score) || 0,
            scoreDesc: String(item.score_desc || '').trim(),
            // 添加一些计算字段
            isTop3: parseInt(item.rank) <= 3,
            formattedScore: this.formatScore(item.score),
            searchUrl: this.generateSearchUrl(item.title)
        }));

        return {
            code: data.code,
            message: data.message,
            data: formattedTopics,
            updateTime: new Date().toLocaleString('zh-CN'),
            total: formattedTopics.length
        };
    }

    /**
     * 格式化分数显示
     * @param {number} score - 原始分数
     * @returns {string} 格式化后的分数
     */
    formatScore(score) {
        if (!score || isNaN(score)) return '0';
        
        if (score >= 10000) {
            return (score / 10000).toFixed(1) + 'w';
        }
        
        return score.toLocaleString();
    }

    /**
     * 生成搜索URL
     * @param {string} title - 热搜标题
     * @returns {string} 搜索URL
     */
    generateSearchUrl(title) {
        const encodedTitle = encodeURIComponent(title);
        return `https://www.dongchedi.com/search?query=${encodedTitle}`;
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取API状态
     * @returns {Promise<Object>} API状态信息
     */
    async getAPIStatus() {
        try {
            const startTime = Date.now();
            await this.fetchHotTopics();
            const responseTime = Date.now() - startTime;
            
            return {
                status: 'online',
                responseTime: responseTime,
                message: 'API服务正常'
            };
        } catch (error) {
            return {
                status: 'offline',
                responseTime: null,
                message: error.message
            };
        }
    }
}

// 导出API实例
window.CarHotTopicsAPI = CarHotTopicsAPI;