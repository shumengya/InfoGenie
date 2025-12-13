// 随机答案之书 页面脚本
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
        this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/answer`);
      } catch (e) {
        // 如果无法加载接口集合，使用默认接口
        this.endpoints = ['https://60s.api.shumengya.top/v2/answer'];
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
    answer: null,
    answerEn: null,
    indexEl: null,
    refreshBtn: null,
    copyBtn: null,
  };

  function initDom() {
    els.loading = document.getElementById('loading');
    els.error = document.getElementById('error');
    els.container = document.getElementById('content');

    els.answer = document.getElementById('answer');
    els.answerEn = document.getElementById('answer-en');
    els.indexEl = document.getElementById('index');
    els.refreshBtn = document.getElementById('refresh-btn');
    els.copyBtn = document.getElementById('copy-btn');
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
          timeout: 10000 // 10秒超时（兼容同目录页面风格）
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

    const cn = d.answer || '';
    const en = d.answer_en || '';
    const idx = d.index != null ? d.index : d.id != null ? d.id : '-';

    els.answer.innerHTML = safeText(cn || '-');

    if (en) {
      els.answerEn.style.display = 'block';
      els.answerEn.innerHTML = safeText(en);
    } else {
      els.answerEn.style.display = 'none';
      els.answerEn.innerHTML = '';
    }

    els.indexEl.textContent = idx;
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
    if (els.copyBtn) {
      els.copyBtn.addEventListener('click', async () => {
        const textParts = [];
        const cn = els.answer?.textContent?.trim();
        const en = els.answerEn?.textContent?.trim();
        if (cn) textParts.push(cn);
        if (en) textParts.push(en);
        const finalText = textParts.join('\n');
        try {
          await navigator.clipboard.writeText(finalText);
          const old = els.copyBtn.textContent;
          els.copyBtn.textContent = '已复制';
          setTimeout(() => { els.copyBtn.textContent = old; }, 1200);
        } catch (e) {
          alert('复制失败，请手动选择文本复制');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDom();
    bindEvents();
    load();
  });
})();