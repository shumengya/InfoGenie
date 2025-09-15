import axios from 'axios';
import toast from 'react-hot-toast';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://infogenie.api.shumengya.top',
  timeout: 10000,
  withCredentials: true, // 支持携带cookie
  headers: {
    'Content-Type': 'application/json',
  }
});

// 打印当前使用的API URL，便于调试
console.log('🔧 环境变量 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🌐 最终使用的 API Base URL:', process.env.REACT_APP_API_URL || 'https://infogenie.api.shumengya.top');

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加JWT token到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    const message = error.response?.data?.message || '网络错误，请稍后重试';
    
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 发送验证码
  sendVerification: (data) => api.post('/api/auth/send-verification', data),
  
  // 验证验证码
  verifyCode: (data) => api.post('/api/auth/verify-code', data),
  
  // 登录
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // 注册
  register: (userData) => api.post('/api/auth/register', userData),
  
  // 登出
  logout: () => api.post('/api/auth/logout'),
  
  // 检查登录状态
  checkLogin: () => api.get('/api/auth/check'),
};

// 用户相关API
export const userAPI = {
  // 获取用户资料
  getProfile: () => api.get('/api/user/profile'),
  
  // 修改密码
  changePassword: (passwordData) => api.post('/api/user/change-password', passwordData),
  
  // 获取用户统计
  getStats: () => api.get('/api/user/stats'),
  
  // 获取游戏数据
  getGameData: () => api.get('/api/user/game-data'),
  
  // 用户签到
  checkin: () => api.post('/api/user/checkin'),
  
  // 删除账户
  deleteAccount: (password) => api.post('/api/user/delete', { password }),
};



// 健康检查
export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;
