// 环境配置文件
// 统一管理所有环境变量配置

// 统一环境配置
const config = {
  API_URL: 'https://infogenie.api.shumengya.top',
  DEBUG: true,
  LOG_LEVEL: 'debug'
};

// 导出配置对象
export const ENV_CONFIG = {
  // API相关配置
  API_URL: config.API_URL,
  
  // 调试相关配置
  DEBUG: config.DEBUG,
  LOG_LEVEL: config.LOG_LEVEL,
  
  // 应用信息
  APP_NAME: 'InfoGenie',
  APP_VERSION: '1.0.0'
};

// 兼容性函数：模拟 process.env 的行为
export const getEnvVar = (key, defaultValue = '') => {
  switch (key) {
    case 'REACT_APP_API_URL':
      return ENV_CONFIG.API_URL;
    default:
      return process.env[key] || defaultValue;
  }
};

// 将配置暴露到window对象上，以便子应用（iframe）可以访问
if (typeof window !== 'undefined') {
  window.ENV_CONFIG = ENV_CONFIG;
}

export default ENV_CONFIG;