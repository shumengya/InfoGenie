// API 配置和数据获取模块
class HotTopicsAPI {
    constructor() {
        this.apiUrl = 'https://60s.api.shumengya.top/v2/baidu/tieba';
        this.fallbackData = null;
    }

    // 获取热搜数据
    async fetchHotTopics() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // 添加超时控制
                signal: AbortSignal.timeout(10000) // 10秒超时
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 验证数据格式
            if (!this.validateData(data)) {
                throw new Error('Invalid data format');
            }

            // 缓存成功的数据作为备用
            this.fallbackData = data;
            
            return {
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('API请求失败:', error);
            
            // 如果有缓存数据，返回缓存数据
            if (this.fallbackData) {
                return {
                    success: true,
                    data: this.fallbackData,
                    timestamp: new Date().toISOString(),
                    isCache: true
                };
            }
            
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // 验证数据格式
    validateData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        if (data.code !== 200) {
            return false;
        }

        if (!Array.isArray(data.data)) {
            return false;
        }

        // 验证数据项格式
        return data.data.every(item => {
            return item.rank && 
                   item.title && 
                   item.desc && 
                   item.score_desc;
        });
    }

    // 处理图片URL
    processImageUrl(url) {
        if (!url) return null;
        
        // 处理百度贴吧图片URL的特殊字符
        try {
            return url.replace(/&amp;/g, '&');
        } catch (error) {
            console.warn('图片URL处理失败:', error);
            return null;
        }
    }

    // 处理跳转URL
    processTopicUrl(url) {
        if (!url) return '#';
        
        try {
            return url.replace(/&amp;/g, '&');
        } catch (error) {
            console.warn('链接URL处理失败:', error);
            return '#';
        }
    }

    // 格式化分数显示
    formatScore(score, scoreDesc) {
        if (scoreDesc) {
            return scoreDesc;
        }
        
        if (typeof score === 'number') {
            if (score >= 10000) {
                return (score / 10000).toFixed(1) + 'w';
            }
            return score.toString();
        }
        
        return '0';
    }

    // 截断文本
    truncateText(text, maxLength = 100) {
        if (!text) return '';
        
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength) + '...';
    }

    // 获取排名样式类
    getRankClass(rank) {
        if (rank === 1) return 'top-1';
        if (rank === 2) return 'top-2';
        if (rank === 3) return 'top-3';
        return 'normal';
    }
}

// 导出API实例
const hotTopicsAPI = new HotTopicsAPI();