// 环境配置文件
// 此文件定义了AI应用的基本配置

// API配置
window.API_CONFIG = {
    baseUrl: 'http://127.0.0.1:5002',
    endpoints: {
        classicalConversion: '/api/aimodelapp/classical_conversion'
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
    name: 'InfoGenie AI工具',
    version: '1.0.0',
    debug: false
};

console.log('环境配置已加载');