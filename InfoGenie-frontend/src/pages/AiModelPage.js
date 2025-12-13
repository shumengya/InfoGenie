import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FiCpu, FiUser, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { AI_MODEL_APPS } from '../config/StaticPageConfig';
// eslint-disable-next-line no-unused-vars
import api from '../utils/api';

const AiContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: 20px 0;
  opacity: 0;
  transform: translateY(20px);
  animation: pageEnter 0.8s ease-out forwards;
  position: relative;
  
  @keyframes pageEnter {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  
  .title-emoji {
    margin: 0 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 33.6px;
  }
`;

const PageDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
`;

const LoginPrompt = styled.div`
  background: white;
  border-radius: 0;
  padding: 60px 40px;
  text-align: center;
  box-shadow: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const AppCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #4ade80;
  }
  
  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const AppTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const AppIcon = styled.div`
  font-size: 24px;
  color: #4ade80;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const AppDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 14px;
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 12px;
    line-height: 1.3;
  }
`;

const AppFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AppTheme = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 20px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 18px;
    border-radius: 5px;
  }
`;

const LaunchButton = styled.button`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 7px 14px;
    font-size: 13px;
    border-radius: 6px;
    gap: 5px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 5px;
    gap: 4px;
  }
`;

const LoginIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const LoginTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
`;

const LoginText = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
  }
`;

// 独立全屏嵌套网页组件
const FullscreenEmbeddedPage = ({ app, onClose }) => {
  useEffect(() => {
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 键盘事件监听
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      // 恢复页面滚动
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const fullscreenStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    // 重置所有可能的继承样式
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333',
    textAlign: 'left',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    boxShadow: 'none',
    border: 'none',
    borderRadius: 0,
    outline: 'none',
    transform: 'none',
    transition: 'none',
    animation: 'none',
    filter: 'none',
    backdropFilter: 'none',
    opacity: 1,
    visibility: 'visible',
    overflow: 'hidden'
  };

  const headerStyles = {
    backgroundColor: '#4ade80',
    color: '#ffffff',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flexShrink: 0,
    minHeight: '56px',
    boxSizing: 'border-box',
    margin: 0,
    border: 'none',
    borderRadius: 0,
    fontSize: '16px',
    fontWeight: 'normal',
    textAlign: 'left',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    transform: 'none',
    transition: 'none',
    animation: 'none',
    filter: 'none',
    backdropFilter: 'none',
    opacity: 1,
    visibility: 'visible',
    overflow: 'visible'
  };

  const titleStyles = {
    fontSize: '18px',
    fontWeight: '500',
    margin: 0,
    padding: 0,
    color: '#ffffff',
    textAlign: 'left',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    boxShadow: 'none',
    border: 'none',
    borderRadius: 0,
    outline: 'none',
    transform: 'none',
    transition: 'none',
    animation: 'none',
    filter: 'none',
    backdropFilter: 'none',
    opacity: 1,
    visibility: 'visible',
    overflow: 'visible',
    boxSizing: 'border-box'
  };

  const backButtonStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    margin: 0,
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    boxShadow: 'none',
    outline: 'none',
    transform: 'none',
    animation: 'none',
    filter: 'none',
    backdropFilter: 'none',
    opacity: 1,
    visibility: 'visible',
    overflow: 'visible',
    boxSizing: 'border-box'
  };

  const iframeStyles = {
    width: '100%',
    height: 'calc(100vh - 56px)',
    border: 'none',
    backgroundColor: '#ffffff',
    flexGrow: 1,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333',
    textAlign: 'left',
    textDecoration: 'none',
    textTransform: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    outline: 'none',
    transform: 'none',
    transition: 'none',
    animation: 'none',
    filter: 'none',
    backdropFilter: 'none',
    opacity: 1,
    visibility: 'visible',
    overflow: 'hidden'
  };

  const handleBackButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
  };

  const handleBackButtonLeave = (e) => {
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
  };

  // 在iframe加载时注入token
  const handleIframeLoad = (e) => {
    try {
      const iframe = e.target;
      const token = localStorage.getItem('token');
      
      if (iframe && iframe.contentWindow && token) {
        // 将token传递给iframe
        iframe.contentWindow.localStorage.setItem('token', token);
      }
    } catch (error) {
      console.error('iframe通信错误:', error);
    }
  };

  return (
    <div style={fullscreenStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>{app.title}</h1>
        <button
          style={backButtonStyles}
          onClick={onClose}
          onMouseEnter={handleBackButtonHover}
          onMouseLeave={handleBackButtonLeave}
        >
          <FiArrowLeft size={16} />
          返回
        </button>
      </div>
      <iframe
        src={app.link}
        title={app.title}
        style={iframeStyles}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};



const AiModelPage = () => {
  const { isLoggedIn, isLoading } = useUser();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState(null);
  const [embeddedApp, setEmbeddedApp] = useState(null);

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchApps();
    }
  }, [isLoggedIn]);

  const fetchApps = async () => {
    try {
      setLoadingApps(true);
      
      // 从配置文件获取AI应用数据，过滤掉IsShow为false的应用
      const visibleApps = AI_MODEL_APPS.filter(app => app.IsShow !== false);
      setApps(visibleApps);
    } catch (err) {
      console.error('获取AI应用列表失败:', err);
      setError('获取AI应用列表失败，请稍后重试');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleLaunchApp = (app) => {
    // 直接使用相对路径，React会自动从public文件夹提供静态文件
    setEmbeddedApp({ ...app, link: app.link });
  };

  // 关闭内嵌显示
  const closeEmbedded = () => {
    setEmbeddedApp(null);
  };



  if (isLoading) {
    return (
      <AiContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>加载中...</p>
          </div>
        </Container>
      </AiContainer>
    );
  }

  if (!isLoggedIn) {
    return (
      <AiContainer>
        <LoginPrompt>
          <div>
            <LoginIcon>🔒</LoginIcon>
            <LoginTitle>需要登录访问Σ(°ロ°)</LoginTitle>
            <LoginText>
              AI模型功能需要登录后才能使用，请先登录您的账户。
              <br />
              登录后即可体验强大的AI工具和服务。
            </LoginText>
            <LoginButton onClick={handleLogin}>
              <FiUser />
              立即登录
            </LoginButton>
          </div>
        </LoginPrompt>
      </AiContainer>
    );
  }

  return (
    <AiContainer>
      <Container>
        <PageHeader>
          <PageTitle>
            AI工具
          </PageTitle>
          <PageDescription>
            <strong style={{ color: '#ffffff' }}>AI大模型工具，提供一些生成式大语言模型的小功能(´,,•ω•,,)♡</strong>
          </PageDescription>
        </PageHeader>

        {loadingApps ? (
          <LoginPrompt>
            <div>
              <LoginIcon>🤖</LoginIcon>
              <LoginTitle>加载AI应用中...</LoginTitle>
              <LoginText>
                正在为您准备强大的AI工具，请稍候...
              </LoginText>
            </div>
          </LoginPrompt>
        ) : error ? (
          <LoginPrompt>
            <div>
              <LoginIcon>😅</LoginIcon>
              <LoginTitle>加载失败</LoginTitle>
              <LoginText>
                {error}
                <br />
                <button 
                  onClick={fetchApps}
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '16px'
                  }}
                >
                  重新加载
                </button>
              </LoginText>
            </div>
          </LoginPrompt>
        ) : apps.length > 0 ? (
          <AppGrid>
            {apps.map((app, index) => (
              <AppCard key={index} onClick={() => handleLaunchApp(app)}>
                <AppHeader>
                  <AppTitle>{app.title}</AppTitle>
                  <AppIcon>
                    <FiCpu />
                  </AppIcon>
                </AppHeader>
                <AppDescription>{app.description}</AppDescription>
                <AppFooter>
                  <AppTheme>{app.icon}</AppTheme>
                  <LaunchButton onClick={(e) => {
                    e.stopPropagation();
                    handleLaunchApp(app);
                  }}>
                    <FiExternalLink />
                    启动应用
                  </LaunchButton>
                </AppFooter>
              </AppCard>
            ))}
          </AppGrid>
        ) : (
          <LoginPrompt>
            <div>
              <LoginIcon>🎯</LoginIcon>
              <LoginTitle>暂无AI应用</LoginTitle>
              <LoginText>
                目前还没有可用的AI应用，请稍后再来查看。
              </LoginText>
            </div>
          </LoginPrompt>
        )}

        {/* 萌芽币提示 */}
        {isLoggedIn && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto 40px',
            padding: '20px',
            background: 'rgba(74, 222, 128, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            <h3 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: '#16a34a',
              marginTop: 0
            }}>
              <span style={{ fontSize: '24px' }}>💰</span>
              AI工具使用提示
            </h3>
            <p style={{ lineHeight: '1.6', color: '#374151' }}>
              每次使用AI功能将消耗<b>100萌芽币</b>，无论成功与否。当萌芽币余额不足时，将无法使用AI工具功能。
            </p>
            <p style={{ lineHeight: '1.6', color: '#374151' }}>
              您可以通过<b>每日签到</b>和游玩<b>休闲小游戏</b>来获得萌芽币，查看详细的萌芽币余额请前往个人中心页面。
            </p>
          </div>
        )}

      {/* 使用Portal渲染独立的全屏嵌套网页 */}
      {embeddedApp && createPortal(
        <FullscreenEmbeddedPage 
          app={embeddedApp} 
          onClose={closeEmbedded} 
        />,
        document.body
      )}


      </Container>
    </AiContainer>
  );
};

export default AiModelPage;
