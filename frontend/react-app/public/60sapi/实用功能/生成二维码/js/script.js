// 二维码生成器 JavaScript
class QRCodeGenerator {
    constructor() {
        this.apiEndpoints = [];
        this.currentApiIndex = 0;
        this.init();
    }

    // 初始化
    async init() {
        await this.loadApiEndpoints();
        this.bindEvents();
        this.setupFormValidation();
    }

    // 加载API接口列表
    async loadApiEndpoints() {
        try {
            const response = await fetch('./接口集合.json');
            this.apiEndpoints = await response.json();
            console.log('已加载API接口:', this.apiEndpoints);
        } catch (error) {
            console.error('加载API接口失败:', error);
            this.showError('加载配置失败，请刷新页面重试');
        }
    }

    // 绑定事件
    bindEvents() {
        const form = document.getElementById('qrForm');
        const retryBtn = document.querySelector('.retry-btn');
        const downloadBtn = document.querySelector('.download-btn');
        const copyBtn = document.querySelector('.copy-btn');
        const newBtn = document.querySelector('.new-btn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        retryBtn.addEventListener('click', () => this.retryGeneration());
        downloadBtn.addEventListener('click', () => this.downloadQRCode());
        copyBtn.addEventListener('click', () => this.copyImageLink());
        newBtn.addEventListener('click', () => this.resetForm());

        // 实时字符计数
        const textArea = document.getElementById('text');
        textArea.addEventListener('input', () => this.updateCharCount());
    }

    // 设置表单验证
    setupFormValidation() {
        const textArea = document.getElementById('text');
        const form = document.getElementById('qrForm');

        textArea.addEventListener('blur', () => {
            if (textArea.value.trim() === '') {
                this.showFieldError(textArea, '请输入要生成二维码的内容');
            } else {
                this.clearFieldError(textArea);
            }
        });
    }

    // 显示字段错误
    showFieldError(field, message) {
        this.clearFieldError(field);
        field.style.borderColor = '#d32f2f';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#d32f2f';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // 清除字段错误
    clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // 更新字符计数
    updateCharCount() {
        const textArea = document.getElementById('text');
        const text = textArea.value;
        const length = text.length;
        
        // 移除旧的计数显示
        const oldCounter = textArea.parentNode.querySelector('.char-counter');
        if (oldCounter) oldCounter.remove();
        
        // 添加新的计数显示
        if (length > 0) {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.fontSize = '0.8rem';
            counter.style.color = '#666';
            counter.style.textAlign = 'right';
            counter.style.marginTop = '5px';
            counter.textContent = `${length} 个字符`;
            textArea.parentNode.appendChild(counter);
        }
    }

    // 处理表单提交
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const params = {
            text: formData.get('text').trim(),
            size: formData.get('size'),
            level: formData.get('level'),
            encoding: formData.get('encoding')
        };

        // 验证输入
        if (!params.text) {
            this.showFieldError(document.getElementById('text'), '请输入要生成二维码的内容');
            return;
        }

        this.showLoading();
        await this.generateQRCode(params);
    }

    // 生成二维码
    async generateQRCode(params) {
        let success = false;
        let lastError = null;

        // 尝试所有API接口
        for (let i = 0; i < this.apiEndpoints.length; i++) {
            const apiIndex = (this.currentApiIndex + i) % this.apiEndpoints.length;
            const apiUrl = this.apiEndpoints[apiIndex];
            
            try {
                console.log(`尝试API ${apiIndex + 1}:`, apiUrl);
                const result = await this.callAPI(apiUrl, params);
                
                if (result.success) {
                    this.currentApiIndex = apiIndex; // 记录成功的API
                    this.showResult(result.data, params);
                    success = true;
                    break;
                }
            } catch (error) {
                console.warn(`API ${apiIndex + 1} 失败:`, error);
                lastError = error;
            }
        }

        if (!success) {
            this.showError(lastError?.message || '所有API接口都无法访问，请稍后重试');
        }
    }

    // 调用API
    async callAPI(baseUrl, params) {
        const url = new URL('/v2/qrcode', baseUrl);
        
        // 添加查询参数
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.append(key, value);
            }
        });

        console.log('请求URL:', url.toString());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json, image/*'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // 根据返回格式处理
            if (params.encoding === 'image') {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                return {
                    success: true,
                    data: {
                        imageUrl: imageUrl,
                        text: params.text,
                        size: params.size,
                        level: params.level,
                        format: 'image'
                    }
                };
            } else {
                const jsonData = await response.json();
                if (jsonData.code === 0 && jsonData.data) {
                    return {
                        success: true,
                        data: {
                            imageUrl: jsonData.data.data_uri,
                            text: params.text,
                            size: params.size,
                            level: params.level,
                            format: 'json',
                            base64: jsonData.data.base64,
                            mimeType: jsonData.data.mime_type
                        }
                    };
                } else {
                    throw new Error(jsonData.message || '生成失败');
                }
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请重试');
            }
            throw error;
        }
    }

    // 显示加载状态
    showLoading() {
        this.hideAllStates();
        document.getElementById('loading').classList.remove('hidden');
        
        const btn = document.querySelector('.generate-btn');
        btn.classList.add('loading');
        btn.disabled = true;
    }

    // 显示错误
    showError(message) {
        this.hideAllStates();
        const errorDiv = document.getElementById('error');
        const errorMessage = errorDiv.querySelector('.error-message');
        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
        
        this.resetButton();
    }

    // 显示结果
    showResult(data, params) {
        this.hideAllStates();
        
        const resultDiv = document.getElementById('result');
        const qrImage = document.getElementById('qrImage');
        const resultText = document.querySelector('.result-text');
        
        qrImage.src = data.imageUrl;
        qrImage.alt = `二维码: ${data.text}`;
        
        resultText.innerHTML = `
            <strong>内容:</strong> ${this.escapeHtml(data.text)}<br>
            <strong>尺寸:</strong> ${data.size}x${data.size}<br>
            <strong>容错级别:</strong> ${data.level}<br>
            <strong>格式:</strong> ${data.format.toUpperCase()}
        `;
        
        resultDiv.classList.remove('hidden');
        this.resetButton();
        
        // 保存数据供下载使用
        this.currentQRData = data;
    }

    // 隐藏所有状态
    hideAllStates() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
        document.getElementById('result').classList.add('hidden');
    }

    // 重置按钮状态
    resetButton() {
        const btn = document.querySelector('.generate-btn');
        btn.classList.remove('loading');
        btn.disabled = false;
    }

    // 重试生成
    async retryGeneration() {
        const form = document.getElementById('qrForm');
        const formData = new FormData(form);
        const params = {
            text: formData.get('text').trim(),
            size: formData.get('size'),
            level: formData.get('level'),
            encoding: formData.get('encoding')
        };
        
        this.showLoading();
        await this.generateQRCode(params);
    }

    // 下载二维码
    downloadQRCode() {
        if (!this.currentQRData) return;
        
        const link = document.createElement('a');
        link.href = this.currentQRData.imageUrl;
        link.download = `qrcode_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('二维码已下载');
    }

    // 复制图片链接
    async copyImageLink() {
        if (!this.currentQRData) return;
        
        try {
            await navigator.clipboard.writeText(this.currentQRData.imageUrl);
            this.showToast('链接已复制到剪贴板');
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败，请手动复制');
        }
    }

    // 重置表单
    resetForm() {
        document.getElementById('qrForm').reset();
        this.hideAllStates();
        this.currentQRData = null;
        
        // 清除字符计数
        const counter = document.querySelector('.char-counter');
        if (counter) counter.remove();
        
        // 清除字段错误
        document.querySelectorAll('input, textarea, select').forEach(field => {
            this.clearFieldError(field);
        });
        
        // 聚焦到文本框
        document.getElementById('text').focus();
    }

    // 显示提示消息
    showToast(message) {
        // 移除旧的toast
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
});