class PasswordGenerator {
    constructor() {
        this.apiUrl = 'https://60s.api.shumengya.top/v2/password';
        this.loadStartTime = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateLengthDisplay();
        this.preloadResources();
    }

    preloadResources() {
        // 预连接API服务器
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://60s.api.shumengya.top';
        document.head.appendChild(link);
    }

    bindEvents() {
        // 长度滑块事件
        const lengthSlider = document.getElementById('length');
        lengthSlider.addEventListener('input', () => this.updateLengthDisplay());

        // 生成按钮事件
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => this.generatePassword());

        // 复制按钮事件
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.addEventListener('click', () => this.copyPassword());

        // 重试按钮事件
        const retryBtn = document.getElementById('retryBtn');
        retryBtn.addEventListener('click', () => this.generatePassword());

        // 复选框变化事件
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateForm());
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.generatePassword();
            }
            if (e.ctrlKey && e.key === 'c' && document.activeElement.id === 'passwordResult') {
                this.copyPassword();
            }
        });
    }

    updateLengthDisplay() {
        const lengthSlider = document.getElementById('length');
        const lengthDisplay = document.getElementById('lengthDisplay');
        lengthDisplay.textContent = lengthSlider.value;
    }

    validateForm() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const generateBtn = document.getElementById('generateBtn');
        
        // 至少需要选择一种字符类型
        const hasCharacterType = Array.from(checkboxes).some(cb => 
            ['numbers', 'uppercase', 'lowercase', 'symbols'].includes(cb.id)
        );
        
        generateBtn.disabled = !hasCharacterType;
        
        if (!hasCharacterType) {
            this.showToast('请至少选择一种字符类型', 'warning');
        }
    }

    async generatePassword() {
        this.loadStartTime = Date.now();
        
        try {
            this.showLoading(true);
            this.hideError();
            
            const params = this.getFormParams();
            const password = await this.callAPI(params);
            
            if (password) {
                this.displayPassword(password, params);
                this.showToast('密码生成成功！', 'success');
                
                const loadTime = Date.now() - this.loadStartTime;
                console.log(`密码生成完成，耗时: ${loadTime}ms`);
            }
        } catch (error) {
            console.error('生成密码失败:', error);
            this.showError(error.message || '生成密码时发生错误，请重试');
        } finally {
            this.showLoading(false);
        }
    }

    getFormParams() {
        const length = document.getElementById('length').value;
        const numbers = document.getElementById('numbers').checked;
        const uppercase = document.getElementById('uppercase').checked;
        const lowercase = document.getElementById('lowercase').checked;
        const symbols = document.getElementById('symbols').checked;
        const excludeSimilar = document.getElementById('excludeSimilar').checked;
        const excludeAmbiguous = document.getElementById('excludeAmbiguous').checked;
        
        return {
            length: parseInt(length),
            numbers: numbers ? 'true' : 'false',
            uppercase: uppercase ? 'true' : 'false',
            lowercase: lowercase ? 'true' : 'false',
            symbols: symbols ? 'true' : 'false',
            exclude_similar: excludeSimilar ? 'true' : 'false',
            exclude_ambiguous: excludeAmbiguous ? 'true' : 'false',
            encoding: 'json'
        };
    }

    async callAPI(params) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const url = new URL(this.apiUrl);
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url.toString(), {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'PasswordGenerator/1.0'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.password) {
                return data.data.password;
            } else {
                throw new Error(data.message || '服务器返回了无效的密码数据');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接后重试');
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('网络连接失败，请检查网络后重试');
            }
            
            throw error;
        }
    }

    displayPassword(password, params) {
        // 显示结果容器
        const resultContainer = document.getElementById('resultContainer');
        const errorContainer = document.getElementById('errorContainer');
        
        resultContainer.style.display = 'block';
        errorContainer.style.display = 'none';
        
        // 设置密码
        const passwordInput = document.getElementById('passwordResult');
        passwordInput.value = password;
        
        // 计算并显示密码信息
        this.updatePasswordInfo(password, params);
        
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updatePasswordInfo(password, params) {
        // 基本信息
        document.getElementById('infoLength').textContent = password.length;
        document.getElementById('infoEntropy').textContent = this.calculateEntropy(password).toFixed(1);
        
        // 密码强度
        const strength = this.calculateStrength(password);
        const strengthElement = document.getElementById('infoStrength');
        strengthElement.textContent = strength.text;
        strengthElement.className = `info-value strength ${strength.class}`;
        
        // 字符类型统计
        const stats = this.analyzeCharacters(password);
        document.getElementById('infoNumbers').textContent = stats.numbers;
        document.getElementById('infoUppercase').textContent = stats.uppercase;
        document.getElementById('infoLowercase').textContent = stats.lowercase;
        document.getElementById('infoSymbols').textContent = stats.symbols;
        
        // 使用的字符集
        this.updateCharacterSets(params);
        
        // 破解时间估算
        document.getElementById('infoCrackTime').textContent = this.estimateCrackTime(password);
    }

    calculateEntropy(password) {
        const charset = this.getCharsetSize(password);
        return Math.log2(Math.pow(charset, password.length));
    }

    getCharsetSize(password) {
        let size = 0;
        if (/[0-9]/.test(password)) size += 10;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[^a-zA-Z0-9]/.test(password)) size += 32;
        return size;
    }

    calculateStrength(password) {
        const entropy = this.calculateEntropy(password);
        
        if (entropy < 30) {
            return { text: '弱', class: 'weak' };
        } else if (entropy < 50) {
            return { text: '中等', class: 'medium' };
        } else if (entropy < 70) {
            return { text: '强', class: 'strong' };
        } else {
            return { text: '非常强', class: 'very-strong' };
        }
    }

    analyzeCharacters(password) {
        return {
            numbers: (password.match(/[0-9]/g) || []).length,
            uppercase: (password.match(/[A-Z]/g) || []).length,
            lowercase: (password.match(/[a-z]/g) || []).length,
            symbols: (password.match(/[^a-zA-Z0-9]/g) || []).length
        };
    }

    updateCharacterSets(params) {
        const setsList = document.getElementById('setsList');
        const sets = [];
        
        if (params.numbers === 'true') sets.push('数字 (0-9)');
        if (params.uppercase === 'true') sets.push('大写字母 (A-Z)');
        if (params.lowercase === 'true') sets.push('小写字母 (a-z)');
        if (params.symbols === 'true') sets.push('特殊字符 (!@#$...)');
        
        setsList.innerHTML = sets.map(set => `<span class="set-item">${set}</span>`).join('');
    }

    estimateCrackTime(password) {
        const charset = this.getCharsetSize(password);
        const combinations = Math.pow(charset, password.length);
        const guessesPerSecond = 1e9; // 假设每秒10亿次尝试
        const secondsToCrack = combinations / (2 * guessesPerSecond);
        
        if (secondsToCrack < 60) {
            return '不到1分钟';
        } else if (secondsToCrack < 3600) {
            return `${Math.ceil(secondsToCrack / 60)}分钟`;
        } else if (secondsToCrack < 86400) {
            return `${Math.ceil(secondsToCrack / 3600)}小时`;
        } else if (secondsToCrack < 31536000) {
            return `${Math.ceil(secondsToCrack / 86400)}天`;
        } else if (secondsToCrack < 31536000000) {
            return `${Math.ceil(secondsToCrack / 31536000)}年`;
        } else {
            return '数千年以上';
        }
    }

    async copyPassword() {
        const passwordInput = document.getElementById('passwordResult');
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(passwordInput.value);
            } else {
                // 降级方案
                passwordInput.select();
                passwordInput.setSelectionRange(0, 99999);
                document.execCommand('copy');
            }
            
            this.showToast('密码已复制到剪贴板！', 'success');
            
            // 复制按钮反馈
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓ 已复制';
            copyBtn.style.background = '#2e7d32';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败，请手动选择密码', 'error');
        }
    }

    showLoading(show) {
        const generateBtn = document.getElementById('generateBtn');
        
        if (show) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⟳</span> 生成中...';
        } else {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '🔐 生成密码';
        }
    }

    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        const resultContainer = document.getElementById('resultContainer');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideError() {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'none';
    }

    showToast(message, type = 'info') {
        // 移除现有的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // 根据类型设置颜色
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        
        toast.style.background = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }
}

// 添加旋转动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // 页面重新可见时，可以进行一些刷新操作
        console.log('页面重新可见');
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    event.preventDefault();
});