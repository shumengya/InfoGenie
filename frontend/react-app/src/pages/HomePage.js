import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiActivity, FiGrid, FiCpu, FiTrendingUp } from 'react-icons/fi';

const HomeContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: 20px 0;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 60px 0;
  text-align: center;
  margin-bottom: 40px;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
`;

const HeroTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
  
  .title-emoji {
    margin: 0 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const HeroButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(129, 199, 132, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(129, 199, 132, 0.5);
    background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24px;
  text-align: center;
  
  .section-emoji {
    margin-right: 12px;
  }
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ModuleCard = styled(Link)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 8px 32px rgba(168, 230, 207, 0.3);
  transition: all 0.3s ease;
  border: 1px solid rgba(168, 230, 207, 0.2);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(168, 230, 207, 0.4);
    border-color: #81c784;
    background: rgba(255, 255, 255, 0.98);
  }
`;

const ModuleIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.3);
`;

const ModuleTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 12px;
`;

const ModuleDescription = styled.p`
  color: #4a4a4a;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const ModuleFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ModuleFeature = styled.li`
  color: #374151;
  font-size: 14px;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: bold;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;



const HomePage = () => {

  const modules = [
    {
      path: '/60sapi',
      icon: FiActivity,
      title: '60s API',
      description: '实时获取各种热门数据和资讯信息',
      features: [
        '抖音热搜榜单',
        '微博热搜话题',
        '猫眼票房排行',
        '每日60秒读懂世界',
        '必应每日壁纸',
        '实时天气信息'
      ]
    },
    {
      path: '/smallgame',
      icon: FiGrid,
      title: '小游戏',
      description: '轻松有趣的休闲小游戏合集',
      features: [
        '经典益智游戏',
        '休闲娱乐游戏',
        '技能挑战游戏',
        '即点即玩',
        '无需下载',
        '移动端优化'
      ]
    },
    {
      path: '/aimodel',
      icon: FiCpu,
      title: 'AI模型',
      description: '智能AI工具和模型应用',
      features: [
        'AI对话助手',
        '智能文本生成',
        '图像识别分析',
        '数据智能处理',
        '个性化推荐',
        '需要登录使用'
      ]
    }
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            <span className="title-emoji">✨</span>
            神奇万事通
            <span className="title-emoji">✨</span>
          </HeroTitle>
          <HeroSubtitle>
            🎨 一个多功能的聚合软件应用 💬
            <br />
            提供实时数据、娱乐游戏、AI工具等丰富功能
          </HeroSubtitle>
          <HeroButton to="/60sapi">
            <FiTrendingUp />
            开始探索
          </HeroButton>
        </HeroContent>
      </HeroSection>

      <Container>
        <SectionTitle>
          <span className="section-emoji">🚀</span>
          功能模块
        </SectionTitle>

        <ModuleGrid>
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <ModuleCard key={module.path} to={module.path}>
                <ModuleIcon>
                  <IconComponent />
                </ModuleIcon>
                <ModuleTitle>{module.title}</ModuleTitle>
                <ModuleDescription>{module.description}</ModuleDescription>
                <ModuleFeatures>
                  {module.features.map((feature, index) => (
                    <ModuleFeature key={index}>{feature}</ModuleFeature>
                  ))}
                </ModuleFeatures>
              </ModuleCard>
            );
          })}
        </ModuleGrid>


      </Container>
    </HomeContainer>
  );
};

export default HomePage;
