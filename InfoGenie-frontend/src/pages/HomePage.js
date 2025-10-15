import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiActivity, FiGrid, FiCpu, FiTrendingUp } from 'react-icons/fi';

//================css样式================
const HomeContainer = styled.div`
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

const HeroSection = styled.section`
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
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
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(129, 199, 132, 0.2);
  position: relative;
  
  .title-emoji {
    margin: 0 8px;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(129, 199, 132, 0.3));
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #81c784, #a5d6a7, #c8e6c9);
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(129, 199, 132, 0.3);
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(129, 199, 132, 0.4),
    0 4px 16px rgba(129, 199, 132, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 
      0 16px 48px rgba(129, 199, 132, 0.5),
      0 8px 24px rgba(129, 199, 132, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    
    &::before {
      left: 100%;
    }
    
    &::after {
      width: 120px;
      height: 120px;
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(1.02);
    transition: all 0.1s ease;
    box-shadow: 
      0 8px 24px rgba(129, 199, 132, 0.4),
      0 4px 12px rgba(129, 199, 132, 0.2),
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  
  .section-emoji {
    margin-right: 12px;
    display: inline-block;
    filter: drop-shadow(0 2px 4px rgba(129, 199, 132, 0.3));
    animation: pulse 2s ease-in-out infinite;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(129, 199, 132, 0.3), transparent);
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #81c784, #a5d6a7);
    border-radius: 1px;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
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
  box-shadow: 
    0 8px 32px rgba(168, 230, 207, 0.3),
    0 2px 8px rgba(129, 199, 132, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(168, 230, 207, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #81c784, #a5d6a7, #c8e6c9);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(129, 199, 132, 0.05) 0%, transparent 70%);
    opacity: 0;
    transition: all 0.4s ease;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(168, 230, 207, 0.4),
      0 8px 24px rgba(129, 199, 132, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 0 0 1px rgba(129, 199, 132, 0.3);
    border-color: #81c784;
    background: rgba(255, 255, 255, 0.98);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-4px) scale(1.01);
    transition: all 0.1s ease;
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
  box-shadow: 
    0 4px 16px rgba(129, 199, 132, 0.3),
    0 2px 8px rgba(129, 199, 132, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #a5d6a7, #c8e6c9);
    border-radius: 22px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${ModuleCard}:hover & {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 8px 24px rgba(129, 199, 132, 0.4),
      0 4px 12px rgba(129, 199, 132, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    
    &::before {
      opacity: 1;
    }
  }
`;

const ModuleTitle = styled.h3`
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #2e7d32;
  margin-bottom: 12px;
  line-height: 1.2 !important;
  letter-spacing: normal !important;
  text-shadow: 0 1px 2px rgba(46, 125, 50, 0.1);
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #81c784, #a5d6a7);
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  
  ${ModuleCard}:hover & {
    color: #1b5e20;
    text-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
    
    &::before {
      width: 100%;
    }
  }
`;

const ModuleDescription = styled.p`
  color: #4a4a4a;
  line-height: 1.6;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: color 0.3s ease;
  
  ${ModuleCard}:hover & {
    color: #2d3748;
  }
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
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(16, 185, 129, 0.3);
    transition: all 0.3s ease;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${ModuleCard}:hover & {
    color: #1f2937;
    transform: translateX(2px);
    
    &:before {
      color: #059669;
      transform: scale(1.1);
    }
  }
`;
//================css样式================


const HomePage = () => {

  const modules = [
    {
      path: '/60sapi',
      icon: FiActivity,
      title: '聚合应用',
      description: '实时获取最新热门数据,资讯和实用工具',
      features: [
        '🎯娱乐消遣板块',
        '🔧实用功能板块',
        '📰日更咨询板块',
        '🔥热搜榜单板块',
      ]
    },
    {
      path: '/smallgame',
      icon: FiGrid,
      title: '休闲游戏',
      description: '轻松有趣的休闲小游戏合集',
      features: [
        '🔢2048小游戏',
        '🧩俄罗斯方块',
        '🐍经典贪吃蛇',
        '◼️别踩白方块',
      ]
    },
    {
      path: '/aimodel',
      icon: FiCpu,
      title: 'AI工具',
      description: '智能AI工具和模型应用',
      features: [
        '🌍翻译助手',
        '📝写诗达人',
        "🖊️文章转文言文",
        "🫡表情包制作",
      ]
    }
  ];
//<em> </em>
  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            <span className="title-emoji">✨</span>
            万象口袋
            <span className="title-emoji">✨</span>
          </HeroTitle>
          <HeroSubtitle>
<strong>💡一个跨平台的聚合式应用</strong>
            <br />
集成了热搜榜单，日更资讯、休闲游戏、AI大模型工具等丰富功能。
像微信小程序一样，把分散的功能汇聚在一个应用中，让你无需下载一个又一个app。
            <br />
<strong>🎯功能繁多却不显得臃肿</strong>
            <br />
「Windows」端仅约18MB；「Android」端仅约15MB；平均内存占用仅48MB
相比市面上的软件更小巧、更轻便，却能承载更多可能。
          </HeroSubtitle>
          <HeroButton to="/60sapi">
            <FiTrendingUp />
            开始探索吧( •ω• )♡
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
