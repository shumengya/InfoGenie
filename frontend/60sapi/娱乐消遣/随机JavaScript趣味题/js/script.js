// JavaScript趣味题应用
class JSQuizApp {
    constructor() {
        this.apiEndpoints = [
            'https://60s.api.shumengya.top',
        ];
        this.currentApiIndex = 0;
        this.currentQuestion = null;
        this.selectedOption = null;
        this.isAnswered = false;
        this.loadStartTime = null;
        
        this.initElements();
        this.bindEvents();
        this.preloadResources();
        this.loadQuestion();
    }
    
    // 初始化DOM元素
    initElements() {
        this.elements = {
            loading: document.getElementById('loading'),
            questionContainer: document.getElementById('questionContainer'),
            errorContainer: document.getElementById('errorContainer'),
            questionId: document.getElementById('questionId'),
            questionText: document.getElementById('questionText'),
            codeContent: document.getElementById('codeContent'),
            optionsContainer: document.getElementById('optionsContainer'),
            submitBtn: document.getElementById('submitBtn'),
            showAnswerBtn: document.getElementById('showAnswerBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            retryBtn: document.getElementById('retryBtn'),
            exportBtn: document.getElementById('exportBtn'),
            resultContainer: document.getElementById('resultContainer'),
            resultStatus: document.getElementById('resultStatus'),
            correctAnswer: document.getElementById('correctAnswer'),
            explanation: document.getElementById('explanation'),
            errorMessage: document.getElementById('errorMessage')
        };
    }
    
    // 预加载资源
    preloadResources() {
        // 预连接API服务器
        this.apiEndpoints.forEach(endpoint => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = endpoint;
            document.head.appendChild(link);
        });
    }
    
    // 绑定事件
    bindEvents() {
        this.elements.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.elements.showAnswerBtn.addEventListener('click', () => this.showAnswer());
        this.elements.refreshBtn.addEventListener('click', () => this.loadQuestion());
        this.elements.retryBtn.addEventListener('click', () => this.loadQuestion());
        this.elements.exportBtn.addEventListener('click', () => this.exportToMarkdown());
    }
    
    // 显示加载状态
    showLoading() {
        this.elements.loading.style.display = 'block';
        this.elements.questionContainer.style.display = 'none';
        this.elements.errorContainer.style.display = 'none';
    }
    
    // 显示题目
    showQuestion() {
        this.elements.loading.style.display = 'none';
        this.elements.questionContainer.style.display = 'block';
        this.elements.errorContainer.style.display = 'none';
    }
    
    // 显示错误
    showError(message) {
        this.elements.loading.style.display = 'none';
        this.elements.questionContainer.style.display = 'none';
        this.elements.errorContainer.style.display = 'block';
        this.elements.errorMessage.textContent = message;
    }
    
    // 获取当前API地址
    getCurrentApiUrl() {
        return `${this.apiEndpoints[this.currentApiIndex]}/v2/awesome-js`;
    }
    
    // 切换到下一个API
    switchToNextApi() {
        this.currentApiIndex = (this.currentApiIndex + 1) % this.apiEndpoints.length;
    }
    
    // 加载题目
    async loadQuestion() {
        this.loadStartTime = Date.now();
        this.showLoading();
        this.resetQuestion();
        
        let attempts = 0;
        const maxAttempts = this.apiEndpoints.length;
        
        while (attempts < maxAttempts) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(this.getCurrentApiUrl(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.code === 200 && data.data) {
                    this.currentQuestion = data.data;
                    const loadTime = Date.now() - this.loadStartTime;
                    console.log(`题目加载完成，耗时: ${loadTime}ms`);
                    this.displayQuestion();
                    return;
                } else {
                    throw new Error(data.message || '数据格式错误');
                }
                
            } catch (error) {
                console.warn(`API ${this.getCurrentApiUrl()} 请求失败:`, error.message);
                attempts++;
                
                if (attempts < maxAttempts) {
                    this.switchToNextApi();
                    console.log(`切换到备用API: ${this.getCurrentApiUrl()}`);
                } else {
                    this.showError(`所有API接口都无法访问，请检查网络连接后重试。\n最后尝试的错误: ${error.message}`);
                    return;
                }
            }
        }
    }
    
    // 重置题目状态
    resetQuestion() {
        this.selectedOption = null;
        this.isAnswered = false;
        this.elements.resultContainer.style.display = 'none';
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = '提交答案';
        this.elements.showAnswerBtn.style.display = 'inline-block';
        
        // 清空选项容器，防止重复显示
        this.elements.optionsContainer.innerHTML = '';
        
        // 移除所有选项的事件监听器
        const existingOptions = document.querySelectorAll('.option');
        existingOptions.forEach(option => {
            option.removeEventListener('click', this.selectOption);
        });
    }
    
    // 显示题目内容
    displayQuestion() {
        const question = this.currentQuestion;
        
        console.log('显示题目:', question);
        
        // 设置题目ID
        this.elements.questionId.textContent = `题目 #${question.id}`;
        
        // 设置题目文本
        this.elements.questionText.innerHTML = `<h2>${this.escapeHtml(question.question)}</h2>`;
        
        // 设置代码内容并应用语法高亮
        this.elements.codeContent.textContent = question.code;
        
        // 应用语法高亮
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(this.elements.codeContent);
        }
        
        // 确保选项容器已清空
        this.elements.optionsContainer.innerHTML = '';
        
        // 生成选项
        this.generateOptions(question.options);
        
        this.showQuestion();
    }
    
    // 生成选项
    generateOptions(options) {
        // 确保清空容器
        this.elements.optionsContainer.innerHTML = '';
        
        // 验证选项数据
        if (!Array.isArray(options) || options.length === 0) {
            console.error('选项数据无效:', options);
            return;
        }
        
        // 移除可能存在的重复选项
        const uniqueOptions = [...new Set(options)];
        
        uniqueOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            optionElement.dataset.value = option.charAt(0); // A, B, C, D
            
            optionElement.addEventListener('click', () => this.selectOption(optionElement));
            
            this.elements.optionsContainer.appendChild(optionElement);
        });
        
        console.log('生成选项:', uniqueOptions);
    }
    
    // 选择选项
    selectOption(optionElement) {
        if (this.isAnswered) return;
        
        // 移除之前的选中状态
        document.querySelectorAll('.option.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // 设置当前选中
        optionElement.classList.add('selected');
        this.selectedOption = optionElement.dataset.value;
        
        // 启用提交按钮
        this.elements.submitBtn.disabled = false;
    }
    
    // 提交答案
    submitAnswer() {
        if (!this.selectedOption || this.isAnswered) return;
        
        this.isAnswered = true;
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = '已提交';
        this.elements.showAnswerBtn.style.display = 'none';
        
        const isCorrect = this.selectedOption === this.currentQuestion.answer;
        
        // 显示结果
        this.showResult(isCorrect);
        
        // 标记选项
        this.markOptions();
    }
    
    // 显示答案
    showAnswer() {
        this.isAnswered = true;
        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = '已显示答案';
        this.elements.showAnswerBtn.style.display = 'none';
        
        // 显示结果（不判断对错）
        this.showResult(null);
        
        // 标记正确答案
        this.markCorrectAnswer();
    }
    
    // 显示结果
    showResult(isCorrect) {
        const resultContainer = this.elements.resultContainer;
        const resultStatus = this.elements.resultStatus;
        const correctAnswer = this.elements.correctAnswer;
        const explanation = this.elements.explanation;
        
        // 设置结果状态
        if (isCorrect === true) {
            resultStatus.textContent = '✅ 回答正确！';
            resultStatus.className = 'result-status correct';
        } else if (isCorrect === false) {
            resultStatus.textContent = '❌ 回答错误';
            resultStatus.className = 'result-status incorrect';
        } else {
            resultStatus.textContent = '💡 答案解析';
            resultStatus.className = 'result-status';
        }
        
        // 设置正确答案
        correctAnswer.textContent = `正确答案: ${this.currentQuestion.answer}`;
        
        // 设置解析内容
        explanation.innerHTML = this.formatExplanation(this.currentQuestion.explanation);
        
        // 显示结果容器
        resultContainer.style.display = 'block';
        
        // 滚动到结果区域
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
    
    // 标记选项
    markOptions() {
        const options = document.querySelectorAll('.option');
        const correctAnswer = this.currentQuestion.answer;
        
        options.forEach(option => {
            const optionValue = option.dataset.value;
            
            if (optionValue === correctAnswer) {
                option.classList.add('correct');
            } else if (option.classList.contains('selected')) {
                option.classList.add('incorrect');
            }
            
            // 禁用点击
            option.style.pointerEvents = 'none';
        });
    }
    
    // 标记正确答案
    markCorrectAnswer() {
        const options = document.querySelectorAll('.option');
        const correctAnswer = this.currentQuestion.answer;
        
        options.forEach(option => {
            const optionValue = option.dataset.value;
            
            if (optionValue === correctAnswer) {
                option.classList.add('correct');
            }
            
            // 禁用点击
            option.style.pointerEvents = 'none';
        });
    }
    
    // 格式化解析内容
    formatExplanation(explanation) {
        // 转义HTML
        let formatted = this.escapeHtml(explanation);
        
        // 处理代码块
        formatted = formatted.replace(/```js\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
        formatted = formatted.replace(/```javascript\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // 处理行内代码
        formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
        
        // 处理换行
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');
        
        // 包装段落
        if (!formatted.includes('<p>')) {
            formatted = '<p>' + formatted + '</p>';
        }
        
        return formatted;
    }
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 导出为Markdown
    exportToMarkdown() {
        if (!this.currentQuestion) {
            alert('请先加载题目后再导出！');
            return;
        }
        
        const question = this.currentQuestion;
        const timestamp = new Date().toLocaleString('zh-CN');
        
        // 构建Markdown内容
        let markdown = `# JavaScript趣味题 #${question.id}\n\n`;
        markdown += `> 导出时间: ${timestamp}\n\n`;
        
        // 题目部分
        markdown += `## 题目\n\n`;
        markdown += `${question.question}\n\n`;
        
        // 代码部分
        markdown += `## 代码\n\n`;
        markdown += `\`\`\`javascript\n${question.code}\n\`\`\`\n\n`;
        
        // 选项部分
        markdown += `## 选项\n\n`;
        question.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isCorrect = letter === question.answer;
            markdown += `${letter}. ${option}${isCorrect ? ' ✅' : ''}\n`;
        });
        markdown += `\n`;
        
        // 答案部分
        markdown += `## 正确答案\n\n`;
        markdown += `**${question.answer}**\n\n`;
        
        // 解析部分
        markdown += `## 答案解析\n\n`;
        // 清理解析内容中的HTML标签，转换为Markdown格式
        let explanation = question.explanation;
        explanation = explanation.replace(/<br\s*\/?>/gi, '\n');
        explanation = explanation.replace(/<p>/gi, '\n');
        explanation = explanation.replace(/<\/p>/gi, '\n');
        explanation = explanation.replace(/<code[^>]*>/gi, '`');
        explanation = explanation.replace(/<\/code>/gi, '`');
        explanation = explanation.replace(/<pre><code>/gi, '\n```javascript\n');
        explanation = explanation.replace(/<\/code><\/pre>/gi, '\n```\n');
        explanation = explanation.replace(/<[^>]*>/g, ''); // 移除其他HTML标签
        explanation = explanation.replace(/\n\s*\n/g, '\n\n'); // 清理多余空行
        markdown += explanation.trim() + '\n\n';
        
        // 添加页脚
        markdown += `---\n\n`;
        markdown += `*本题目来源于JavaScript趣味题集合*\n`;
        markdown += `*导出工具: JavaScript趣味题网页版*\n`;
        
        // 创建下载
        this.downloadMarkdown(markdown, `JavaScript趣味题_${question.id}_${new Date().getTime()}.md`);
    }
    
    // 下载Markdown文件
    downloadMarkdown(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        // 显示成功提示
        this.showExportSuccess(filename);
    }
    
    // 显示导出成功提示
    showExportSuccess(filename) {
        // 创建临时提示元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                    <div style="font-weight: 600;">导出成功！</div>
                    <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">${filename}</div>
                </div>
            </div>
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        // 3秒后自动消失
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
                if (style.parentNode) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new JSQuizApp();
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // 按R键刷新题目
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn && !document.querySelector('.loading').style.display !== 'none') {
            refreshBtn.click();
        }
    }
    
    // 按数字键1-4选择选项
    if (['1', '2', '3', '4'].includes(e.key)) {
        const options = document.querySelectorAll('.option');
        const index = parseInt(e.key) - 1;
        if (options[index] && !options[index].style.pointerEvents) {
            options[index].click();
        }
    }
    
    // 按Enter键提交答案
    if (e.key === 'Enter') {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
        }
    }
});

// 添加触摸设备支持
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', () => {}, { passive: true });
}

// 添加网络状态监听
if ('navigator' in window && 'onLine' in navigator) {
    window.addEventListener('online', () => {
        console.log('网络连接已恢复');
    });
    
    window.addEventListener('offline', () => {
        console.log('网络连接已断开');
    });
}