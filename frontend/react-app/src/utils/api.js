import axios from 'axios';
import toast from 'react-hot-toast';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  withCredentials: true, // 支持携带cookie
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
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
      // 未授权，跳转到登录页
      window.location.href = '/login';
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 发送验证码
  sendVerification: (data) => api.post('/auth/send-verification', data),
  
  // 验证验证码
  verifyCode: (data) => api.post('/auth/verify-code', data),
  
  // 登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 登出
  logout: () => api.post('/auth/logout'),
  
  // 检查登录状态
  checkLogin: () => api.get('/auth/check'),
};

// 用户相关API
export const userAPI = {
  // 获取用户资料
  getProfile: () => api.get('/user/profile'),
  
  // 修改密码
  changePassword: (passwordData) => api.post('/user/change-password', passwordData),
  
  // 获取用户统计
  getStats: () => api.get('/user/stats'),
  
  // 删除账户
  deleteAccount: (password) => api.post('/user/delete', { password }),
};

// 60s API相关接口
export const api60s = {
  // 抖音热搜
  getDouyinHot: () => api.get('/60s/douyin'),
  
  // 微博热搜
  getWeiboHot: () => api.get('/60s/weibo'),
  
  // 猫眼票房
  getMaoyanBoxOffice: () => api.get('/60s/maoyan'),
  
  // 60秒读懂世界
  get60sNews: () => api.get('/60s/60s'),
  
  // 必应壁纸
  getBingWallpaper: () => api.get('/60s/bing-wallpaper'),
  
  // 天气信息
  getWeather: (city = '北京') => api.get(`/60s/weather?city=${encodeURIComponent(city)}`),
};

// 健康检查
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
