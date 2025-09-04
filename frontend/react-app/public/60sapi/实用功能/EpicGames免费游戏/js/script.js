// Epic Games 免费游戏 页面脚本
(function () {
  'use strict';

  const API = {
    endpoints: [],
    currentIndex: 0,
    // 初始化API接口列表
    async init() {
      try {
        const res = await fetch('./接口集合.json');
        const endpoints = await res.json();
        this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/epic`);
      } catch (e) {
        // 如果无法加载接口集合，使用默认接口
        this.endpoints = ['https://60s-api.viki.moe/v2/epic'];
      }
    },
    // 获取当前接口URL
    getCurrentUrl(encoding) {
      if (this.endpoints.length === 0) return null;
      const url = new URL(this.endpoints[this.currentIndex]);
      if (encoding) url.searchParams.set('encoding', encoding);
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
    gamesGrid: null,
    totalGames: null,
    freeNow: null,
    upcoming: null,
    refreshBtn: null,
  };

  function initDom() {
    els.loading = document.getElementById('loading');
    els.error = document.getElementById('error');
    els.container = document.getElementById('content');
    els.gamesGrid = document.getElementById('games-grid');
    els.totalGames = document.getElementById('total-games');
    els.freeNow = document.getElementById('free-now');
    els.upcoming = document.getElementById('upcoming');
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

  function safeText(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  }

  async function fetchData(preferLocal = false) {
    if (preferLocal) {
      try {
        const res = await fetch('./返回接口.json', { cache: 'no-store' });
        const json = await res.json();
        return json;
      } catch (e) {
        throw new Error('本地数据加载失败');
      }
    }

    // 重置API索引到第一个接口
    API.reset();
    
    // 尝试所有API接口
    for (let i = 0; i < API.endpoints.length; i++) {
      try {
        const url = API.getCurrentUrl();
        console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
        
        const res = await fetch(url, { 
          cache: 'no-store',
          timeout: 10000 // 10秒超时
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        
        if (json && json.code === 200) {
          console.log(`接口 ${i + 1} 请求成功`);
          return json;
        }
        
        throw new Error(json && json.message ? json.message : '接口返回异常');
        
      } catch (e) {
        console.warn(`接口 ${i + 1} 失败:`, e.message);
        
        // 如果不是最后一个接口，切换到下一个
        if (i < API.endpoints.length - 1) {
          API.switchToNext();
          continue;
        }
        
        // 所有接口都失败了，尝试本地数据
        console.warn('所有远程接口都失败，尝试本地数据');
        try {
          const res = await fetch('./返回接口.json', { cache: 'no-store' });
          const json = await res.json();
          return json;
        } catch (e2) {
          throw new Error('所有接口和本地数据都无法访问');
        }
      }
    }
  }

  function createGameCard(game) {
    const isFree = game.is_free_now;
    const statusClass = isFree ? 'status-free' : 'status-upcoming';
    const statusText = isFree ? '限时免费' : '即将免费';
    
    return `
      <div class="game-card fade-in">
        <div class="status-badge ${statusClass}">${statusText}</div>
        <img class="game-cover" src="${safeText(game.cover)}" alt="${safeText(game.title)} 封面" loading="lazy" />
        <div class="game-info">
          <h3 class="game-title">${safeText(game.title)}</h3>
          <p class="game-description">${safeText(game.description)}</p>
          
          <div class="game-meta">
            <div class="game-price">
              <span class="original-price">${safeText(game.original_price_desc)}</span>
              <span class="free-price">免费</span>
            </div>
            <div class="game-seller">${safeText(game.seller)}</div>
          </div>
          
          <div class="game-dates">
            <div class="free-period">
              <span>开始：${formatDate(game.free_start)}</span>
              <span>结束：${formatDate(game.free_end)}</span>
            </div>
          </div>
          
          <div class="game-actions">
            <a href="${safeText(game.link)}" target="_blank" class="btn">
              ${isFree ? '立即领取' : '查看详情'}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function updateStats(games) {
    const total = games.length;
    const freeNow = games.filter(game => game.is_free_now).length;
    const upcoming = total - freeNow;
    
    els.totalGames.textContent = total;
    els.freeNow.textContent = freeNow;
    els.upcoming.textContent = upcoming;
  }

  function renderGames(games) {
    if (!Array.isArray(games) || games.length === 0) {
      els.gamesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #5a7c65;">暂无游戏数据</div>';
      return;
    }

    // 按状态排序：免费的在前
    const sortedGames = [...games].sort((a, b) => {
      if (a.is_free_now && !b.is_free_now) return -1;
      if (!a.is_free_now && b.is_free_now) return 1;
      return 0;
    });

    const html = sortedGames.map(game => createGameCard(game)).join('');
    els.gamesGrid.innerHTML = html;
    
    updateStats(games);
  }

  function render(data) {
    const games = data?.data || [];
    renderGames(games);
    showContent();
  }

  async function load() {
    showLoading();
    
    // 初始化API接口列表
    await API.init();
    
    try {
      const data = await fetchData(false);
      render(data);
    } catch (e) {
      console.error('数据获取失败：', e);
      showError(e.message || '获取数据失败，请稍后重试');
    }
  }

  function bindEvents() {
    if (els.refreshBtn) {
      els.refreshBtn.addEventListener('click', load);
    }
    
    // 快捷键 Ctrl+R 刷新（不拦截浏览器默认刷新）
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'r' && !e.defaultPrevented) {
        // 不阻止默认行为，让浏览器正常刷新
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDom();
    bindEvents();
    load();
  });
})();