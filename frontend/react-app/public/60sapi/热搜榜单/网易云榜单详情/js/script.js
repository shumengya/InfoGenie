// 网易云榜单详情 JavaScript
class NeteaseMusicRankDetail {
    constructor() {
        this.apiUrls = [];
        this.currentApiIndex = 0;
        this.rankData = null;
        this.init();
    }

    async init() {
        try {
            await this.loadApiUrls();
            this.bindEvents();
            this.checkUrlParams();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('初始化失败，请刷新页面重试');
        }
    }

    // 加载API接口列表
    async loadApiUrls() {
        try {
            const response = await fetch('./接口集合.json');
            if (!response.ok) {
                throw new Error('无法加载API接口配置');
            }
            this.apiUrls = await response.json();
            console.log('API接口加载成功:', this.apiUrls);
        } catch (error) {
            console.error('加载API接口失败:', error);
            // 使用默认接口
            this.apiUrls = [
                'https://60s-cf.viki.moe',
                'https://60s.viki.moe',
                'https://60s.b23.run',
                'https://60s.114128.xyz',
                'https://60s-cf.114128.xyz'
            ];
        }
    }

    // 绑定事件
    bindEvents() {
        const loadBtn = document.getElementById('loadBtn');
        const rankIdInput = document.getElementById('rankId');
        const retryBtn = document.getElementById('retryBtn');

        loadBtn.addEventListener('click', () => this.loadRankDetail());
        retryBtn.addEventListener('click', () => this.loadRankDetail());
        
        // 回车键加载
        rankIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadRankDetail();
            }
        });

        // 输入验证
        rankIdInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            loadBtn.disabled = !value || !/^\d+$/.test(value);
        });
    }

    // 检查URL参数
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const rankId = urlParams.get('id');
        const rankName = urlParams.get('name');
        
        if (rankId && /^\d+$/.test(rankId)) {
            document.getElementById('rankId').value = rankId;
            
            // 如果有榜单名称，更新页面标题
            if (rankName) {
                document.title = `${decodeURIComponent(rankName)} - 网易云榜单详情`;
                document.querySelector('.title').textContent = `🎵 ${decodeURIComponent(rankName)}`;
                document.querySelector('.subtitle').textContent = '正在加载榜单详情...';
            }
            
            this.loadRankDetail();
        }
    }

    // 加载榜单详情
    async loadRankDetail() {
        const rankId = document.getElementById('rankId').value.trim();
        
        if (!rankId) {
            this.showError('请输入榜单ID');
            return;
        }

        if (!/^\d+$/.test(rankId)) {
            this.showError('榜单ID必须是数字');
            return;
        }

        this.showLoading();
        this.currentApiIndex = 0;
        
        try {
            const data = await this.fetchRankDetail(rankId);
            this.displayRankDetail(data);
            this.hideLoading();
            
            // 更新URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('id', rankId);
            window.history.replaceState({}, '', newUrl);
            
        } catch (error) {
            console.error('加载榜单详情失败:', error);
            this.hideLoading();
            this.showError(error.message || '加载失败，请检查榜单ID是否正确');
        }
    }

    // 获取榜单详情数据
    async fetchRankDetail(rankId) {
        let lastError = null;
        
        for (let i = 0; i < this.apiUrls.length; i++) {
            try {
                const apiUrl = this.apiUrls[this.currentApiIndex];
                const url = `${apiUrl}/v2/ncm-rank/${rankId}`;
                
                console.log(`尝试API ${this.currentApiIndex + 1}:`, url);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.code !== 200) {
                    throw new Error(data.message || '获取数据失败');
                }
                
                console.log('API调用成功:', data);
                return data;
                
            } catch (error) {
                console.warn(`API ${this.currentApiIndex + 1} 失败:`, error.message);
                lastError = error;
                this.currentApiIndex = (this.currentApiIndex + 1) % this.apiUrls.length;
                
                if (error.name === 'AbortError') {
                    lastError = new Error('请求超时，请重试');
                }
            }
        }
        
        throw lastError || new Error('所有API接口都无法访问');
    }

    // 显示榜单详情
    displayRankDetail(data) {
        this.rankData = data;
        const songs = data.data || [];
        
        // 显示榜单信息（如果有的话）
        this.displayRankInfo(songs[0]);
        
        // 显示歌曲列表
        this.displaySongList(songs);
        
        // 显示相关区域
        document.getElementById('songList').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }

    // 显示榜单信息
    displayRankInfo(firstSong) {
        const rankInfo = document.getElementById('rankInfo');
        
        if (firstSong && firstSong.rank_name) {
            document.getElementById('rankName').textContent = firstSong.rank_name;
            document.getElementById('rankDescription').textContent = `${firstSong.rank_name} - 网易云音乐官方榜单`;
            
            // 如果有专辑封面，使用第一首歌的专辑封面作为榜单封面
            if (firstSong.album && firstSong.album.cover) {
                document.getElementById('rankCover').src = firstSong.album.cover;
                document.getElementById('rankCover').alt = firstSong.rank_name;
            }
            
            document.getElementById('updateTime').textContent = `更新时间: ${this.formatDate(new Date())}`;
            document.getElementById('updateFrequency').textContent = '实时更新';
            
            rankInfo.style.display = 'block';
        } else {
            rankInfo.style.display = 'none';
        }
    }

    // 显示歌曲列表
    displaySongList(songs) {
        const songsContainer = document.getElementById('songs');
        const songCount = document.getElementById('songCount');
        
        songCount.textContent = `共 ${songs.length} 首歌曲`;
        
        songsContainer.innerHTML = '';
        
        songs.forEach((song, index) => {
            const songElement = this.createSongElement(song, index);
            songsContainer.appendChild(songElement);
        });
    }

    // 创建歌曲元素
    createSongElement(song) {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-item';
        
        // 处理艺术家信息
        const artists = Array.isArray(song.artist) ? song.artist : [song.artist].filter(Boolean);
        const artistNames = artists.map(artist => 
            typeof artist === 'object' ? artist.name : artist
        ).join(', ') || '未知艺术家';
        
        // 处理专辑信息
        const albumName = song.album && song.album.name ? song.album.name : '未知专辑';
        
        // 处理时长
        const duration = song.duration_desc || this.formatDuration(song.duration);
        
        // 处理热度
        const popularity = song.popularity || song.score || 0;
        
        songDiv.innerHTML = `
            <div class="song-rank ${song.rank <= 3 ? 'top3' : ''}">${song.rank}</div>
            <div class="song-info">
                <div class="song-title">${this.escapeHtml(song.title)}</div>
                <div class="song-artist">${this.escapeHtml(artistNames)}</div>
                <div class="song-album">${this.escapeHtml(albumName)}</div>
            </div>
            <div class="song-meta">
                <div class="song-duration">${duration}</div>
                <div class="song-popularity">${popularity}%</div>
            </div>
        `;
        
        // 添加点击事件
        if (song.link) {
            songDiv.style.cursor = 'pointer';
            songDiv.addEventListener('click', () => {
                window.open(song.link, '_blank');
            });
        }
        
        return songDiv;
    }

    // 格式化时长
    formatDuration(duration) {
        if (!duration) return '--:--';
        
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 格式化日期
    formatDate(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示加载状态
    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('songList').style.display = 'none';
        document.getElementById('loadBtn').disabled = true;
    }

    // 隐藏加载状态
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('loadBtn').disabled = false;
    }

    // 显示错误信息
    showError(message) {
        document.getElementById('error').style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('songList').style.display = 'none';
        document.getElementById('loadBtn').disabled = false;
    }
}

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new NeteaseMusicRankDetail();
});

// 添加CSS动画类
document.addEventListener('DOMContentLoaded', () => {
    // 为页面元素添加淡入动画
    const elements = document.querySelectorAll('.container > *');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});