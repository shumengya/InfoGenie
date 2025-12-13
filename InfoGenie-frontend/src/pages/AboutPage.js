import React from 'react';
import styled from 'styled-components';
import { FiInfo, FiGlobe, FiDownload, FiStar, FiHeart } from 'react-icons/fi';

const AboutContainer = styled.div`
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
  max-width: 800px;
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

const AboutCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(168, 230, 207, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(168, 230, 207, 0.2);
  margin-bottom: 24px;
`;

const AppIcon = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const AppName = styled.h2`
  font-size: 32px;
  font-weight: bold;
  color: #2e7d32;
  text-align: center;
  margin-bottom: 8px;
`;

const AppVersion = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const VersionBadge = styled.span`
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.3);
`;

const AppDescription = styled.p`
  color: #4a4a4a;
  font-size: 16px;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 32px;
`;

const LinksSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const LinkCard = styled.a`
  background: rgba(129, 199, 132, 0.1);
  border: 1px solid rgba(129, 199, 132, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(129, 199, 132, 0.2);
    background: rgba(129, 199, 132, 0.15);
    border-color: #81c784;
  }
`;

const LinkIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
`;

const LinkContent = styled.div`
  flex: 1;
`;

const LinkTitle = styled.div`
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 4px;
`;

const LinkUrl = styled.div`
  font-size: 14px;
  color: #666;
  word-break: break-all;
`;

const FeatureSection = styled.div`
  margin-top: 32px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  color: #4a4a4a;
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

const FooterText = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(129, 199, 132, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const AboutPage = () => {
  return (
    <AboutContainer>
      <Container>
        <PageHeader>
          <PageTitle>关于我们</PageTitle>
          <PageDescription>
            <strong style={{ color: '#ffffff' }}>了解万象口袋的更多信息和功能特色(,,・ω・,,)</strong>
          </PageDescription>
        </PageHeader>

        <AboutCard>
          <AppIcon>
            <img src="/assets/logo.png" alt="InfoGenie Logo" />
          </AppIcon>
          
          <AppName>万象口袋</AppName>
          
          <AppVersion>
            <VersionBadge>v2.2.3</VersionBadge>
          </AppVersion>
          
          <AppDescription>
            一款跨平台式聚合应用，集成了多种实用工具和娱乐功能，
            为用户提供便捷的一站式服务体验。
          </AppDescription>

          <LinksSection>
            <LinkCard href="https://infogenie.shumengya.top" target="_blank" rel="noopener noreferrer">
              <LinkIcon>
                <FiGlobe />
              </LinkIcon>
              <LinkContent>
                <LinkTitle>Web端在线体验</LinkTitle>
              </LinkContent>
            </LinkCard>

            <LinkCard href="https://work.shumengya.top/#/work/InfoGenie" target="_blank" rel="noopener noreferrer">
              <LinkIcon>
                <FiDownload />
              </LinkIcon>
              <LinkContent>
                <LinkTitle>最新版下载地址</LinkTitle>
              </LinkContent>
            </LinkCard>
          </LinksSection>

          <FeatureSection>
            <FeatureTitle>
              <FiStar />
              主要功能
            </FeatureTitle>
            <FeatureList>
              <FeatureItem>聚合应用 - 提供天气预报，平台热搜，百度百科等实用工具</FeatureItem>
              <FeatureItem>休闲游戏 - 迷你解压小游戏即点即玩</FeatureItem>
              <FeatureItem>AI工具 - AI翻译，AI写诗，文章转换功能体验</FeatureItem>
              <FeatureItem>用户系统 - 个人中心、签到奖励等</FeatureItem>
              <FeatureItem>跨平台 - 支持Web、Windows、Android平台使用</FeatureItem>
              <FeatureItem>响应式设计 - 完美适配各种设备屏幕</FeatureItem>
            </FeatureList>
          </FeatureSection>

          <FooterText>
            <FiHeart style={{ color: '#ef4444' }} />
            感谢您使用万象口袋，我们将持续为您提供更好的服务
          </FooterText>
        </AboutCard>
      </Container>
    </AboutContainer>
  );
};

export default AboutPage;