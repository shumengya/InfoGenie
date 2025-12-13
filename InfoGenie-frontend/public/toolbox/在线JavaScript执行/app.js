(function () {
  const $ = (id) => document.getElementById(id);
  const codeEl = $("code");
  const runBtn = $("runBtn");
  const copyBtn = $("copyBtn");
  const pasteBtn = $("pasteBtn");
  const clearBtn = $("clearBtn");
  const outputEl = $("output");
  const sandboxEl = $("sandbox");

  // 以JS方式设置带换行的占位符，避免HTML属性中的 \n 无效
  codeEl.placeholder = "在此编写或粘贴 JavaScript 代码…\n例如：\nconsole.log('Hello, InfoGenie!');";

  let sandboxReady = false;

  // 沙箱页面（srcdoc）内容：拦截 console、收集错误、支持 async/await
  const sandboxHtml = `<!doctype html><html><head><meta charset=\"utf-8\"></head><body>
    <script>
      (function(){
        function serialize(value){
          try {
            if (typeof value === 'string') return value;
            if (typeof value === 'function') return value.toString();
            if (value === undefined) return 'undefined';
            if (value === null) return 'null';
            if (typeof value === 'object') return JSON.stringify(value, null, 2);
            return String(value);
          } catch (e) {
            try { return String(value); } catch(_){ return Object.prototype.toString.call(value); }
          }
        }

        ['log','info','warn','error'].forEach(level => {
          const orig = console[level];
          console[level] = (...args) => {
            try { parent.postMessage({type:'console', level, args: args.map(serialize)}, '*'); } catch(_){ }
            try { orig && orig.apply(console, args); } catch(_){ }
          };
        });

        window.onerror = function(message, source, lineno, colno, error){
          var stack = error && error.stack ? error.stack : (source + ':' + lineno + ':' + colno);
          parent.postMessage({type:'error', message: String(message), stack}, '*');
        };

        parent.postMessage({type:'ready'}, '*');

        window.addEventListener('message', async (e) => {
          const data = e.data;
          if (!data || data.type !== 'code') return;
          try {
            // 用 async IIFE 包裹，支持顶层 await
            await (async () => { eval(data.code); })();
            parent.postMessage({type:'done'}, '*');
          } catch (err) {
            parent.postMessage({type:'error', message: (err && err.message) || String(err), stack: err && err.stack}, '*');
          }
        }, false);
      })();
    <\/script>
  </body></html>`;

  // 初始化沙箱
  sandboxEl.srcdoc = sandboxHtml;
  sandboxEl.addEventListener('load', () => {
    // 等待 ready 消息
  });

  window.addEventListener('message', (e) => {
    const data = e.data;
    if (!data) return;
    switch (data.type) {
      case 'ready':
        sandboxReady = true;
        break;
      case 'console':
        (data.args || []).forEach((text) => appendLine(text, data.level));
        break;
      case 'error':
        appendLine('[错误] ' + data.message, 'error');
        if (data.stack) appendLine(String(data.stack), 'error');
        break;
      case 'done':
        tip('执行完成。');
        break;
      default:
        break;
    }
  });

  runBtn.addEventListener('click', () => {
    const code = codeEl.value || '';
    if (!code.trim()) { tip('请先输入要执行的代码。'); return; }
    outputEl.textContent = '';
    if (!sandboxReady) tip('沙箱初始化中，稍候执行…');
    // 发送代码到沙箱执行
    try {
      sandboxEl.contentWindow.postMessage({ type: 'code', code }, '*');
    } catch (err) {
      appendLine('[错误] ' + ((err && err.message) || String(err)), 'error');
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEl.value);
      tip('已复制到剪贴板。');
    } catch (err) {
      tip('复制失败，请检查剪贴板权限。');
    }
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) codeEl.value = txt;
      tip('已粘贴剪贴板内容。');
    } catch (err) {
      tip('粘贴失败，请允许访问剪贴板。');
    }
  });

  clearBtn.addEventListener('click', () => {
    outputEl.textContent = '';
  });

  function appendLine(text, level) {
    const span = document.createElement('span');
    span.className = 'line ' + (level || 'log');
    span.textContent = String(text);
    outputEl.appendChild(span);
    outputEl.appendChild(document.createTextNode('\n'));
    outputEl.scrollTop = outputEl.scrollHeight;
  }
  function tip(text){ appendLine('[提示] ' + text, 'info'); }
})();