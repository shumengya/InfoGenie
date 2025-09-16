// UI 渲染和交互模块
class UIManager {
    constructor() {
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            hotList: document.getElementById('hotList'),
            refreshBtn: document.getElementById('refreshBtn'),
            updateTime: document.getElementById('updateTime')
        };
        
        this.isLoading = false;
        this.initEventListeners();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 刷新按钮点击事件
        this.elements.refreshBtn.addEventListener('click', () => {
            if (!this.isLoading) {
                this.refreshData();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                if (!this.isLoading) {
                    this.refreshData();
                }
            }
        });

        // 下拉刷新（移动端）
        this.initPullToRefresh();
    }

    // 初始化下拉刷新
    initPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        const threshold = 80;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isPulling && window.scrollY === 0) {
                currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > 0) {
                    e.preventDefault();
                    
                    // 添加视觉反馈
                    if (pullDistance > threshold) {
                        this.elements.refreshBtn.style.transform = 'scale(1.1)';
                    } else {
                        this.elements.refreshBtn.style.transform = 'scale(1)';
                    }
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling) {
                const pullDistance = currentY - startY;
                
                if (pullDistance > threshold && !this.isLoading) {
                    this.refreshData();
                }
                
                this.elements.refreshBtn.style.transform = 'scale(1)';
                isPulling = false;
            }
        });
    }

    // 显示加载状态
    showLoading() {
        this.isLoading = true;
        this.elements.loading.style.display = 'block';
        this.elements.error.style.display = 'none';
        this.elements.hotList.style.display = 'none';
        this.elements.refreshBtn.classList.add('loading');
    }

    // 隐藏加载状态
    hideLoading() {
        this.isLoading = false;
        this.elements.loading.style.display = 'none';
        this.elements.refreshBtn.classList.remove('loading');
    }

    // 显示错误状态
    showError(message = '获取数据失败，请稍后重试') {
        this.hideLoading();
        this.elements.error.style.display = 'block';
        this.elements.hotList.style.display = 'none';
        
        const errorText = this.elements.error.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
    }

    // 显示热搜列表
    showHotList() {
        this.hideLoading();
        this.elements.error.style.display = 'none';
        this.elements.hotList.style.display = 'grid';
    }

    // 渲染热搜数据
    renderHotTopics(data) {
        if (!data || !data.data || !Array.isArray(data.data)) {
            this.showError('数据格式错误');
            return;
        }

        const hotTopics = data.data;
        this.elements.hotList.innerHTML = '';

        hotTopics.forEach((topic, index) => {
            const hotItem = this.createHotItem(topic, index);
            this.elements.hotList.appendChild(hotItem);
        });

        this.showHotList();
        this.updateTimestamp(data.isCache);
    }

    // 创建热搜项目元素
    createHotItem(topic, index) {
        const item = document.createElement('div');
        item.className = 'hot-item';
        item.style.animationDelay = `${index * 0.1}s`;

        // 处理数据
        const rank = topic.rank || (index + 1);
        const title = hotTopicsAPI.truncateText(topic.title, 80);
        const desc = hotTopicsAPI.truncateText(topic.desc, 120);
        const score = hotTopicsAPI.formatScore(topic.score, topic.score_desc);
        const avatarUrl = hotTopicsAPI.processImageUrl(topic.avatar);
        const topicUrl = hotTopicsAPI.processTopicUrl(topic.url);
        const rankClass = hotTopicsAPI.getRankClass(rank);

        item.innerHTML = `
            <div class="hot-item-header">
                <div class="rank-badge ${rankClass}">
                    ${rank}
                </div>
                <div class="hot-item-content">
                    <h3 class="hot-title">${title}</h3>
                    <p class="hot-desc">${desc}</p>
                    <div class="hot-meta">
                        <div class="hot-score">
                            <i class="fas fa-fire"></i>
                            <span>${score}</span>
                        </div>
                        ${avatarUrl ? `<img class="hot-avatar" src="${avatarUrl}" alt="话题图片" onerror="this.style.display='none'">` : ''}
                    </div>
                </div>
            </div>
        `;

        // 添加点击事件
        item.addEventListener('click', () => {
            this.openTopic(topicUrl, title);
        });

        // 添加长按事件（移动端）
        let pressTimer;
        item.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.showTopicMenu(topic, e.touches[0].clientX, e.touches[0].clientY);
            }, 500);
        });

        item.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        item.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });

        return item;
    }

    // 打开话题链接
    openTopic(url, title) {
        if (url && url !== '#') {
            // 在新窗口打开
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            this.showToast('链接暂不可用');
        }
    }

    // 显示话题菜单（长按）
    showTopicMenu(topic, x, y) {
        const menu = document.createElement('div');
        menu.className = 'topic-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            padding: 8px 0;
            z-index: 1000;
            min-width: 120px;
        `;

        const actions = [
            { text: '打开链接', action: () => this.openTopic(hotTopicsAPI.processTopicUrl(topic.url), topic.title) },
            { text: '复制标题', action: () => this.copyText(topic.title) },
            { text: '分享', action: () => this.shareContent(topic) }
        ];

        actions.forEach(action => {
            const item = document.createElement('div');
            item.textContent = action.text;
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                font-size: 14px;
                color: #333;
                border-bottom: 1px solid #f0f0f0;
            `;
            item.addEventListener('click', () => {
                action.action();
                document.body.removeChild(menu);
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    // 复制文本
    async copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('已复制到剪贴板');
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败');
        }
    }

    // 分享内容
    async shareContent(topic) {
        const shareData = {
            title: topic.title,
            text: topic.desc,
            url: hotTopicsAPI.processTopicUrl(topic.url)
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // 降级到复制链接
                await this.copyText(`${topic.title} - ${shareData.url}`);
            }
        } catch (error) {
            console.error('分享失败:', error);
        }
    }

    // 显示提示消息
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // 更新时间戳
    updateTimestamp(isCache = false) {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const cacheText = isCache ? ' (缓存数据)' : '';
        this.elements.updateTime.textContent = `最后更新：${timeString}${cacheText}`;
    }

    // 刷新数据
    async refreshData() {
        if (window.loadHotTopics) {
            await window.loadHotTopics();
        }
    }
}

// 导出UI管理器实例
const uiManager = new UIManager();

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(10px); }
    }
`;
document.head.appendChild(style);