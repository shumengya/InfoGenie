// 公网IP地址查询应用
class IPQueryApp {
    constructor() {
        this.apiEndpoint = 'https://60s.viki.moe/v2/ip';
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.createParticles();
        this.createBackgroundElements();
        console.log('IP查询应用初始化完成');
    }

    // 绑定事件
    bindEvents() {
        const queryBtn = document.getElementById('queryBtn');
        const retryBtn = document.getElementById('retryBtn');
        const copyBtn = document.getElementById('copyBtn');

        if (queryBtn) {
            queryBtn.addEventListener('click', () => this.queryIP());
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.queryIP());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyIP());
        }

        // 页面加载完成后自动查询一次
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.queryIP(), 500);
        });
    }

    // 创建浮动粒子
    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particlesContainer.appendChild(particle);
        }
    }

    // 创建背景元素
    createBackgroundElements() {
        // 创建网格背景
        const gridBackground = document.createElement('div');
        gridBackground.className = 'grid-background';
        document.body.appendChild(gridBackground);

        // 创建光晕效果
        const glowEffect = document.createElement('div');
        glowEffect.className = 'glow-effect';
        document.body.appendChild(glowEffect);
    }

    // 显示加载状态
    showLoading() {
        const loading = document.getElementById('loading');
        const ipInfo = document.getElementById('ipInfo');
        const errorMessage = document.getElementById('errorMessage');
        const queryBtn = document.getElementById('queryBtn');

        if (loading) loading.style.display = 'block';
        if (ipInfo) ipInfo.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        if (queryBtn) {
            queryBtn.disabled = true;
            queryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
        }
    }

    // 隐藏加载状态
    hideLoading() {
        const loading = document.getElementById('loading');
        const queryBtn = document.getElementById('queryBtn');

        if (loading) loading.style.display = 'none';
        if (queryBtn) {
            queryBtn.disabled = false;
            queryBtn.innerHTML = '<i class="fas fa-search"></i> 查询我的IP';
        }
    }

    // 显示错误信息
    showError(message) {
        const errorMessage = document.getElementById('error-message');
        const ipInfo = document.getElementById('ip-info');

        if (errorMessage) {
            errorMessage.style.display = 'block';
            const errorText = errorMessage.querySelector('p');
            if (errorText) errorText.textContent = message || '获取IP信息失败，请稍后重试';
        }
        if (ipInfo) ipInfo.style.display = 'none';
        
        this.hideLoading();
    }

    // 查询IP地址
    async queryIP() {
        try {
            this.showLoading();
            console.log('开始查询IP地址...');

            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('API响应状态:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();
            console.log('API返回数据:', data);

            if (data.code === 200 && data.data) {
                this.displayIPInfo(data.data);
            } else {
                throw new Error(data.message || '获取IP信息失败');
            }

        } catch (error) {
            console.error('查询IP失败:', error);
            this.showError(error.message);
        }
    }

    // 显示IP信息
    displayIPInfo(data) {
        const ipInfo = document.getElementById('ip-info');
        const errorMessage = document.getElementById('error-message');
        
        // 更新IP地址显示
        const ipAddressElement = document.getElementById('ip-address');
        if (ipAddressElement && data.ip) {
            ipAddressElement.textContent = data.ip;
        }

        // 更新查询时间
        const queryTimeElement = document.getElementById('query-time');
        if (queryTimeElement) {
            const now = new Date();
            queryTimeElement.textContent = now.toLocaleString('zh-CN');
        }

        // 更新详细信息 - 只显示API提供的数据
        if (data.location) this.updateDetailItem('location', data.location);
        else this.hideDetailItem('location');
        
        if (data.isp) this.updateDetailItem('isp', data.isp);
        else this.hideDetailItem('isp');
        
        if (data.country) this.updateDetailItem('country', data.country);
        else this.hideDetailItem('country');
        
        if (data.region) this.updateDetailItem('region', data.region);
        else this.hideDetailItem('region');
        
        if (data.city) this.updateDetailItem('city', data.city);
        else this.hideDetailItem('city');
        
        if (data.timezone) this.updateDetailItem('timezone', data.timezone);
        else this.hideDetailItem('timezone');

        // 显示IP信息，隐藏错误信息
        if (ipInfo) ipInfo.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
        
        this.hideLoading();
        console.log('IP信息显示完成');
    }

    // 更新详细信息项
    updateDetailItem(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            // 显示对应的详细信息行
            const detailRow = element.closest('.detail-item');
            if (detailRow) {
                detailRow.style.display = 'flex';
            }
        }
    }

    // 隐藏详细信息项
    hideDetailItem(id) {
        const element = document.getElementById(id);
        if (element) {
            // 隐藏整个详细信息行
            const detailRow = element.closest('.detail-item');
            if (detailRow) {
                detailRow.style.display = 'none';
            }
        }
    }

    // 复制IP地址
    async copyIP() {
        const ipAddressElement = document.getElementById('ip-address');
        const copyBtn = document.getElementById('copyBtn');
        
        if (!ipAddressElement || !ipAddressElement.textContent) {
            this.showToast('没有可复制的IP地址', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(ipAddressElement.textContent);
            
            // 更新按钮状态
            if (copyBtn) {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = '#50c878';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = '#4a90e2';
                }, 1500);
            }
            
            this.showToast('IP地址已复制到剪贴板', 'success');
            console.log('IP地址已复制:', ipAddressElement.textContent);
            
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败，请手动选择复制', 'error');
        }
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        // 移除已存在的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // 添加toast样式
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#50c878' : type === 'error' ? '#ff6b6b' : '#4a90e2'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
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

        document.body.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
                if (style.parentNode) {
                    style.remove();
                }
            }, 300);
        }, 3000);
    }

    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// 初始化应用
const app = new IPQueryApp();

// 导出到全局作用域（用于调试）
window.IPQueryApp = app;