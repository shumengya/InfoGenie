/**
 * 密码强度检测器
 * 提供密码强度分析和安全建议
 */
class PasswordStrengthChecker {
    constructor() {
        this.apiUrl = 'https://60s.api.shumengya.top/v2/password/check';
        this.isChecking = false;
        this.currentPassword = '';
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.hideResultContainer();
        this.hideErrorContainer();
        console.log('密码强度检测器初始化完成');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 密码输入框事件
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.addEventListener('input', this.handlePasswordInput.bind(this));
            passwordInput.addEventListener('keypress', this.handleKeyPress.bind(this));
        }

        // 显示/隐藏密码按钮
        const toggleBtn = document.getElementById('toggleVisibility');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.togglePasswordVisibility.bind(this));
        }

        // 检测按钮
        const checkBtn = document.getElementById('checkBtn');
        if (checkBtn) {
            checkBtn.addEventListener('click', this.handleCheckPassword.bind(this));
        }

        // 重试按钮
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', this.handleRetry.bind(this));
        }
    }

    /**
     * 设置表单验证
     */
    setupFormValidation() {
        const form = document.querySelector('.input-container');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCheckPassword();
            });
        }
    }

    /**
     * 处理密码输入
     */
    handlePasswordInput(event) {
        const password = event.target.value;
        this.currentPassword = password;
        
        // 更新按钮状态
        this.updateCheckButtonState();
        
        // 如果密码为空，隐藏结果
        if (!password.trim()) {
            this.hideResultContainer();
            this.hideErrorContainer();
        }
    }

    /**
     * 处理键盘事件
     */
    handleKeyPress(event) {
        if (event.key === 'Enter' && !this.isChecking) {
            event.preventDefault();
            this.handleCheckPassword();
        }
    }

    /**
     * 切换密码可见性
     */
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('passwordInput');
        const toggleBtn = document.getElementById('toggleVisibility');
        
        if (passwordInput && toggleBtn) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword ? '🙈' : '👁️';
            toggleBtn.title = isPassword ? '隐藏密码' : '显示密码';
        }
    }

    /**
     * 更新检测按钮状态
     */
    updateCheckButtonState() {
        const checkBtn = document.getElementById('checkBtn');
        const hasPassword = this.currentPassword.trim().length > 0;
        
        if (checkBtn) {
            checkBtn.disabled = !hasPassword || this.isChecking;
            
            if (this.isChecking) {
                checkBtn.innerHTML = '<span class="btn-icon">⏳</span>检测中...';
            } else if (hasPassword) {
                checkBtn.innerHTML = '<span class="btn-icon">🔍</span>检测密码强度';
            } else {
                checkBtn.innerHTML = '<span class="btn-icon">🔍</span>请输入密码';
            }
        }
    }

    /**
     * 处理密码检测
     */
    async handleCheckPassword() {
        const password = this.currentPassword.trim();
        
        if (!password) {
            this.showToast('请输入要检测的密码', 'error');
            return;
        }

        if (this.isChecking) {
            return;
        }

        try {
            this.setLoadingState(true);
            this.hideErrorContainer();
            
            const result = await this.checkPasswordStrength(password);
            
            if (result.code === 200 && result.data) {
                this.displayResults(result.data);
                this.showResultContainer();
                this.showToast('密码强度检测完成', 'success');
            } else {
                throw new Error(result.message || '检测失败');
            }
        } catch (error) {
            console.error('密码检测错误:', error);
            this.showError(error.message || '检测服务暂时不可用，请稍后重试');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * 调用API检测密码强度
     */
    async checkPasswordStrength(password) {
        const url = new URL(this.apiUrl);
        url.searchParams.append('password', password);
        url.searchParams.append('encoding', 'utf-8');

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * 显示检测结果
     */
    displayResults(data) {
        this.updateStrengthOverview(data);
        this.updateDetailedInfo(data);
        this.updateRecommendations(data);
    }

    /**
     * 更新强度概览
     */
    updateStrengthOverview(data) {
        // 更新分数圆圈
        const scoreCircle = document.getElementById('scoreCircle');
        const scoreValue = document.getElementById('scoreValue');
        const strengthLevel = document.getElementById('strengthLevel');
        const strengthDescription = document.getElementById('strengthDescription');
        const barFill = document.getElementById('strengthBar');

        if (scoreValue) {
            scoreValue.textContent = data.score || 0;
        }

        if (strengthLevel) {
            strengthLevel.textContent = this.getStrengthText(data.strength);
            const strengthClass = this.getStrengthClass(data.strength);
            strengthLevel.className = `strength-level strength-${strengthClass}`;
        }

        if (strengthDescription) {
            strengthDescription.textContent = this.getStrengthDescription(data.strength);
        }

        // 更新分数圆圈
        if (scoreCircle) {
            const percentage = (data.score / 100) * 360;
            scoreCircle.style.setProperty('--score-deg', `${percentage}deg`);
            // 将中文强度转换为CSS类名
            const strengthClass = this.getStrengthClass(data.strength);
            scoreCircle.className = `score-circle score-${strengthClass}`;
        }

        // 更新强度条
        if (barFill) {
            setTimeout(() => {
                barFill.style.width = `${data.score}%`;
            }, 100);
        }
    }

    /**
     * 更新详细信息
     */
    updateDetailedInfo(data) {
        // 基本信息
        this.updateElement('passwordLength', data.length || 0);
        this.updateElement('entropyValue', data.entropy ? data.entropy.toFixed(2) : '0.00');
        this.updateElement('crackTime', data.time_to_crack || '未知');

        // 字符类型分析
        this.updateCharacterAnalysis(data.character_analysis || {});
    }

    /**
     * 更新字符类型分析
     */
    updateCharacterAnalysis(analysis) {
        const types = {
            'has_lowercase': { element: 'hasLowercase', label: '小写字母', icon: '🔤' },
            'has_uppercase': { element: 'hasUppercase', label: '大写字母', icon: '🔠' },
            'has_numbers': { element: 'hasNumbers', label: '数字', icon: '🔢' },
            'has_symbols': { element: 'hasSymbols', label: '特殊符号', icon: '🔣' }
        };

        Object.keys(types).forEach(key => {
            const element = document.getElementById(types[key].element);
            if (element) {
                const hasType = analysis[key] || false;
                element.className = `char-type ${hasType ? 'has-type' : ''}`;
                element.innerHTML = `
                    <span class="type-icon">${hasType ? '✅' : '❌'}</span>
                    <span>${types[key].label}</span>
                `;
            }
        });

        // 更新字符种类数量
        this.updateElement('characterVariety', analysis.character_variety || 0);

        // 更新问题提示
        this.updateCharacterIssues(analysis);
    }

    /**
     * 更新字符问题提示
     */
    updateCharacterIssues(analysis) {
        const issues = [
            { id: 'hasRepeated', condition: analysis.has_repeated, text: '包含重复字符' },
            { id: 'hasSequential', condition: analysis.has_sequential, text: '包含连续字符' }
        ];

        issues.forEach(issue => {
            const element = document.getElementById(issue.id);
            if (element) {
                if (issue.condition) {
                    element.style.display = 'flex';
                    element.innerHTML = `
                        <span class="issue-icon">⚠️</span>
                        <span class="issue-text">${issue.text}</span>
                    `;
                } else {
                    element.style.display = 'none';
                }
            }
        });
    }

    /**
     * 更新建议和提示
     */
    updateRecommendations(data) {
        // 更新建议列表
        const recommendationsList = document.getElementById('recommendationsList');
        if (recommendationsList && data.recommendations) {
            recommendationsList.innerHTML = '';
            data.recommendations.forEach(recommendation => {
                const li = document.createElement('li');
                li.textContent = recommendation;
                recommendationsList.appendChild(li);
            });
        }

        // 更新安全提示
        const tipsContainer = document.getElementById('securityTips');
        if (tipsContainer && data.security_tips) {
            tipsContainer.innerHTML = '';
            data.security_tips.forEach((tip, index) => {
                const tipElement = document.createElement('div');
                tipElement.className = 'tip-item';
                tipElement.innerHTML = `
                    <span class="tip-icon">${this.getTipIcon(index)}</span>
                    <span class="tip-text">${tip}</span>
                `;
                tipsContainer.appendChild(tipElement);
            });
        }
    }

    /**
     * 获取提示图标
     */
    getTipIcon(index) {
        const icons = ['🛡️', '🔐', '⚡', '🎯', '💡', '🔄'];
        return icons[index % icons.length];
    }

    /**
     * 获取强度文本
     */
    getStrengthText(strength) {
        // API直接返回中文强度，无需映射
        return strength || '未知';
    }

    /**
     * 获取强度CSS类名
     */
    getStrengthClass(strength) {
        const classMap = {
            '弱': 'weak',
            '中等': 'medium', 
            '强': 'strong',
            '非常强': 'very-strong'
        };
        return classMap[strength] || 'unknown';
    }

    /**
     * 获取强度描述
     */
    getStrengthDescription(strength) {
        const descriptions = {
            '弱': '密码强度较弱，建议增加复杂度',
            '中等': '密码强度中等，可以进一步优化', 
            '强': '密码强度良好，安全性较高',
            '非常强': '密码强度非常好，安全性很高'
        };
        return descriptions[strength] || '无法评估密码强度';
    }

    /**
     * 设置加载状态
     */
    setLoadingState(loading) {
        this.isChecking = loading;
        this.updateCheckButtonState();
        
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.disabled = loading;
        }
    }

    /**
     * 显示结果容器
     */
    showResultContainer() {
        const container = document.getElementById('resultContainer');
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 隐藏结果容器
     */
    hideResultContainer() {
        const container = document.getElementById('resultContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * 显示错误
     */
    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.style.display = 'block';
            this.hideResultContainer();
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 隐藏错误容器
     */
    hideErrorContainer() {
        const container = document.getElementById('errorContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * 处理重试
     */
    handleRetry() {
        this.hideErrorContainer();
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.focus();
        }
    }

    /**
     * 更新元素内容
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * 显示提示消息
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast toast-${type}`;
            toast.style.display = 'block';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.passwordChecker = new PasswordStrengthChecker();
        console.log('密码强度检测器已启动');
    } catch (error) {
        console.error('初始化失败:', error);
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.passwordChecker) {
        console.log('页面重新激活');
    }
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    if (window.passwordChecker) {
        window.passwordChecker.showToast('发生了意外错误，请刷新页面重试', 'error');
    }
});

// 网络状态监听
window.addEventListener('online', () => {
    if (window.passwordChecker) {
        window.passwordChecker.showToast('网络连接已恢复', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.passwordChecker) {
        window.passwordChecker.showToast('网络连接已断开', 'error');
    }
});