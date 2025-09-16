// 从配置文件导入设置
// 配置在 env.js 文件中定义

// DOM 元素
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const poemOutput = document.getElementById('poemOutput');
const themeInput = document.getElementById('theme');

// 调用后端API
async function callBackendAPI(theme) {
    try {
        const response = await fetch('http://127.0.0.1:5002/api/aimodelapp/poetry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                theme: theme
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            return data.poem;
        } else {
            throw new Error(data.error || 'API响应格式异常');
        }
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 显示错误信息
function showErrorMessage(message) {
    // 清除之前的错误信息
    const existingError = document.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = `生成失败：${message}。请检查网络连接。`;
    poemOutput.parentNode.appendChild(errorDiv);
}

// 显示加载状态
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    generateBtn.disabled = show;
    generateBtn.textContent = show ? '创作中...' : '生成古诗';
}

// 生成古诗
async function generatePoem() {
    const theme = themeInput.value.trim();
    
    if (!theme) {
        alert('请输入作诗主题');
        return;
    }
    
    showLoading(true);
    poemOutput.textContent = '';
    
    // 清除之前的错误信息
    const existingError = document.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }
    
    try {
        const poem = await callBackendAPI(theme);
        poemOutput.textContent = poem.trim();
    } catch (error) {
        console.error('生成古诗失败:', error);
        showErrorMessage(error.message);
        poemOutput.textContent = '生成失败，请重试';
    } finally {
        showLoading(false);
    }
}

// 事件监听器
generateBtn.addEventListener('click', generatePoem);

// 回车键生成
themeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generatePoem();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认占位符
    poemOutput.textContent = '点击"生成古诗"按钮，AI将为您创作优美的古诗';
});

// 导出函数供HTML调用
window.generatePoem = generatePoem;