// 环境与认证在 env.js 中定义

const relationInput = document.getElementById('relationInput');
const calcBtn = document.getElementById('calcBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultSection = document.getElementById('resultSection');
const mandarinTitleEl = document.getElementById('mandarinTitle');
const dialectListEl = document.getElementById('dialectList');
const copyMandarinBtn = document.getElementById('copyMandarinBtn');
const notesBlock = document.getElementById('notesBlock');
const notesEl = document.getElementById('notes');

function setExample(text) {
  relationInput.value = text;
}
window.setExample = setExample;

function showLoading(show) {
  loadingDiv.style.display = show ? 'block' : 'none';
  calcBtn.disabled = show;
}

function showError(msg) {
  errorDiv.textContent = msg || '';
  errorDiv.style.display = msg ? 'block' : 'none';
}

function clearResults() {
  resultSection.style.display = 'none';
  mandarinTitleEl.textContent = '';
  dialectListEl.innerHTML = '';
  notesBlock.style.display = 'none';
  notesEl.textContent = '';
}

async function callKinshipAPI(relationChain) {
  const token = window.AUTH_CONFIG.getToken();
  if (!token) throw new Error('未登录，请先登录后使用AI功能');

  const url = `${window.API_CONFIG.baseUrl}${window.API_CONFIG.endpoints.kinshipCalculator}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ relation_chain: relationChain })
  });

  if (!resp.ok) {
    if (resp.status === 402) throw new Error('您的萌芽币余额不足，无法使用此功能');
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `API请求失败: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  if (!data.success) throw new Error(data.error || 'API响应异常');
  return data;
}

function renderDialects(dialectTitles) {
  dialectListEl.innerHTML = '';
  const order = ['粤语','闽南语','上海话','四川话','东北话','客家话'];
  const names = order.concat(Object.keys(dialectTitles || {}).filter(k => !order.includes(k)));

  names.forEach(name => {
    const info = dialectTitles?.[name];
    if (!info || (!info.title && !info.romanization && !info.notes)) return;
    const item = document.createElement('div');
    item.className = 'dialect-item';
    const title = (info.title || '').toString();
    const roman = (info.romanization || '').toString();
    const notes = (info.notes || '').toString();
    item.innerHTML = `
      <div class="dialect-name">${name}</div>
      <div class="dialect-title">${title}</div>
      ${roman ? `<div class="dialect-roman">${roman}</div>` : ''}
      ${notes ? `<div class="dialect-notes">${notes}</div>` : ''}
    `;
    dialectListEl.appendChild(item);
  });
}

async function doCalculate() {
  const relation = (relationInput.value || '').trim();
  if (!relation) {
    showError('请输入亲属关系链');
    return;
  }
  showError('');
  showLoading(true);
  clearResults();

  try {
    const data = await callKinshipAPI(relation);
    mandarinTitleEl.textContent = data.mandarin_title || '';
    renderDialects(data.dialect_titles || {});
    if (data.notes) {
      notesEl.textContent = data.notes;
      notesBlock.style.display = 'block';
    }
    resultSection.style.display = 'block';
  } catch (e) {
    console.error('计算失败:', e);
    showError(`计算失败: ${e.message}`);
  } finally {
    showLoading(false);
  }
}

function copyText(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

copyMandarinBtn.addEventListener('click', () => {
  const t = mandarinTitleEl.textContent || '';
  if (!t) return;
  copyText(t);
});

calcBtn.addEventListener('click', doCalculate);

document.addEventListener('DOMContentLoaded', () => {
  showError('');
});