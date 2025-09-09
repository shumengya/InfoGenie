// 配色方案生成器 JavaScript
class ColorPaletteGenerator {
    constructor() {
        this.apiUrl = 'https://60s.api.shumengya.top/v2/color/palette';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDefaultPalette();
    }

    bindEvents() {
        const colorInput = document.getElementById('colorInput');
        const colorPicker = document.getElementById('colorPicker');
        const generateBtn = document.getElementById('generateBtn');
        const formatSelect = document.getElementById('formatSelect');

        // 颜色输入框事件
        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                colorPicker.value = color;
            }
        });

        // 颜色选择器事件
        colorPicker.addEventListener('change', (e) => {
            colorInput.value = e.target.value;
        });

        // 生成按钮事件
        generateBtn.addEventListener('click', () => {
            this.generatePalette();
        });

        // 回车键生成
        colorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generatePalette();
            }
        });

        // 格式选择事件
        formatSelect.addEventListener('change', () => {
            const currentColor = colorInput.value;
            if (currentColor && this.isValidColor(currentColor)) {
                this.generatePalette();
            }
        });
    }

    // 验证颜色格式
    isValidColor(color) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }

    // 显示加载状态
    showLoading() {
        const loading = document.getElementById('loading');
        const colorInfo = document.getElementById('colorInfo');
        const palettesContainer = document.getElementById('palettesContainer');
        
        loading.style.display = 'block';
        colorInfo.style.display = 'none';
        palettesContainer.innerHTML = '';
    }

    // 隐藏加载状态
    hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
    }

    // 生成配色方案
    async generatePalette() {
        const colorInput = document.getElementById('colorInput');
        const formatSelect = document.getElementById('formatSelect');
        const color = colorInput.value.trim();
        const format = formatSelect.value;

        if (!color) {
            this.showError('请输入颜色值');
            return;
        }

        if (!this.isValidColor(color)) {
            this.showError('请输入有效的十六进制颜色值（如：#33AAFF）');
            return;
        }

        this.showLoading();

        try {
            const url = new URL(this.apiUrl);
            url.searchParams.append('color', color);
            url.searchParams.append('encoding', format);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.code === 200) {
                this.displayResults(data.data);
            } else {
                throw new Error(data.message || '获取配色方案失败');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('获取配色方案失败，请检查网络连接或稍后重试');
        } finally {
            this.hideLoading();
        }
    }

    // 显示错误信息
    showError(message) {
        const palettesContainer = document.getElementById('palettesContainer');
        palettesContainer.innerHTML = `
            <div class="error-message" style="
                background: rgba(254, 226, 226, 0.9);
                border: 1px solid #feb2b2;
                color: #c53030;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-weight: 500;
            ">
                <p>❌ ${message}</p>
            </div>
        `;
    }

    // 显示结果
    displayResults(data) {
        this.displayColorInfo(data.input);
        this.displayPalettes(data.palettes);
    }

    // 显示颜色信息
    displayColorInfo(inputData) {
        const colorInfo = document.getElementById('colorInfo');
        const colorPreview = document.getElementById('colorPreview');
        const colorDetails = document.getElementById('colorDetails');

        colorPreview.style.backgroundColor = inputData.hex;
        
        colorDetails.innerHTML = `
            <div class="color-detail">
                <strong>HEX</strong>
                <span>${inputData.hex}</span>
            </div>
            <div class="color-detail">
                <strong>RGB</strong>
                <span>rgb(${inputData.rgb.r}, ${inputData.rgb.g}, ${inputData.rgb.b})</span>
            </div>
            <div class="color-detail">
                <strong>HSL</strong>
                <span>hsl(${inputData.hsl.h}°, ${inputData.hsl.s}%, ${inputData.hsl.l}%)</span>
            </div>
            <div class="color-detail">
                <strong>色系</strong>
                <span>${inputData.name}</span>
            </div>
        `;

        colorInfo.style.display = 'block';
    }

    // 显示配色方案
    displayPalettes(palettes) {
        const palettesContainer = document.getElementById('palettesContainer');
        
        palettesContainer.innerHTML = palettes.map(palette => `
            <div class="palette">
                <div class="palette-header">
                    <h3 class="palette-name">${palette.name}</h3>
                    <p class="palette-description">${palette.description}</p>
                </div>
                <div class="colors-grid">
                    ${palette.colors.map(color => `
                        <div class="color-item">
                            <div class="color-swatch" 
                                 style="background-color: ${color.hex}" 
                                 onclick="copyToClipboard('${color.hex}')"
                                 title="点击复制 ${color.hex}">
                            </div>
                            <div class="color-name">${color.name}</div>
                            <div class="color-hex">${color.hex}</div>
                            <div class="color-role">${color.role} • ${color.theory}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // 加载默认配色方案
    async loadDefaultPalette() {
        const colorInput = document.getElementById('colorInput');
        const defaultColor = colorInput.value;
        
        if (defaultColor && this.isValidColor(defaultColor)) {
            await this.generatePalette();
        }
    }
}

// 复制到剪贴板功能
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`已复制 ${text} 到剪贴板`);
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// 备用复制方法
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast(`已复制 ${text} 到剪贴板`);
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    }
    
    document.body.removeChild(textArea);
}

// 显示提示信息
function showToast(message) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(45, 90, 39, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(45, 90, 39, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
    `;

    document.body.appendChild(toast);

    // 动画显示
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // 3秒后隐藏
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteGenerator();
});

// 添加移动端优化
if ('ontouchstart' in window) {
    // 移动端触摸优化
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}