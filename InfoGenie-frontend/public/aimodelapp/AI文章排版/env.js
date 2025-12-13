// 环境配置文件 - AI文章排版
// 复用 InfoGenie 的全局 ENV_CONFIG

// 本地/独立打开页面的API回退地址（优先使用父窗口ENV_CONFIG）
const DEFAULT_API = (window.ENV_CONFIG && window.ENV_CONFIG.API_URL) || 'http://127.0.0.1:5002';

// API配置
window.API_CONFIG = {
    baseUrl: window.parent?.ENV_CONFIG?.API_URL || DEFAULT_API,
    endpoints: {
        markdownFormatting: '/api/aimodelapp/markdown_formatting'
    }
};

// 认证配置
window.AUTH_CONFIG = {
    tokenKey: 'token',
    getToken: () => localStorage.getItem('token'),
    isAuthenticated: () => !!localStorage.getItem('token')
};

// 应用配置
window.APP_CONFIG = {
    name: 'InfoGenie AI文章排版',
    version: '1.0.0',
    debug: false
};

console.log('AI文章排版 环境配置已加载');