// 身体健康分析 JavaScript 功能

// DOM 元素获取
const healthForm = document.getElementById('healthForm');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = analyzeBtn.querySelector('.btn-text');
const loadingSpinner = analyzeBtn.querySelector('.loading-spinner');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const resetBtn = document.getElementById('resetBtn');
const retryBtn = document.getElementById('retryBtn');

// API 配置
const API_BASE_URL = 'https://60s.api.shumengya.top/v2/health';

// 表单验证规则
const validationRules = {
    height: {
        min: 100,
        max: 250,
        message: '身高应在100-250cm之间'
    },
    weight: {
        min: 30,
        max: 200,
        message: '体重应在30-200kg之间'
    },
    age: {
        min: 1,
        max: 120,
        message: '年龄应在1-120岁之间'
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupFormValidation();
});

// 事件监听器初始化
function initializeEventListeners() {
    healthForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);
    retryBtn.addEventListener('click', retryAnalysis);
    
    // 输入框实时验证
    const inputs = healthForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// 表单验证设置
function setupFormValidation() {
    const inputs = healthForm.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // 移除非数字字符
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // 防止多个小数点
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
        });
    });
}

// 表单提交处理
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = getFormData();
    
    try {
        setLoadingState(true);
        hideAllSections();
        
        const result = await callHealthAPI(formData);
        displayResults(result);
        
    } catch (error) {
        console.error('分析失败:', error);
        displayError(error.message || '分析失败，请稍后重试');
    } finally {
        setLoadingState(false);
    }
}

// 获取表单数据
function getFormData() {
    return {
        height: parseInt(document.getElementById('height').value),
        weight: parseInt(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value
    };
}

// 表单验证
function validateForm() {
    let isValid = true;
    const inputs = healthForm.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// 单个字段验证
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    // 清除之前的错误状态
    clearFieldError(event);
    
    // 必填验证
    if (!value) {
        showFieldError(field, '此字段为必填项');
        return false;
    }
    
    // 数值范围验证
    if (validationRules[fieldName]) {
        const numValue = parseFloat(value);
        const rule = validationRules[fieldName];
        
        if (numValue < rule.min || numValue > rule.max) {
            showFieldError(field, rule.message);
            return false;
        }
    }
    
    return true;
}

// 显示字段错误
function showFieldError(field, message) {
    field.classList.add('error');
    
    // 移除已存在的错误消息
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 添加错误消息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorDiv);
}

// 清除字段错误
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// 调用健康分析API
async function callHealthAPI(data) {
    const params = new URLSearchParams({
        height: data.height,
        weight: data.weight,
        age: data.age,
        gender: data.gender
    });
    
    const response = await fetch(`${API_BASE_URL}?${params}`);
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.code !== 200) {
        throw new Error(result.message || '分析失败');
    }
    
    return result.data;
}

// 显示分析结果
function displayResults(data) {
    // 基本信息
    displayBasicInfo(data.basic_info);
    
    // BMI 分析
    displayBMIInfo(data.bmi);
    
    // 体重评估
    displayWeightAssessment(data.weight_assessment);
    
    // 代谢分析
    displayMetabolism(data.metabolism);
    
    // 体脂分析
    displayBodyFat(data.body_fat);
    
    // 理想三围
    displayMeasurements(data.ideal_measurements);
    
    // 健康建议
    displayHealthAdvice(data.health_advice);
    
    // 免责声明
    displayDisclaimer(data.disclaimer);
    
    // 显示结果区域
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 显示基本信息
function displayBasicInfo(basicInfo) {
    const container = document.getElementById('basicInfo');
    container.innerHTML = '';
    
    const infoItems = [
        { label: basicInfo.height_desc, value: basicInfo.height },
        { label: basicInfo.weight_desc, value: basicInfo.weight },
        { label: basicInfo.age_desc, value: basicInfo.age },
        { label: basicInfo.gender_desc, value: basicInfo.gender }
    ];
    
    infoItems.forEach(item => {
        const itemDiv = createInfoItem(item.label, item.value);
        container.appendChild(itemDiv);
    });
}

// 显示BMI信息
function displayBMIInfo(bmiData) {
    const container = document.getElementById('bmiContent');
    container.innerHTML = `
        <div class="bmi-value">${bmiData.value}</div>
        <div class="bmi-category">${bmiData.category}</div>
        <div class="info-grid">
            ${createInfoItem(bmiData.evaluation_desc, bmiData.evaluation).outerHTML}
            ${createInfoItem(bmiData.risk_desc, bmiData.risk).outerHTML}
        </div>
    `;
}

// 显示体重评估
function displayWeightAssessment(weightData) {
    const container = document.getElementById('weightContent');
    container.innerHTML = '';
    
    const items = [
        { label: weightData.ideal_weight_range_desc, value: weightData.ideal_weight_range },
        { label: weightData.standard_weight_desc, value: weightData.standard_weight },
        { label: weightData.status_desc, value: weightData.status },
        { label: weightData.adjustment_desc, value: weightData.adjustment }
    ];
    
    const grid = document.createElement('div');
    grid.className = 'info-grid';
    
    items.forEach(item => {
        const itemDiv = createInfoItem(item.label, item.value);
        grid.appendChild(itemDiv);
    });
    
    container.appendChild(grid);
}

// 显示代谢分析
function displayMetabolism(metabolismData) {
    const container = document.getElementById('metabolismContent');
    container.innerHTML = '';
    
    const items = [
        { label: metabolismData.bmr_desc, value: metabolismData.bmr },
        { label: metabolismData.tdee_desc, value: metabolismData.tdee },
        { label: metabolismData.recommended_calories_desc, value: metabolismData.recommended_calories },
        { label: metabolismData.weight_loss_calories_desc, value: metabolismData.weight_loss_calories },
        { label: metabolismData.weight_gain_calories_desc, value: metabolismData.weight_gain_calories }
    ];
    
    const grid = document.createElement('div');
    grid.className = 'info-grid';
    
    items.forEach(item => {
        const itemDiv = createInfoItem(item.label, item.value);
        grid.appendChild(itemDiv);
    });
    
    container.appendChild(grid);
}

// 显示体脂分析
function displayBodyFat(bodyFatData) {
    const container = document.getElementById('bodyFatContent');
    container.innerHTML = '';
    
    const items = [
        { label: bodyFatData.percentage_desc, value: bodyFatData.percentage },
        { label: bodyFatData.category_desc, value: bodyFatData.category },
        { label: bodyFatData.fat_weight_desc, value: bodyFatData.fat_weight },
        { label: bodyFatData.lean_weight_desc, value: bodyFatData.lean_weight }
    ];
    
    const grid = document.createElement('div');
    grid.className = 'info-grid';
    
    items.forEach(item => {
        const itemDiv = createInfoItem(item.label, item.value);
        grid.appendChild(itemDiv);
    });
    
    container.appendChild(grid);
}

// 显示理想三围
function displayMeasurements(measurementsData) {
    const container = document.getElementById('measurementsContent');
    container.innerHTML = '';
    
    const items = [
        { label: measurementsData.chest_desc, value: measurementsData.chest },
        { label: measurementsData.waist_desc, value: measurementsData.waist },
        { label: measurementsData.hip_desc, value: measurementsData.hip }
    ];
    
    const grid = document.createElement('div');
    grid.className = 'info-grid';
    
    items.forEach(item => {
        const itemDiv = createInfoItem(item.label, item.value);
        grid.appendChild(itemDiv);
    });
    
    // 添加说明
    const note = document.createElement('p');
    note.style.marginTop = '15px';
    note.style.fontSize = '0.9rem';
    note.style.color = '#4a7c59';
    note.style.textAlign = 'center';
    note.textContent = measurementsData.note;
    
    container.appendChild(grid);
    container.appendChild(note);
}

// 显示健康建议
function displayHealthAdvice(adviceData) {
    const container = document.getElementById('adviceContent');
    container.innerHTML = '';
    
    // 饮水量建议
    const waterDiv = createAdviceSection(adviceData.daily_water_intake_desc, adviceData.daily_water_intake);
    container.appendChild(waterDiv);
    
    // 运动建议
    const exerciseDiv = createAdviceSection(adviceData.exercise_recommendation_desc, adviceData.exercise_recommendation);
    container.appendChild(exerciseDiv);
    
    // 营养建议
    const nutritionDiv = createAdviceSection(adviceData.nutrition_advice_desc, adviceData.nutrition_advice);
    container.appendChild(nutritionDiv);
    
    // 健康提示
    const tipsDiv = document.createElement('div');
    tipsDiv.innerHTML = `
        <h4 style="color: #2d5a3d; margin-bottom: 10px;">${adviceData.health_tips_desc}</h4>
        <ul class="health-tips"></ul>
    `;
    
    const tipsList = tipsDiv.querySelector('.health-tips');
    adviceData.health_tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
    
    container.appendChild(tipsDiv);
}

// 创建建议区块
function createAdviceSection(title, content) {
    const div = document.createElement('div');
    div.style.marginBottom = '20px';
    div.innerHTML = `
        <h4 style="color: #2d5a3d; margin-bottom: 8px;">${title}</h4>
        <p style="background: #f8fff8; padding: 12px; border-radius: 8px; border-left: 4px solid #4caf50; line-height: 1.6;">${content}</p>
    `;
    return div;
}

// 显示免责声明
function displayDisclaimer(disclaimer) {
    const container = document.getElementById('disclaimer');
    container.textContent = disclaimer;
}

// 创建信息项
function createInfoItem(label, value) {
    const div = document.createElement('div');
    div.className = 'info-item';
    div.innerHTML = `
        <div class="info-label">${label}</div>
        <div class="info-value">${value}</div>
    `;
    return div;
}

// 显示错误信息
function displayError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

// 设置加载状态
function setLoadingState(isLoading) {
    if (isLoading) {
        analyzeBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        analyzeBtn.disabled = false;
        btnText.style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
}

// 隐藏所有结果区域
function hideAllSections() {
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// 重置表单
function resetForm() {
    healthForm.reset();
    hideAllSections();
    
    // 清除所有错误状态
    const errorInputs = healthForm.querySelectorAll('.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
    
    const errorMessages = healthForm.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // 滚动到表单顶部
    healthForm.scrollIntoView({ behavior: 'smooth' });
}

// 重试分析
function retryAnalysis() {
    hideAllSections();
    healthForm.scrollIntoView({ behavior: 'smooth' });
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 添加CSS样式到错误输入框
const style = document.createElement('style');
style.textContent = `
    .form-input.error,
    .form-select.error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
    }
`;
document.head.appendChild(style);

// 页面可见性变化处理（用户切换标签页时暂停动画等）
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时的处理
        document.body.style.animationPlayState = 'paused';
    } else {
        // 页面显示时的处理
        document.body.style.animationPlayState = 'running';
    }
});