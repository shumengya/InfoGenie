import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // 从localStorage恢复用户信息
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 从localStorage恢复登录状态和token
    return localStorage.getItem('token') !== null;
  });

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoggedIn(false);
        return;
      }
      
      const response = await authAPI.checkLogin();
      if (response.data.success && response.data.logged_in) {
        const userData = response.data.user;
        setUser(userData);
        setIsLoggedIn(true);
        // 保存到localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        setIsLoggedIn(false);
        // 清除localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      setUser(null);
      setIsLoggedIn(false);
      // 清除localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (loginData) => {
    try {
      const response = await authAPI.login(loginData);
      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        setUser(userData);
        setIsLoggedIn(true);
        // 保存到localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        toast.success('登录成功！');
        return { success: true };
      } else {
        toast.error(response.data.message || '登录失败');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('登录失败:', error);
      const message = error.response?.data?.message || '登录失败，请重试';
      toast.error(message);
      return { success: false, message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsLoggedIn(false);
      // 清除localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('已成功登出');
    } catch (error) {
      console.error('登出失败:', error);
      // 即使登出请求失败，也清除本地状态
      setUser(null);
      setIsLoggedIn(false);
      // 清除localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      toast.error('登出失败');
    }
  };

  // 获取QQ头像URL
  const getQQAvatar = (email) => {
    if (!email) return null;
    
    const qqDomains = ['qq.com', 'vip.qq.com', 'foxmail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (qqDomains.includes(domain)) {
      const qqNumber = email.split('@')[0];
      if (/^\d+$/.test(qqNumber)) {
        return `http://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`;
      }
    }
    
    return null;
  };

  // 组件挂载时检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const value = {
    user,
    isLoading,
    isLoggedIn,
    login,
    logout,
    checkLoginStatus,
    getQQAvatar
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;