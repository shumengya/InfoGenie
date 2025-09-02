import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMail, FiUser, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const LoginContainer = styled.div`
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(168, 230, 207, 0.3);
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(168, 230, 207, 0.3);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #2e7d32;
  font-size: 28px;
  font-weight: 700;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  background: #f1f8e9;
  border-radius: 12px;
  padding: 4px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: ${props => props.active ? '#81c784' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#81c784' : '#e8f5e8'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 20px 15px 50px;
  border: 2px solid #e8f5e8;
  border-radius: 14px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafffe;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #81c784;
    background: white;
    box-shadow: 0 0 0 3px rgba(129, 199, 132, 0.1);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #81c784;
  font-size: 18px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    color: #66bb6a;
  }
`;

const VerificationGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: start;
`;

const VerificationInput = styled(Input)`
  flex: 1;
  padding-right: 15px;
`;

const SendCodeButton = styled.button`
  padding: 15px 20px;
  background: ${props => props.disabled ? '#e8f5e8' : 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)'};
  color: ${props => props.disabled ? '#adb5bd' : 'white'};
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 8px 25px rgba(129, 199, 132, 0.3)'};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  box-shadow: 0 4px 20px rgba(129, 199, 132, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(129, 199, 132, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e57373;
  font-size: 14px;
  margin-top: 5px;
`;

const QQHint = styled.div`
  background: #e8f5e8;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvatarPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid #81c784;
    object-fit: cover;
  }
`;

const LoginMethod = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 14px;
  color: #666;
  
  input[type="radio"] {
    margin: 0;
    margin-right: 8px;
  }
  
  label {
    cursor: pointer;
  }
`;

const LoginPage = () => {
  const { login, getQQAvatar } = useUser();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'code'
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    code: ''
  });
  const [errors, setErrors] = useState({});
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();

  // 倒计时效果
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // 预览QQ头像
    if (name === 'email' && isQQEmail(value)) {
      const avatar = getQQAvatar(value);
      setAvatarUrl(avatar || '');
    }
  };

  const isQQEmail = (email) => {
    const qqDomains = ['qq.com', 'vip.qq.com', 'foxmail.com'];
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return qqDomains.includes(domain);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱地址不能为空';
    } else if (!isQQEmail(formData.email)) {
      newErrors.email = '仅支持QQ邮箱（qq.com、vip.qq.com、foxmail.com）';
    }

    if (activeTab === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = '用户名不能为空';
      }
      
      if (!formData.password.trim()) {
        newErrors.password = '密码不能为空';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码长度至少6位';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }

      if (!formData.code.trim()) {
        newErrors.code = '验证码不能为空';
      }
    } else {
      // 登录验证
      if (loginMethod === 'password') {
        if (!formData.password.trim()) {
          newErrors.password = '密码不能为空';
        }
      } else {
        if (!formData.code.trim()) {
          newErrors.code = '验证码不能为空';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendVerificationCode = async () => {
    if (!formData.email.trim()) {
      toast.error('请先输入邮箱地址');
      return;
    }

    if (!isQQEmail(formData.email)) {
      toast.error('仅支持QQ邮箱');
      return;
    }

    setSendingCode(true);
    
    try {
      const response = await authAPI.sendVerification({
        email: formData.email,
        type: activeTab
      });
      
      if (response.data.success) {
        toast.success('验证码已发送到您的邮箱');
        setCountdown(60);
      } else {
        toast.error(response.data.message || '发送失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      toast.error(error.response?.data?.message || '发送失败，请重试');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (activeTab === 'login') {
        const loginData = { email: formData.email };
        
        if (loginMethod === 'password') {
          loginData.password = formData.password;
        } else {
          loginData.code = formData.code;
        }

        const result = await login(loginData);
        
        if (result.success) {
          navigate('/');
        }
      } else {
        const response = await authAPI.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          code: formData.code
        });
        
        if (response.data.success) {
          toast.success('注册成功！请登录');
          setActiveTab('login');
          setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            code: ''
          });
        } else {
          toast.error(response.data.message || '注册失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(error.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setLoginMethod('password');
    setErrors({});
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      code: ''
    });
    setAvatarUrl('');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>{activeTab === 'login' ? '欢迎回来' : '创建账户'}</Title>
        
        {avatarUrl && (
          <AvatarPreview>
            <img src={avatarUrl} alt="QQ头像" onError={() => setAvatarUrl('')} />
          </AvatarPreview>
        )}
        
        <TabContainer>
          <Tab 
            active={activeTab === 'login'} 
            onClick={() => switchTab('login')}
            type="button"
          >
            登录
          </Tab>
          <Tab 
            active={activeTab === 'register'} 
            onClick={() => switchTab('register')}
            type="button"
          >
            注册
          </Tab>
        </TabContainer>

        <QQHint>
          <FiMail />
          <span>仅支持QQ邮箱登录注册，会自动获取您的QQ头像</span>
        </QQHint>

        {activeTab === 'login' && (
          <div style={{ marginBottom: '20px' }}>
            <LoginMethod>
              <input
                type="radio"
                id="password-login"
                name="loginMethod"
                value="password"
                checked={loginMethod === 'password'}
                onChange={(e) => setLoginMethod(e.target.value)}
              />
              <label htmlFor="password-login">密码登录</label>
            </LoginMethod>
            <LoginMethod>
              <input
                type="radio"
                id="code-login"
                name="loginMethod"
                value="code"
                checked={loginMethod === 'code'}
                onChange={(e) => setLoginMethod(e.target.value)}
              />
              <label htmlFor="code-login">验证码登录</label>
            </LoginMethod>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiMail />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="请输入QQ邮箱"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>
          
          {activeTab === 'register' && (
            <InputGroup>
              <InputIcon>
                <FiUser />
              </InputIcon>
              <Input
                type="text"
                name="username"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={handleInputChange}
              />
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            </InputGroup>
          )}
          
          {(activeTab === 'register' || (activeTab === 'login' && loginMethod === 'password')) && (
            <InputGroup>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleInputChange}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputGroup>
          )}
          
          {activeTab === 'register' && (
            <InputGroup>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="请确认密码"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </InputGroup>
          )}

          {(activeTab === 'register' || (activeTab === 'login' && loginMethod === 'code')) && (
            <VerificationGroup>
              <InputGroup style={{ flex: 1 }}>
                <InputIcon>
                  <FiCheck />
                </InputIcon>
                <VerificationInput
                  type="text"
                  name="code"
                  placeholder="请输入验证码"
                  value={formData.code}
                  onChange={handleInputChange}
                  maxLength={6}
                />
                {errors.code && <ErrorMessage>{errors.code}</ErrorMessage>}
              </InputGroup>
              <SendCodeButton
                type="button"
                onClick={sendVerificationCode}
                disabled={sendingCode || countdown > 0}
              >
                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
              </SendCodeButton>
            </VerificationGroup>
          )}
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? '处理中...' : (activeTab === 'login' ? '登录' : '注册')}
          </SubmitButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
