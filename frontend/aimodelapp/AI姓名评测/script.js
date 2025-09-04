// GitHub API 配置
const GITHUB_TOKEN = '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';
const endpoint = 'https://models.github.ai/inference/chat/completions';
const model = 'deepseek/DeepSeek-V3-0324';

// DOM 元素
const nameInput = document.getElementById('nameInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const rarityScore = document.getElementById('rarityScore');
const rarityDesc = document.getElementById('rarityDesc');
const phoneticScore = document.getElementById('phoneticScore');
const phoneticDesc = document.getElementById('phoneticDesc');
const meaningAnalysis = document.getElementById('meaningAnalysis');

// 专业的姓名分析提示词
const createNameAnalysisPrompt = (name) => {
  return `你是一位专业的姓名学专家和语言学家，请对输入的姓名进行全面分析。请直接输出分析结果，不要包含任何思考过程或<think>标签。

姓名：${name}

请按照以下格式严格输出分析结果：

【稀有度评分】
评分：X%
评价：[对稀有度的详细说明，包括姓氏和名字的常见程度分析]

【音韵评价】
评分：X%
评价：[对音韵美感的分析，包括声调搭配、读音流畅度、音律和谐度等]

【含义解读】
[详细分析姓名的寓意内涵，包括：
1. 姓氏的历史渊源和文化背景
2. 名字各字的含义和象征
3. 整体姓名的寓意组合
4. 可能体现的父母期望或文化内涵
5. 与传统文化、诗词典故的关联等]

要求：
1. 评分必须是1-100的整数百分比，要有明显区分度，避免雷同
2. 分析要专业、客观、有依据，评分要根据实际情况有所差异
3. 含义解读要详细深入，至少150字
4. 严格按照上述格式输出，不要添加思考过程、<think>标签或其他内容
5. 如果是生僻字或罕见姓名，要特别说明
6. 直接输出最终结果，不要显示推理过程`;
};

// 解析AI返回的分析结果
function parseAnalysisResult(content) {
  const result = {
    rarityScore: '--%',
    rarityDesc: '解析失败',
    phoneticScore: '--%',
    phoneticDesc: '解析失败',
    meaningAnalysis: '解析失败'
  };

  try {
    // 过滤掉DeepSeek的思考标签内容
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    cleanContent = cleanContent.replace(/<think>[\s\S]*$/gi, ''); // 处理未闭合的think标签
    cleanContent = cleanContent.trim();
    
    console.log('清理后的内容:', cleanContent);

    // 提取稀有度评分（百分比格式）
    const rarityMatch = cleanContent.match(/【稀有度评分】[\s\S]*?评分：(\d+)%[\s\S]*?评价：([\s\S]*?)(?=【|$)/);
    if (rarityMatch) {
      result.rarityScore = rarityMatch[1] + '%';
      result.rarityDesc = rarityMatch[2].trim();
    }

    // 提取音韵评价（百分比格式）
    const phoneticMatch = cleanContent.match(/【音韵评价】[\s\S]*?评分：(\d+)%[\s\S]*?评价：([\s\S]*?)(?=【|$)/);
    if (phoneticMatch) {
      result.phoneticScore = phoneticMatch[1] + '%';
      result.phoneticDesc = phoneticMatch[2].trim();
    }

    // 提取含义解读
    const meaningMatch = cleanContent.match(/【含义解读】[\s\S]*?\n([\s\S]+)$/);
    if (meaningMatch) {
      result.meaningAnalysis = meaningMatch[1].trim();
    }
  } catch (error) {
    console.error('解析结果时出错:', error);
  }

  return result;
}

// 简单的markdown解析函数
function parseMarkdown(text) {
  if (!text || typeof text !== 'string') return text;
  
  // 处理加粗 **text** 或 __text__
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // 处理斜体 *text* 或 _text_
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // 处理无序列表
  const lines = parsed.split('\n');
  let inList = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检查是否是列表项（以 - 开头，后面跟空格）
    if (line.match(/^-\s+/)) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      // 移除开头的 "- " 并包装为 <li>
      const listContent = line.replace(/^-\s+/, '');
      result.push(`<li>${listContent}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line) {
        result.push(line);
      }
    }
  }
  
  // 如果最后还在列表中，需要关闭列表
  if (inList) {
    result.push('</ul>');
  }
  
  // 重新组合，用 <br> 连接非列表行
  parsed = result.join('<br>');
  
  // 清理多余的 <br> 标签（在列表前后）
  parsed = parsed.replace(/<br><ul>/g, '<ul>');
  parsed = parsed.replace(/<\/ul><br>/g, '</ul>');
  parsed = parsed.replace(/<br><li>/g, '<li>');
  parsed = parsed.replace(/<\/li><br>/g, '</li>');
  
  return parsed;
}

// 更新显示结果
function updateResults(result) {
  rarityScore.textContent = result.rarityScore;
  rarityDesc.innerHTML = parseMarkdown(result.rarityDesc);
  phoneticScore.textContent = result.phoneticScore;
  phoneticDesc.innerHTML = parseMarkdown(result.phoneticDesc);
  meaningAnalysis.innerHTML = parseMarkdown(result.meaningAnalysis);
}

// 重置结果显示
function resetResults() {
  rarityScore.textContent = '--%';
  rarityDesc.innerHTML = '点击"开始分析"查看结果';
  phoneticScore.textContent = '--%';
  phoneticDesc.innerHTML = '点击"开始分析"查看结果';
  meaningAnalysis.innerHTML = '点击"开始分析"查看姓名的深层寓意';
}

// 显示错误信息
function showError(message) {
  // 清除之前的错误信息
  const existingError = document.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }

  // 创建新的错误信息
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = `分析失败：${message}。`;
  document.querySelector('.result-section').appendChild(errorDiv);
}

// 姓名验证
function validateName(name) {
  if (!name) {
    return '请输入姓名';
  }
  if (name.length < 2) {
    return '姓名至少需要2个字符';
  }
  if (name.length > 10) {
    return '姓名不能超过10个字符';
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(name)) {
    return '姓名只能包含中文或英文字符';
  }
  return null;
}

// 主要分析函数
async function analyzeName() {
  const name = nameInput.value.trim();
  
  // 验证输入
  const validationError = validateName(name);
  if (validationError) {
    alert(validationError);
    return;
  }

  // 显示加载状态
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = '分析中...';
  loading.style.display = 'block';
  resetResults();
  
  // 清除之前的错误信息
  const existingError = document.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }

  const requestBody = {
    model: model,
    messages: [{ 
      role: "user", 
      content: createNameAnalysisPrompt(name)
    }],
    temperature: 0.7,
    max_tokens: 1000
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // 检查HTTP状态码
    if (response.status === 429) {
      throw new Error('短时间内请求次数过多，请休息一下！');
    }
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data?.choices?.[0]?.message?.content) {
      const analysisResult = parseAnalysisResult(data.choices[0].message.content.trim());
      updateResults(analysisResult);
    } else {
      throw new Error('AI响应格式异常');
    }
  } catch (error) {
    console.error('分析姓名时出错:', error);
    showError(error.message);
    resetResults();
  } finally {
    // 恢复按钮状态
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '开始分析';
    loading.style.display = 'none';
  }
}

// 事件监听器
analyzeBtn.addEventListener('click', analyzeName);

// 回车键快捷分析
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    analyzeName();
  }
});

// 输入框内容变化时清除错误信息
nameInput.addEventListener('input', () => {
  const existingError = document.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }
});