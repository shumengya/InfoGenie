/**
 * UI管理模块
 * 负责页面渲染、交互和状态管理
 */
class UIManager {
    constructor() {
        this.elements = {};
        this.isLoading = false;
        this.currentData = null;
        this.touchStartY = 0;
        this.pullThreshold = 80;
        this.isPulling = false;
        
        this.initElements();
        this.bindEvents();
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            hotList: document.getElementById('hotList'),
            topicsContainer: document.getElementById('topicsContainer'),
            refreshBtn: document.getElementById('refreshBtn'),
            updateTime: document.getElementById('updateTime'),
            toast: document.getElementById('toast')
        };

        // 检查必需元素
        const missingElements = Object.entries(this.elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.error('[UI] 缺少必需的DOM元素:', missingElements);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 刷新按钮点击事件
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.handleRefresh();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.handleRefresh();
            }
        });

        // 移动端下拉刷新
        this.initPullToRefresh();

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentData) {
                // 页面重新可见时检查数据是否过期（5分钟）
                const lastUpdate = new Date(this.currentData.updateTime);
                const now = new Date();
                if (now - lastUpdate > 5 * 60 * 1000) {
                    this.handleRefresh();
                }
            }
        });
    }

    /**
     * 初始化下拉刷新功能
     */
    initPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pullDistance = 0;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                this.isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.isPulling || this.isLoading) return;

            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;

            if (pullDistance > 0 && window.scrollY === 0) {
                e.preventDefault();
                
                // 添加视觉反馈
                const progress = Math.min(pullDistance / this.pullThreshold, 1);
                document.body.style.transform = `translateY(${pullDistance * 0.3}px)`;
                document.body.style.opacity = 1 - progress * 0.1;
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (this.isPulling) {
                document.body.style.transform = '';
                document.body.style.opacity = '';
                
                if (pullDistance > this.pullThreshold && !this.isLoading) {
                    this.handleRefresh();
                }
                
                this.isPulling = false;
                pullDistance = 0;
            }
        });
    }

    /**
     * 处理刷新操作
     */
    async handleRefresh() {
        if (this.isLoading) return;
        
        this.showToast('正在刷新数据...');
        
        // 触发自定义刷新事件
        const refreshEvent = new CustomEvent('refreshData');
        document.dispatchEvent(refreshEvent);
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.isLoading = true;
        this.hideAllStates();
        if (this.elements.loading) {
            this.elements.loading.style.display = 'flex';
        }
        
        // 刷新按钮加载状态
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.classList.add('loading');
            this.elements.refreshBtn.disabled = true;
        }
    }

    /**
     * 显示错误状态
     * @param {string} message - 错误消息
     */
    showError(message = '加载失败，请稍后重试') {
        this.isLoading = false;
        this.hideAllStates();
        
        if (this.elements.error) {
            this.elements.error.style.display = 'flex';
            const errorMessage = this.elements.error.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
        
        this.resetRefreshButton();
    }

    /**
     * 显示热搜列表
     * @param {Object} data - 热搜数据
     */
    showHotList(data) {
        this.isLoading = false;
        this.currentData = data;
        this.hideAllStates();
        
        if (this.elements.hotList) {
            this.elements.hotList.style.display = 'block';
        }
        
        this.renderTopics(data.data);
        this.updateTime(data.updateTime);
        this.resetRefreshButton();
        
        this.showToast(`已更新 ${data.total} 条热搜数据`);
    }

    /**
     * 隐藏所有状态
     */
    hideAllStates() {
        ['loading', 'error', 'hotList'].forEach(state => {
            if (this.elements[state]) {
                this.elements[state].style.display = 'none';
            }
        });
    }

    /**
     * 重置刷新按钮状态
     */
    resetRefreshButton() {
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.classList.remove('loading');
            this.elements.refreshBtn.disabled = false;
        }
    }

    /**
     * 渲染热搜话题列表
     * @param {Array} topics - 话题数组
     */
    renderTopics(topics) {
        if (!this.elements.topicsContainer) return;
        
        this.elements.topicsContainer.innerHTML = '';
        
        topics.forEach((topic, index) => {
            const topicElement = this.createTopicElement(topic, index);
            this.elements.topicsContainer.appendChild(topicElement);
        });
    }

    /**
     * 创建单个话题元素
     * @param {Object} topic - 话题数据
     * @param {number} index - 索引
     * @returns {HTMLElement} 话题元素
     */
    createTopicElement(topic, index) {
        const item = document.createElement('div');
        item.className = 'topic-item';
        item.style.animationDelay = `${index * 0.1}s`;
        
        item.innerHTML = `
            <div class="topic-header">
                <div class="rank-badge ${topic.isTop3 ? 'top-3' : 'normal'}">
                    ${topic.rank}
                </div>
                <div class="topic-title">${this.escapeHtml(topic.title)}</div>
            </div>
            <div class="topic-footer">
                <div class="topic-score">${topic.scoreDesc}</div>
                <div class="topic-actions">
                    <button class="action-btn copy-btn" data-text="${this.escapeHtml(topic.title)}">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn search-btn" data-url="${topic.searchUrl}">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.bindTopicEvents(item, topic);
        return item;
    }

    /**
     * 绑定话题元素事件
     * @param {HTMLElement} element - 话题元素
     * @param {Object} topic - 话题数据
     */
    bindTopicEvents(element, topic) {
        // 点击整个项目跳转搜索
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                window.open(topic.searchUrl, '_blank');
            }
        });

        // 复制按钮
        const copyBtn = element.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(topic.title);
            });
        }

        // 搜索按钮
        const searchBtn = element.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(topic.searchUrl, '_blank');
            });
        }

        // 长按显示详情
        let longPressTimer;
        element.addEventListener('touchstart', () => {
            longPressTimer = setTimeout(() => {
                this.showTopicDetails(topic);
            }, 800);
        });

        element.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        element.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    /**
     * 显示话题详情
     * @param {Object} topic - 话题数据
     */
    showTopicDetails(topic) {
        const details = `
            标题: ${topic.title}
            排名: 第${topic.rank}名
            热度: ${topic.scoreDesc}
            原始分数: ${topic.score.toLocaleString()}
        `;
        
        this.showToast(details, 3000);
    }

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            this.showToast('已复制到剪贴板');
        } catch (error) {
            console.error('[UI] 复制失败:', error);
            this.showToast('复制失败');
        }
    }

    /**
     * 更新时间显示
     * @param {string} time - 更新时间
     */
    updateTime(time) {
        if (this.elements.updateTime) {
            this.elements.updateTime.textContent = `更新时间: ${time}`;
        }
    }

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    showToast(message, duration = 2000) {
        if (!this.elements.toast) return;
        
        this.elements.toast.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, duration);
    }

    /**
     * HTML转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 获取当前数据
     * @returns {Object|null} 当前数据
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * 清除当前数据
     */
    clearData() {
        this.currentData = null;
        if (this.elements.topicsContainer) {
            this.elements.topicsContainer.innerHTML = '';
        }
    }
}

// 导出UI管理器
window.UIManager = UIManager;