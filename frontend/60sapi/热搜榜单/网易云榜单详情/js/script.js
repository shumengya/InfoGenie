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
                'https://60s.viki.moe',
                'https://60s-cf.viki.moe',
                'https://60s.b23.run',
                'https://60s.114128.xyz',
                'https://60s-cf.114128.xyz',
                'https://60s.api.shumengya.top',
                'https://api.03c3.cn/api/zb',
                'https://api.vvhan.com/api/60s'
            ];
        }
        
        // 确保至少有一个API接口
        if (!this.apiUrls || this.apiUrls.length === 0) {
            this.apiUrls = [
                'https://60s.viki.moe',
                'https://60s-cf.viki.moe',
                'https://60s.b23.run',
                'https://60s.114128.xyz',
                'https://60s-cf.114128.xyz',
                'https://60s.api.shumengya.top',
                'https://api.03c3.cn/api/zb',
                'https://api.vvhan.com/api/60s'
            ];
        }
    }

    // 绑定事件
    bindEvents() {
        const loadBtn = document.getElementById('loadBtn');
        const rankIdInput = document.getElementById('rankId');
        const retryBtn = document.getElementById('retryBtn');
        const backLink = document.getElementById('backLink');
        const backBtnBottom = document.getElementById('backBtnBottom');

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
        
        // 处理返回链接
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                console.log('返回榜单列表');
            });
        }
        
        if (backBtnBottom) {
            backBtnBottom.addEventListener('click', (e) => {
                console.log('返回榜单列表');
            });
        }
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
            this.rankData = data;
            this.displayRankDetail(data);
            this.hideLoading();
            
            // 更新URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('id', rankId);
            if (data.playlist && data.playlist.name) {
                newUrl.searchParams.set('name', encodeURIComponent(data.playlist.name));
                document.title = `${data.playlist.name} - 网易云榜单详情`;
            }
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
        let attemptedApis = 0;
        
        // 尝试所有API接口
        while (attemptedApis < this.apiUrls.length) {
            try {
                const apiUrl = this.apiUrls[this.currentApiIndex];
                let url = `${apiUrl}/v2/ncm-rank/${rankId}`;
                
                // 处理本地JSON文件
                if (apiUrl.includes('返回接口.json')) {
                    url = apiUrl;
                    console.log('使用本地测试数据:', url);
                }
                // 针对不同API接口格式进行适配
                else if (apiUrl.includes('03c3.cn') || apiUrl.includes('vvhan.com')) {
                    // 这些API可能有不同的路径格式，需要特殊处理
                    if (apiUrl.includes('03c3.cn')) {
                        url = `${apiUrl}/ncm/playlist?id=${rankId}`;
                    } else if (apiUrl.includes('vvhan.com')) {
                        url = `${apiUrl}/music/netease/playlist?id=${rankId}`;
                    }
                }
                
                console.log(`尝试API ${this.currentApiIndex + 1}/${this.apiUrls.length}:`, url);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 缩短超时时间
                
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                    },
                    // 添加缓存控制
                    cache: 'no-cache',
                    // 添加模式
                    mode: apiUrl.includes('返回接口.json') ? 'same-origin' : 'cors'
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // 如果是本地测试数据，直接使用
                if (apiUrl.includes('返回接口.json')) {
                    // 查找对应ID的榜单
                    if (data.data && Array.isArray(data.data)) {
                        const rank = data.data.find(item => item.id == rankId);
                        if (rank) {
                            // 构造一个符合详情页面期望的数据结构
                            return {
                                code: 200,
                                playlist: rank,
                                data: [] // 模拟空歌曲列表
                            };
                        }
                    }
                }
                
                // 不同API可能有不同的成功状态码
                if (data.code !== undefined && data.code !== 200 && data.code !== 0) {
                    throw new Error(data.message || data.msg || '获取数据失败');
                }
                
                console.log('API调用成功:', data);
                return data;
                
            } catch (error) {
                console.warn(`API ${this.currentApiIndex + 1} 失败:`, error.message);
                lastError = error;
                this.currentApiIndex = (this.currentApiIndex + 1) % this.apiUrls.length;
                attemptedApis++;
                
                if (error.name === 'AbortError') {
                    lastError = new Error('请求超时，请重试');
                }
                
                // 添加短暂延迟，避免过快请求下一个API
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        throw lastError || new Error('所有API接口都无法访问，请稍后再试');
    }

    // 显示榜单详情
    displayRankDetail(data) {
        this.rankData = data;
        
        // 适配不同API返回的数据格式
        let songs = [];
        let rankInfo = null;
        
        // 标准格式：data.data 是数组
        if (data.data && Array.isArray(data.data)) {
            songs = data.data;
            rankInfo = data.playlist || {};
        }
        // 03c3.cn API格式：data.result 或 data.playlist
        else if (data.result) {
            if (data.result.tracks && Array.isArray(data.result.tracks)) {
                songs = data.result.tracks;
                rankInfo = data.result;
            } else if (Array.isArray(data.result)) {
                songs = data.result;
            }
        }
        // vvhan.com API格式：data.playlist 和 data.playlist.tracks
        else if (data.playlist && data.playlist.tracks) {
            songs = data.playlist.tracks;
            rankInfo = data.playlist;
        }
        // 其他可能的格式
        else {
            // 尝试查找数据中的任何数组
            for (const key in data) {
                if (Array.isArray(data[key]) && data[key].length > 0) {
                    songs = data[key];
                    break;
                } else if (data[key] && data[key].tracks && Array.isArray(data[key].tracks)) {
                    songs = data[key].tracks;
                    rankInfo = data[key];
                    break;
                }
            }
        }
        
        if (songs.length === 0) {
            throw new Error('未找到歌曲数据或数据格式不兼容');
        }
        
        // 显示榜单信息（如果有的话）
        this.displayRankInfo(songs[0], rankInfo);
        
        // 显示歌曲列表
        this.displaySongList(songs);
        
        // 显示相关区域
        document.getElementById('songList').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }

    // 显示榜单信息
    displayRankInfo(firstSong, rankInfoData) {
        const rankInfoElement = document.getElementById('rankInfo');
        
        // 获取URL参数中的榜单名称
        const urlParams = new URLSearchParams(window.location.search);
        const rankNameFromUrl = urlParams.get('name');
        
        // 尝试从多个来源获取榜单名称
        let rankName = rankNameFromUrl || '';
        if (!rankName) {
            if (rankInfoData && rankInfoData.name) {
                rankName = rankInfoData.name;
            } else if (firstSong) {
                rankName = firstSong.rank_name || firstSong.rankName || firstSong.playlist_name || '';
            }
        }
        
        if (rankName) {
            document.getElementById('rankName').textContent = rankName;
            document.getElementById('rankDescription').textContent = `${rankName} - 网易云音乐官方榜单`;
            document.title = `${rankName} - 网易云音乐榜单详情`;
            
            // 尝试获取榜单封面
            let coverUrl = '';
            if (rankInfoData && rankInfoData.coverImgUrl) {
                coverUrl = rankInfoData.coverImgUrl;
            } else if (rankInfoData && rankInfoData.picUrl) {
                coverUrl = rankInfoData.picUrl;
            } else if (firstSong && firstSong.album && firstSong.album.cover) {
                coverUrl = firstSong.album.cover;
            } else if (firstSong && firstSong.album && firstSong.album.picUrl) {
                coverUrl = firstSong.album.picUrl;
            } else if (firstSong && firstSong.al && firstSong.al.picUrl) {
                coverUrl = firstSong.al.picUrl;
            }
            
            if (coverUrl) {
                document.getElementById('rankCover').src = coverUrl;
                document.getElementById('rankCover').alt = rankName;
            }
            
            // 尝试获取更新时间
            let updateTime = '';
            if (rankInfoData && rankInfoData.updateTime) {
                updateTime = this.formatDate(new Date(rankInfoData.updateTime));
            } else if (rankInfoData && rankInfoData.updateFrequency) {
                updateTime = rankInfoData.updateFrequency;
            } else {
                updateTime = this.formatDate(new Date());
            }
            
            document.getElementById('updateTime').textContent = `更新时间: ${updateTime}`;
            document.getElementById('updateFrequency').textContent = rankInfoData?.updateFrequency || '定期更新';
            
            rankInfoElement.style.display = 'block';
        } else {
            rankInfoElement.style.display = 'none';
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