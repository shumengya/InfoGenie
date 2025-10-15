import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  font-size: 44.8px;
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
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
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
`;

const AppIcon = styled.div`
  font-size: 24px;
  color: #4ade80;
`;

const AppDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
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

const EmbeddedContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const EmbeddedContent = styled.div`
  background: white;
  border-radius: 0;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: none;
`;

const EmbeddedHeader = styled.div`
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
  padding: 15px 20px;
  padding-top: max(15px, env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1001;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const EmbeddedFrame = styled.iframe`
  width: 100%;
  height: calc(100% - 60px);
  border: none;
  background: white;
  position: relative;
  z-index: 1000;
`;



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
  
  // 在iframe加载时注入token
  const handleIframeLoad = (e) => {
    try {
      const iframe = e.target;
      const token = localStorage.getItem('token');
      
      if (iframe && iframe.contentWindow && token) {
        // 将token传递给iframe
        iframe.contentWindow.localStorage.setItem('token', token);
        
        // Token已传递给iframe
      }
    } catch (error) {
      console.error('iframe通信错误:', error);
    }
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

  return (
    <AiContainer>
      <Container>
        <PageHeader>
          <PageTitle>
            AI工具
          </PageTitle>
          <PageDescription>
            <strong>AI大模型工具，提供一些生成式大语言模型的小功能(´,,•ω•,,)♡</strong>
          </PageDescription>
        </PageHeader>

        {!isLoggedIn ? (
          <LoginPrompt>
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
          </LoginPrompt>
        ) : loadingApps ? (
          <LoginPrompt>
            <LoginIcon>🤖</LoginIcon>
            <LoginTitle>加载AI应用中...</LoginTitle>
            <LoginText>
              正在为您准备强大的AI工具，请稍候...
            </LoginText>
          </LoginPrompt>
        ) : error ? (
          <LoginPrompt>
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
            <LoginIcon>🎯</LoginIcon>
            <LoginTitle>暂无AI应用</LoginTitle>
            <LoginText>
              目前还没有可用的AI应用，请稍后再来查看。
            </LoginText>
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
              萌芽币消费提示
            </h3>
            <p style={{ lineHeight: '1.6', color: '#374151' }}>
              每次使用AI功能将消耗<b>100萌芽币</b>，无论成功与否。当萌芽币余额不足时，无法使用AI工具功能。
            </p>
            <p style={{ lineHeight: '1.6', color: '#374151' }}>
              您可以通过<b>每日签到</b>获得300萌芽币。详细的萌芽币余额显示在个人中心页面。
            </p>
          </div>
        )}

      {/* 内嵌显示组件 */}
        {embeddedApp && (
          <EmbeddedContainer onClick={closeEmbedded}>
            <EmbeddedContent onClick={(e) => e.stopPropagation()}>
              <EmbeddedHeader>
                <h3>{embeddedApp.title}</h3>
                <BackButton onClick={closeEmbedded}>
                  <FiArrowLeft />
                  返回
                </BackButton>
              </EmbeddedHeader>
              <EmbeddedFrame
                src={embeddedApp.link}
                title={embeddedApp.title}
                onLoad={handleIframeLoad}
              />
            </EmbeddedContent>
          </EmbeddedContainer>
        )}


      </Container>
    </AiContainer>
  );
};

export default AiModelPage;
