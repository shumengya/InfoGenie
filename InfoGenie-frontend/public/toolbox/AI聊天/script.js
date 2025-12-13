// 简单的静态网页调用 GitHub Models API 进行聊天
// 注意：将 token 暴露在前端存在安全风险，仅用于本地演示

const endpoint = "https://models.github.ai/inference";
let apiKey = ""; // 注意：已硬编码，仅用于本地演示

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const modelSelect = document.getElementById("model");

// 模型信息映射（中文描述与上下文上限）
const MODEL_INFO = {
  "openai/gpt-4.1": {
    name: "gpt-4.1",
    inputTokens: "1049k",
    outputTokens: "33k",
    about: "在各方面优于 gpt-4o，编码、指令跟随与长上下文理解均有显著提升"
  },
  "openai/gpt-4.1-mini": {
    name: "gpt-4.1-mini",
    inputTokens: "1049k",
    outputTokens: "33k",
    about: "在各方面优于 gpt-4o-mini，在编码、指令跟随与长上下文处理上有显著提升"
  },
  "openai/gpt-4.1-nano": {
    name: "gpt-4.1-nano",
    inputTokens: "1049k",
    outputTokens: "33k",
    about: "在编码、指令跟随与长上下文处理上有所提升，同时具备更低延迟与成本"
  },
  "openai/gpt-4o": {
    name: "gpt-4o",
    inputTokens: "131k",
    outputTokens: "16k",
    about: "OpenAI 最先进的多模态 gpt-4o 家族模型，可处理文本与图像输入"
  },
  "openai/gpt-5": {
    name: "gpt-5",
    inputTokens: "200k",
    outputTokens: "100k",
    about: "针对逻辑密集与多步骤任务设计"
  },
  "deepseek-r1": {
    name: "deepseek-r1",
    inputTokens: "128k",
    outputTokens: "4k",
    about: "通过逐步训练过程在推理任务上表现出色，适用于语言、科学推理与代码生成等"
  },
  "deepseek-v3-0324": {
    name: "deepseek-v3-0324",
    inputTokens: "128k",
    outputTokens: "4k",
    about: "相较于 DeepSeek-V3 在关键方面显著提升，包括更强的推理能力、函数调用与代码生成表现"
  },
  "xai/grok-3": {
    name: "grok-3",
    inputTokens: "131k",
    outputTokens: "4k",
    about: "Grok 3 是 xAI 的首发模型，由 Colossus 在超大规模上进行预训练，在金融、医疗和法律等专业领域表现突出。"
  },
  "xai/grok-3-mini": {
    name: "grok-3-mini",
    inputTokens: "131k",
    outputTokens: "4k",
    about: "Grok 3 Mini 是一款轻量级模型，会在答复前进行思考。它针对数学与科学问题进行训练，特别适合逻辑类任务。"
  }
};

function renderModelInfo() {
  const m = MODEL_INFO[modelSelect.value];
  const infoEl = document.getElementById('model-info');
  if (!infoEl) return;
  if (m) {
    infoEl.innerHTML = `<div><span class="name">${m.name}</span> <span class="tokens">上下文 ${m.inputTokens} 输入 · ${m.outputTokens} 输出</span></div><div class="about">简介：${m.about}</div>`;
  } else {
    infoEl.innerHTML = `<div class="about">未配置该模型的上下文限制信息</div>`;
  }
}



// Markdown 解析配置（若库已加载）
if (window.marked) {
  marked.setOptions({ gfm: true, breaks: true, headerIds: true, mangle: false });
}

function renderMarkdown(text) {
  try {
    if (window.marked && window.DOMPurify) {
      const html = marked.parse(text || '');
      return DOMPurify.sanitize(html);
    }
  } catch (_) {}
  return text || '';
}

function appendMessage(role, text){
  const message = document.createElement('div');
  message.className = `message ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  // Markdown 渲染
  bubble.innerHTML = renderMarkdown(text);
  message.appendChild(bubble);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendStreamingMessage(role){
  const message = document.createElement('div');
  message.className = `message ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble._mdBuffer = '';
  bubble.innerHTML = '';
  message.appendChild(bubble);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble;
}

async function sendMessage(){
  const content = userInput.value.trim();
  if (!content) return;
  appendMessage('user', content);
  userInput.value = '';

  const model = modelSelect.value;

  // 令牌已硬编码（本地演示），如未配置则提示
  if (!apiKey) {
    appendMessage('assistant', '未配置令牌');
    return;
  }

  sendBtn.disabled = true;
  const assistantBubble = appendStreamingMessage('assistant');

  try {
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 1,
        top_p: 1,
        stream: true,
        messages: [
          { role: 'system', content: '' },
          { role: 'user', content }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let doneStream = false;

    while (!doneStream) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop();
      for (const part of parts) {
        const line = part.trim();
        if (line === '') continue;
        if (line.startsWith('data:')) {
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') {
            doneStream = true;
            break;
          }
          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? '';
            if (delta) {
              // 累计流式文本并增量渲染 Markdown
              assistantBubble._mdBuffer = (assistantBubble._mdBuffer || '') + delta;
              const safeHtml = renderMarkdown(assistantBubble._mdBuffer);
              assistantBubble.innerHTML = safeHtml;
              chatBox.scrollTop = chatBox.scrollHeight;
            }
          } catch (e) {
            // 忽略无法解析的行
          }
        }
      }
    }

    if (!assistantBubble._mdBuffer || !assistantBubble.textContent) {
      assistantBubble.textContent = '（无内容返回）';
    }
  } catch (err) {
    //assistantBubble.textContent = `出错了：${err.message}`;
    assistantBubble.textContent = `调用次数过多或者使用人数过多，请稍后再试！`;
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 切换模型时更新信息面板，初次渲染一次
modelSelect.addEventListener('change', renderModelInfo);
renderModelInfo();