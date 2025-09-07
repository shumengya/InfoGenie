// 随机唱歌音频 页面脚本
(function () {
  'use strict';

  const API = {
    endpoints: [],
    currentIndex: 0,
    params: {
      encoding: 'json'
    },
    localFallback: '返回接口.json',
    // 初始化API接口列表
    async init() {
      try {
        const res = await fetch('./接口集合.json');
        const endpoints = await res.json();
        this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/changya`);
      } catch (e) {
        // 如果无法加载接口集合，使用默认接口
        this.endpoints = ['https://60s.api.shumengya.top/v2/changya'];
      }
    },
    // 获取当前接口URL
    getCurrentUrl() {
      if (this.endpoints.length === 0) return null;
      const url = new URL(this.endpoints[this.currentIndex]);
      Object.entries(this.params).forEach(([k, v]) => url.searchParams.append(k, v));
      return url.toString();
    },
    // 切换到下一个接口
    switchToNext() {
      this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
      return this.currentIndex < this.endpoints.length;
    },
    // 重置到第一个接口
    reset() {
      this.currentIndex = 0;
    }
  };

  // DOM 元素引用
  const els = {
    loading: null,
    error: null,
    container: null,
    avatar: null,
    nickname: null,
    gender: null,
    songTitle: null,
    songMeta: null,
    lyrics: null,
    audio: null,
    likeCount: null,
    publishTime: null,
    link: null,
    refreshBtn: null,
  };

  function initDom() {
    els.loading = document.getElementById('loading');
    els.error = document.getElementById('error');
    els.container = document.getElementById('content');

    els.avatar = document.getElementById('avatar');
    els.nickname = document.getElementById('nickname');
    els.gender = document.getElementById('gender');
    els.songTitle = document.getElementById('song-title');
    els.songMeta = document.getElementById('song-meta');
    els.lyrics = document.getElementById('lyrics');

    els.audio = document.getElementById('audio');
    els.likeCount = document.getElementById('like-count');
    els.publishTime = document.getElementById('publish-time');
    els.link = document.getElementById('link');
    els.refreshBtn = document.getElementById('refresh-btn');
  }

  function showLoading() {
    els.loading.style.display = 'block';
    els.error.style.display = 'none';
    els.container.style.display = 'none';
  }

  function showError(msg) {
    els.loading.style.display = 'none';
    els.error.style.display = 'block';
    els.container.style.display = 'none';
    els.error.querySelector('p').textContent = msg || '获取数据失败，请稍后重试';
  }

  function showContent() {
    els.loading.style.display = 'none';
    els.error.style.display = 'none';
    els.container.style.display = 'block';
  }

  function formatDuration(ms) {
    if (!ms && ms !== 0) return '';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function safeText(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  async function fetchFromAPI() {
    // 初始化API接口列表
    await API.init();
    
    // 重置API索引到第一个接口
    API.reset();
    
    // 尝试所有API接口
    for (let i = 0; i < API.endpoints.length; i++) {
      try {
        const url = API.getCurrentUrl();
        console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
        
        const resp = await fetch(url, { 
          cache: 'no-store',
          timeout: 10000 // 10秒超时
        });
        
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
        
        const data = await resp.json();
        
        if (data && data.code === 200) {
          console.log(`接口 ${i + 1} 请求成功`);
          return data;
        }
        
        throw new Error(data && data.message ? data.message : '接口返回异常');
        
      } catch (e) {
        console.warn(`接口 ${i + 1} 失败:`, e.message);
        
        // 如果不是最后一个接口，切换到下一个
        if (i < API.endpoints.length - 1) {
          API.switchToNext();
          continue;
        }
        
        // 所有接口都失败了
        console.warn('所有远程接口都失败，尝试本地数据');
        return null;
      }
    }
  }

  async function fetchFromLocal() {
    try {
      const resp = await fetch(API.localFallback + `?t=${Date.now()}`);
      if (!resp.ok) throw new Error(`本地文件HTTP ${resp.status}`);
      const data = await resp.json();
      return data;
    } catch (e) {
      console.error('读取本地返回接口.json失败:', e);
      return null;
    }
  }

  function render(data) {
    const d = data?.data || {};
    const user = d.user || {};
    const song = d.song || {};
    const audio = d.audio || {};

    // 用户信息
    els.avatar.src = user.avatar_url || '';
    els.avatar.alt = (user.nickname || '用户') + ' 头像';
    els.nickname.textContent = user.nickname || '未知用户';
    els.gender.textContent = user.gender === 'female' ? '女' : user.gender === 'male' ? '男' : '未知';

    // 歌曲信息
    els.songTitle.textContent = song.name || '未知歌曲';
    els.songMeta.textContent = song.singer ? `演唱：${song.singer}` : '';

    els.lyrics.innerHTML = '';
    if (Array.isArray(song.lyrics)) {
      const frag = document.createDocumentFragment();
      song.lyrics.forEach(line => {
        const p = document.createElement('p');
        p.innerHTML = safeText(line);
        frag.appendChild(p);
      });
      els.lyrics.appendChild(frag);
    }

    // 音频
    els.audio.src = audio.url || '';
    els.audio.preload = 'none';

    // 其他信息
    els.likeCount.textContent = typeof audio.like_count === 'number' ? audio.like_count : '-';
    const publish = audio.publish || (audio.publish_at ? new Date(audio.publish_at).toLocaleString() : '');
    els.publishTime.textContent = publish;
    els.link.href = audio.link || '#';
    els.link.target = '_blank';

    // 时长信息
    const durationEl = document.getElementById('duration');
    durationEl.textContent = formatDuration(audio.duration);

    showContent();
  }

  async function load() {
    showLoading();
    try {
      // 先尝试远程API
      const data = await fetchFromAPI();
      if (data) {
        render(data);
        return;
      }
      
      // 远程API失败，尝试本地数据
      const localData = await fetchFromLocal();
      if (localData) {
        render(localData);
        return;
      }
      
      // 都失败了
      showError('获取数据失败，请稍后重试');
    } catch (e) {
      console.error('加载数据时发生错误:', e);
      showError('获取数据失败，请稍后重试');
    }
  }

  function bindEvents() {
    if (els.refreshBtn) {
      els.refreshBtn.addEventListener('click', load);
    }
    // 快捷键 Ctrl+R 刷新（不拦截浏览器默认刷新）
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDom();
    bindEvents();
    load();
  });
})();