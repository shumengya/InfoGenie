// 从配置文件导入设置
// 配置在 env.js 文件中定义

// DOM 元素
const nameInput = document.getElementById('nameInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const rarityScore = document.getElementById('rarityScore');
const rarityDesc = document.getElementById('rarityDesc');
const phoneticScore = document.getElementById('phoneticScore');
const phoneticDesc = document.getElementById('phoneticDesc');
const meaningAnalysis = document.getElementById('meaningAnalysis');



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
    name: name
  };

  try {
    // 调用后端API
    const response = await fetch('http://127.0.0.1:5002/api/aimodelapp/name-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // 检查HTTP状态码
    if (response.status === 429) {
      throw new Error('短时间内请求次数过多，请休息一下！');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.analysis) {
      const analysisResult = parseAnalysisResult(data.analysis.trim());
      updateResults(analysisResult);
    } else {
      throw new Error(data.error || 'AI响应格式异常');
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