import React from 'react';
import styled from 'styled-components';
import { FiGrid, FiPlay, FiZap, FiHeart } from 'react-icons/fi';

const GameContainer = styled.div`
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

const ComingSoonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

const ComingSoonIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const ComingSoonTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
`;

const ComingSoonText = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
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
`;

const SmallGamePage = () => {
  const plannedFeatures = [
    {
      icon: <FiPlay />,
      title: '经典游戏',
      description: '俄罗斯方块、贪吃蛇、2048等经典小游戏'
    },
    {
      icon: <FiZap />,
      title: '反应游戏',
      description: '测试反应速度和手眼协调能力的趣味游戏'
    },
    {
      icon: <FiHeart />,
      title: '休闲游戏',
      description: '轻松愉快的休闲娱乐游戏，适合放松心情'
    },
    {
      icon: <FiGrid />,
      title: '益智游戏',
      description: '锻炼思维能力的益智类游戏和谜题'
    }
  ];

  return (
    <GameContainer>
      <Container>
        <PageHeader>
          <PageTitle>
            <span className="title-emoji">🎮</span>
            小游戏
            <span className="title-emoji">🎮</span>
          </PageTitle>
          <PageDescription>
            轻松有趣的休闲小游戏合集，即点即玩，无需下载
          </PageDescription>
        </PageHeader>

        <ComingSoonCard>
          <ComingSoonIcon>🚧</ComingSoonIcon>
          <ComingSoonTitle>敬请期待</ComingSoonTitle>
          <ComingSoonText>
            小游戏模块正在开发中，即将为您带来丰富多彩的游戏体验。
            <br />
            所有游戏都经过移动端优化，支持触屏操作。
          </ComingSoonText>
        </ComingSoonCard>

        <FeatureGrid>
          {plannedFeatures.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                {feature.icon}
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Container>
    </GameContainer>
  );
};

export default SmallGamePage;
