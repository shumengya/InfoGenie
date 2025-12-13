// 环境配置文件 - AI中国亲戚称呼计算器
// 复用 InfoGenie 的全局 ENV_CONFIG，支持独立打开的回退地址

const DEFAULT_API = (window.ENV_CONFIG && window.ENV_CONFIG.API_URL) || 'http://127.0.0.1:5002';

window.API_CONFIG = {
  baseUrl: window.parent?.ENV_CONFIG?.API_URL || DEFAULT_API,
  endpoints: {
    kinshipCalculator: '/api/aimodelapp/kinship-calculator'
  }
};

window.AUTH_CONFIG = {
  tokenKey: 'token',
  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token')
};

window.APP_CONFIG = {
  name: 'InfoGenie 中国亲戚称呼计算器',
  version: '1.0.0',
  debug: false
};

console.log('中国亲戚称呼计算器 环境配置已加载');