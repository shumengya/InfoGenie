// 配置已在 env.js 中定义

// DOM元素
const articleTextInput = document.getElementById('articleText');
const emojiStyleSelect = document.getElementById('emojiStyle');
const markdownOptionSelect = document.getElementById('markdownOption');
const formatBtn = document.getElementById('formatBtn');
const loadingDiv = document.getElementById('loading');
const resultContainer = document.getElementById('resultContainer');
const previewSection = document.getElementById('previewSection');
const markdownPreview = document.getElementById('markdownPreview');
const rawSection = document.getElementById('rawSection');
const markdownRaw = document.getElementById('markdownRaw');
const copyMdBtn = document.getElementById('copyMdBtn');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');

// 加载器控制
function showLoading(show) {
  loadingDiv.style.display = show ? 'block' : 'none';
  formatBtn.disabled = show;
}

// 错误提示
function showErrorMessage(msg) {
  resultContainer.innerHTML = `<div class="placeholder">${msg}</div>`;
}

// 调用后端API
async function callBackendAPI(articleText, emojiStyle, markdownOption) {
  try {
    const token = window.AUTH_CONFIG.getToken();
    if (!token) throw new Error('未登录，请先登录后使用AI功能');

    const url = `${window.API_CONFIG.baseUrl}${window.API_CONFIG.endpoints.markdownFormatting}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        article_text: articleText,
        emoji_style: emojiStyle,
        markdown_option: markdownOption
      })
    });

    if (!response.ok) {
      if (response.status === 402) throw new Error('您的萌芽币余额不足，无法使用此功能');
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success && data.formatted_markdown) return data.formatted_markdown;
    throw new Error(data.error || 'API响应格式异常');
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
}

// 显示结果
function displayFormattingResult(markdownText) {
  // 源Markdown
  markdownRaw.textContent = markdownText || '';
  rawSection.style.display = markdownText ? 'block' : 'none';

  // 预览渲染（使用marked + DOMPurify）
  let html = '';
  try {
    // 兼容新旧版本的marked库
    if (typeof marked === 'function') {
      // 旧版本marked直接调用
      html = marked(markdownText || '');
    } else if (marked && typeof marked.parse === 'function') {
      // 新版本marked使用parse方法
      html = marked.parse(markdownText || '');
    } else {
      throw new Error('marked库未正确加载');
    }
    
    // 使用DOMPurify清理HTML（如果可用）
    const safeHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
    markdownPreview.innerHTML = safeHtml;
  } catch (error) {
    console.error('Markdown渲染失败:', error);
    markdownPreview.innerHTML = `<div class="error">Markdown渲染失败: ${error.message}</div>`;
  }
  
  previewSection.style.display = markdownText ? 'block' : 'none';

  // 顶部结果容器状态
  resultContainer.innerHTML = '';
  resultContainer.classList.add('conversion-result');
}

// 复制功能
function copyToClipboard(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

copyMdBtn.addEventListener('click', () => copyToClipboard(markdownRaw.textContent || ''));
copyHtmlBtn.addEventListener('click', () => copyToClipboard(markdownPreview.innerHTML || ''));

// 执行排版
async function performFormatting() {
  const articleText = articleTextInput.value.trim();
  const emojiStyle = emojiStyleSelect.value;
  const markdownOption = markdownOptionSelect.value;

  if (!articleText) {
    showErrorMessage('请输入需要排版的文章内容');
    return;
  }

  showLoading(true);
  resultContainer.innerHTML = '';
  previewSection.style.display = 'none';
  rawSection.style.display = 'none';

  try {
    const markdown = await callBackendAPI(articleText, emojiStyle, markdownOption);
    displayFormattingResult(markdown);
  } catch (error) {
    console.error('排版失败:', error);
    showErrorMessage(`排版失败: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// 事件绑定
formatBtn.addEventListener('click', performFormatting);

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  resultContainer.innerHTML = '<div class="placeholder">请输入文章内容，选择Emoji风格与排版偏好，然后点击开始排版</div>';
});

// 导出函数供HTML调用
window.performFormatting = performFormatting;
window.copyToClipboard = copyToClipboard;