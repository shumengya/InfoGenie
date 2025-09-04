import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCpu, FiLock, FiMessageCircle, FiImage, FiFileText, FiUser } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';

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

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const FeatureStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
`;

const LockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const LockIcon = styled.div`
  font-size: 32px;
  color: #9ca3af;
`;

const AiModelPage = () => {
  const { isLoggedIn, isLoading } = useUser();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const aiFeatures = [
    {
      icon: <FiMessageCircle />,
      title: 'AI对话助手',
      description: '智能对话机器人，回答问题、提供建议、进行闲聊',
      status: '开发中'
    },
    {
      icon: <FiFileText />,
      title: '智能文本生成',
      description: '根据提示生成文章、总结、翻译等文本内容',
      status: '开发中'
    },
    {
      icon: <FiImage />,
      title: '图像识别分析',
      description: '上传图片进行内容识别、文字提取、场景分析',
      status: '规划中'
    },
    {
      icon: <FiCpu />,
      title: '数据智能处理',
      description: '自动化数据分析、图表生成、趋势预测',
      status: '规划中'
    }
  ];

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
        ) : (
          <LoginPrompt>
            <LoginIcon>🚧</LoginIcon>
            <LoginTitle>功能开发中</LoginTitle>
            <LoginText>
              AI模型功能正在紧张开发中，即将为您带来强大的人工智能体验。
              <br />
              感谢您的耐心等待！
            </LoginText>
          </LoginPrompt>
        )}

        <FeatureGrid>
          {aiFeatures.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                {feature.icon}
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <FeatureStatus>
                <span>⏳</span>
                {feature.status}
              </FeatureStatus>
              
              {!isLoggedIn && (
                <LockOverlay>
                  <LockIcon>
                    <FiLock />
                  </LockIcon>
                </LockOverlay>
              )}
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Container>
    </AiContainer>
  );
};

export default AiModelPage;
