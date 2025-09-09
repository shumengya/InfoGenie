// KFC文案生成器主要功能
class KFCGenerator {
    constructor() {
        this.apiEndpoints = [];
        this.currentApiIndex = 0;
        this.isLoading = false;
        
        this.init();
    }
    
    // 初始化
    async init() {
        await this.loadApiEndpoints();
        this.bindEvents();
    }
    
    // 加载API接口列表
    async loadApiEndpoints() {
        try {
            // 直接硬编码API端点，避免CORS问题
            this.apiEndpoints = ["https://60s.api.shumengya.top"];
        } catch (error) {
            console.error('加载API接口列表失败:', error);
            this.showToast('加载接口配置失败', 'error');
        }
    }
    
    // 绑定事件
    bindEvents() {
        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');
        
        generateBtn.addEventListener('click', () => this.generateKFC());
        copyBtn.addEventListener('click', () => this.copyContent());
    }
    
    // 生成KFC文案
    async generateKFC() {
        if (this.isLoading) return;
        
        this.setLoadingState(true);
        
        let success = false;
        let attempts = 0;
        const maxAttempts = this.apiEndpoints.length;
        
        while (!success && attempts < maxAttempts) {
            try {
                const apiUrl = this.apiEndpoints[this.currentApiIndex];
                const data = await this.fetchKFCData(apiUrl);
                
                if (data && data.code === 200 && data.data && data.data.kfc) {
                    this.displayKFC(data.data);
                    success = true;
                } else {
                    throw new Error('API返回数据格式错误');
                }
            } catch (error) {
                console.error(`API ${this.currentApiIndex + 1} 请求失败:`, error);
                this.currentApiIndex = (this.currentApiIndex + 1) % this.apiEndpoints.length;
                attempts++;
            }
        }
        
        if (!success) {
            this.showError('所有API接口都无法访问，请稍后重试');
        }
        
        this.setLoadingState(false);
    }
    
    // 请求KFC数据
    async fetchKFCData(apiUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        try {
            const response = await fetch(`${apiUrl}/v2/kfc`, {
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
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    // 显示KFC文案
    displayKFC(data) {
        const contentElement = document.getElementById('kfcContent');
        const indexElement = document.getElementById('indexNumber');
        const indexInfo = document.getElementById('indexInfo');
        const copyBtn = document.getElementById('copyBtn');
        
        // 显示文案内容
        contentElement.innerHTML = `<p>${this.escapeHtml(data.kfc)}</p>`;
        
        // 显示编号信息
        if (data.index) {
            indexElement.textContent = data.index;
            indexInfo.style.display = 'block';
        } else {
            indexInfo.style.display = 'none';
        }
        
        // 显示复制按钮
        copyBtn.style.display = 'inline-block';
        
        // 添加显示动画
        contentElement.style.opacity = '0';
        contentElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            contentElement.style.transition = 'all 0.5s ease';
            contentElement.style.opacity = '1';
            contentElement.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 显示错误信息
    showError(message) {
        const contentElement = document.getElementById('kfcContent');
        contentElement.innerHTML = `<p class="loading-text" style="color: #e74c3c;">${this.escapeHtml(message)}</p>`;
        
        const copyBtn = document.getElementById('copyBtn');
        const indexInfo = document.getElementById('indexInfo');
        copyBtn.style.display = 'none';
        indexInfo.style.display = 'none';
    }
    
    // 复制文案内容
    async copyContent() {
        const contentElement = document.getElementById('kfcContent');
        const textContent = contentElement.querySelector('p')?.textContent;
        
        if (!textContent || textContent.includes('点击按钮获取') || textContent.includes('失败')) {
            this.showToast('没有可复制的内容', 'error');
            return;
        }
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textContent);
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = textContent;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            this.showToast('文案已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败，请手动选择复制', 'error');
        }
    }
    
    // 设置加载状态
    setLoadingState(loading) {
        this.isLoading = loading;
        const generateBtn = document.getElementById('generateBtn');
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoading = generateBtn.querySelector('.btn-loading');
        
        if (loading) {
            generateBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            generateBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
    
    // 显示提示消息
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const generator = new KFCGenerator();
    // 页面加载完成后自动生成一条文案
    setTimeout(() => {
        generator.generateKFC();
    }, 1000);
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (event) => {
    // 按空格键生成文案
    if (event.code === 'Space' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        document.getElementById('generateBtn').click();
    }
    
    // Ctrl+C 复制文案
    if (event.ctrlKey && event.key === 'c' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn.style.display !== 'none') {
            event.preventDefault();
            copyBtn.click();
        }
    }
});