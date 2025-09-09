// 随机颜色/颜色转换工具 JavaScript

class ColorTool {
    constructor() {
        this.apiUrl = 'https://60s.api.shumengya.top/v2/color';
        this.init();
    }

    init() {
        this.bindEvents();
        this.hideResultSection();
    }

    bindEvents() {
        const randomBtn = document.getElementById('randomBtn');
        const convertBtn = document.getElementById('convertBtn');
        const colorInput = document.getElementById('colorInput');

        randomBtn.addEventListener('click', () => this.getRandomColor());
        convertBtn.addEventListener('click', () => this.convertColor());
        
        // 回车键支持
        colorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.convertColor();
            }
        });
    }

    hideResultSection() {
        const resultSection = document.querySelector('.result-section');
        resultSection.style.display = 'none';
    }

    showResultSection() {
        const resultSection = document.querySelector('.result-section');
        resultSection.style.display = 'block';
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        loading.style.display = 'block';
        error.style.display = 'none';
        this.hideResultSection();
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
    }

    showError(message) {
        const error = document.getElementById('error');
        const errorMessage = document.getElementById('errorMessage');
        const loading = document.getElementById('loading');
        
        loading.style.display = 'none';
        errorMessage.textContent = message;
        error.style.display = 'block';
        this.hideResultSection();
    }

    hideError() {
        const error = document.getElementById('error');
        error.style.display = 'none';
    }

    async getRandomColor() {
        try {
            this.showLoading();
            const encoding = document.getElementById('encodingSelect').value;
            const url = `${this.apiUrl}?encoding=${encoding}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200) {
                this.displayColorData(data.data);
                this.hideLoading();
                this.hideError();
                this.showResultSection();
            } else {
                throw new Error(data.message || '获取颜色信息失败');
            }
        } catch (error) {
            console.error('获取随机颜色失败:', error);
            this.showError(`获取随机颜色失败: ${error.message}`);
        }
    }

    async convertColor() {
        const colorInput = document.getElementById('colorInput');
        const colorValue = colorInput.value.trim();
        
        if (!colorValue) {
            this.showError('请输入要转换的颜色值');
            return;
        }

        // 简单的颜色格式验证
        if (!this.isValidColor(colorValue)) {
            this.showError('请输入有效的颜色值（如 #33AAFF）');
            return;
        }

        try {
            this.showLoading();
            const encoding = document.getElementById('encodingSelect').value;
            const url = `${this.apiUrl}?color=${encodeURIComponent(colorValue)}&encoding=${encoding}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200) {
                this.displayColorData(data.data);
                this.hideLoading();
                this.hideError();
                this.showResultSection();
            } else {
                throw new Error(data.message || '转换颜色失败');
            }
        } catch (error) {
            console.error('转换颜色失败:', error);
            this.showError(`转换颜色失败: ${error.message}`);
        }
    }

    isValidColor(color) {
        // 支持十六进制颜色格式
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        // 支持RGB格式
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        // 支持HSL格式
        const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
        
        return hexPattern.test(color) || rgbPattern.test(color) || hslPattern.test(color);
    }

    displayColorData(data) {
        // 显示主要颜色信息
        this.updateColorDisplay(data);
        
        // 显示各种格式
        this.updateColorFormats(data);
        
        // 显示颜色属性
        this.updateColorProperties(data);
        
        // 显示配色方案
        this.updateColorPalette(data);
        
        // 显示无障碍性信息
        this.updateAccessibilityInfo(data);
    }

    updateColorDisplay(data) {
        const colorDisplay = document.getElementById('colorDisplay');
        const colorName = document.getElementById('colorName');
        const hexValue = document.getElementById('hexValue');
        
        colorDisplay.style.backgroundColor = data.hex;
        colorName.textContent = data.name || '未知颜色';
        hexValue.textContent = data.hex;
    }

    updateColorFormats(data) {
        // RGB
        if (data.rgb) {
            document.getElementById('rgbR').textContent = data.rgb.r;
            document.getElementById('rgbG').textContent = data.rgb.g;
            document.getElementById('rgbB').textContent = data.rgb.b;
            document.getElementById('rgbString').textContent = data.rgb.string;
        }
        
        // HSL
        if (data.hsl) {
            document.getElementById('hslH').textContent = data.hsl.h + '°';
            document.getElementById('hslS').textContent = data.hsl.s + '%';
            document.getElementById('hslL').textContent = data.hsl.l + '%';
            document.getElementById('hslString').textContent = data.hsl.string;
        }
        
        // HSV
        if (data.hsv) {
            document.getElementById('hsvH').textContent = data.hsv.h + '°';
            document.getElementById('hsvS').textContent = data.hsv.s + '%';
            document.getElementById('hsvV').textContent = data.hsv.v + '%';
            document.getElementById('hsvString').textContent = data.hsv.string;
        }
        
        // CMYK
        if (data.cmyk) {
            document.getElementById('cmykC').textContent = data.cmyk.c + '%';
            document.getElementById('cmykM').textContent = data.cmyk.m + '%';
            document.getElementById('cmykY').textContent = data.cmyk.y + '%';
            document.getElementById('cmykK').textContent = data.cmyk.k + '%';
            document.getElementById('cmykString').textContent = data.cmyk.string;
        }
        
        // LAB
        if (data.lab) {
            document.getElementById('labL').textContent = data.lab.l;
            document.getElementById('labA').textContent = data.lab.a;
            document.getElementById('labB').textContent = data.lab.b;
            document.getElementById('labString').textContent = data.lab.string;
        }
    }

    updateColorProperties(data) {
        // 亮度
        if (data.brightness !== undefined) {
            document.getElementById('brightness').textContent = data.brightness.toFixed(2);
        }
        
        // 对比度
        if (data.contrast) {
            document.getElementById('contrastWhite').textContent = data.contrast.white.toFixed(2);
            document.getElementById('contrastBlack').textContent = data.contrast.black.toFixed(2);
        }
        
        // 最佳文字颜色
        if (data.accessibility && data.accessibility.best_text_color) {
            const bestTextColor = document.getElementById('bestTextColor');
            bestTextColor.textContent = data.accessibility.best_text_color;
            bestTextColor.style.color = data.accessibility.best_text_color;
        }
    }

    updateColorPalette(data) {
        // 互补色
        if (data.complementary) {
            const complementary = document.getElementById('complementary');
            const complementaryHex = document.getElementById('complementaryHex');
            complementary.style.backgroundColor = data.complementary;
            complementaryHex.textContent = data.complementary;
        }
        
        // 类似色
        if (data.analogous && data.analogous.length >= 2) {
            const analogous1 = document.getElementById('analogous1');
            const analogous2 = document.getElementById('analogous2');
            const analogous1Hex = document.getElementById('analogous1Hex');
            const analogous2Hex = document.getElementById('analogous2Hex');
            
            analogous1.style.backgroundColor = data.analogous[0];
            analogous2.style.backgroundColor = data.analogous[1];
            analogous1Hex.textContent = data.analogous[0];
            analogous2Hex.textContent = data.analogous[1];
        }
        
        // 三角色
        if (data.triadic && data.triadic.length >= 2) {
            const triadic1 = document.getElementById('triadic1');
            const triadic2 = document.getElementById('triadic2');
            const triadic1Hex = document.getElementById('triadic1Hex');
            const triadic2Hex = document.getElementById('triadic2Hex');
            
            triadic1.style.backgroundColor = data.triadic[0];
            triadic2.style.backgroundColor = data.triadic[1];
            triadic1Hex.textContent = data.triadic[0];
            triadic2Hex.textContent = data.triadic[1];
        }
    }

    updateAccessibilityInfo(data) {
        if (data.accessibility) {
            const aaNormal = document.getElementById('aaNormal');
            const aaLarge = document.getElementById('aaLarge');
            const aaaNormal = document.getElementById('aaaNormal');
            const aaaLarge = document.getElementById('aaaLarge');
            
            this.updateAccessibilityStatus(aaNormal, data.accessibility.aa_normal);
            this.updateAccessibilityStatus(aaLarge, data.accessibility.aa_large);
            this.updateAccessibilityStatus(aaaNormal, data.accessibility.aaa_normal);
            this.updateAccessibilityStatus(aaaLarge, data.accessibility.aaa_large);
        }
    }

    updateAccessibilityStatus(element, status) {
        element.textContent = status ? '通过' : '未通过';
        element.className = 'status ' + (status ? 'pass' : 'fail');
    }

    // 复制颜色值到剪贴板
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('已复制到剪贴板');
            }).catch(err => {
                console.error('复制失败:', err);
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('已复制到剪贴板');
            } else {
                this.showToast('复制失败');
            }
        } catch (err) {
            console.error('复制失败:', err);
            this.showToast('复制失败');
        }
        
        document.body.removeChild(textArea);
    }

    showToast(message) {
        // 创建简单的提示框
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2d5a27;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(toast);
                document.head.removeChild(style);
            }, 300);
        }, 2000);
    }
}

// 添加点击复制功能
function addCopyListeners() {
    const colorTool = window.colorTool;
    
    // 为所有颜色值添加点击复制功能
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // 检查是否点击了颜色值相关元素
        if (target.id === 'hexValue' || 
            target.id === 'rgbString' || 
            target.id === 'hslString' || 
            target.id === 'hsvString' || 
            target.id === 'cmykString' || 
            target.id === 'labString' ||
            target.id === 'complementaryHex' ||
            target.id === 'analogous1Hex' ||
            target.id === 'analogous2Hex' ||
            target.id === 'triadic1Hex' ||
            target.id === 'triadic2Hex') {
            
            const text = target.textContent;
            if (text && colorTool) {
                colorTool.copyToClipboard(text);
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.colorTool = new ColorTool();
    addCopyListeners();
    
    // 添加复制提示
    const style = document.createElement('style');
    style.textContent = `
        #hexValue, #rgbString, #hslString, #hsvString, #cmykString, #labString,
        #complementaryHex, #analogous1Hex, #analogous2Hex, #triadic1Hex, #triadic2Hex {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        #hexValue:hover, #rgbString:hover, #hslString:hover, #hsvString:hover, 
        #cmykString:hover, #labString:hover, #complementaryHex:hover,
        #analogous1Hex:hover, #analogous2Hex:hover, #triadic1Hex:hover, #triadic2Hex:hover {
            background: rgba(45, 90, 39, 0.1);
            border-radius: 4px;
            padding: 2px 4px;
            margin: -2px -4px;
        }
    `;
    document.head.appendChild(style);
});