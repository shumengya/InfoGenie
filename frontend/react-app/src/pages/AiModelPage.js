import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCpu, FiUser, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import api from '../utils/api';

const AiContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: 20px 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
  
  .title-emoji {
    margin: 0 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
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
    border-color: #667eea;
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
  color: #667eea;
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
  background: ${props => props.gradient};
`;

const LaunchButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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
      const response = await api.get('/api/aimodelapp/scan-directories');
      if (response.data.success) {
        setApps(response.data.apps);
      } else {
        setError('获取AI应用列表失败');
      }
    } catch (err) {
      console.error('获取AI应用列表失败:', err);
      setError('获取AI应用列表失败，请稍后重试');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleLaunchApp = (app) => {
    // 将相对路径转换为完整的服务器地址
    const baseUrl = process.env.REACT_APP_API_URL || 'https://infogenie.api.shumengya.top';
    const fullLink = `${baseUrl}${app.link}`;
    setEmbeddedApp({ ...app, link: fullLink });
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

  return (
    <AiContainer>
      <Container>
        <PageHeader>
          <PageTitle>
            <span className="title-emoji">🤖</span>
            AI模型
            <span className="title-emoji">🤖</span>
          </PageTitle>
          <PageDescription>
            智能AI工具和模型应用，提供对话、文本生成、图像识别等功能
          </PageDescription>
        </PageHeader>

        {!isLoggedIn ? (
          <LoginPrompt>
            <LoginIcon>🔒</LoginIcon>
            <LoginTitle>需要登录访问</LoginTitle>
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  <AppTheme gradient={app.gradient} />
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
              />
            </EmbeddedContent>
          </EmbeddedContainer>
        )}


      </Container>
    </AiContainer>
  );
};

export default AiModelPage;
