import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #1f2937;
  color: #d1d5db;
  padding: 40px 0 80px; /* 底部留出导航栏空间 */
  margin-top: 60px;
  
  @media (min-width: 769px) {
    padding: 40px 0 20px;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const FooterInfo = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const FooterTitle = styled.h3`
  color: white;
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: bold;
`;

const FooterDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  color: #9ca3af;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const FooterLink = styled.a`
  color: #d1d5db;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #667eea;
  }
`;

const FooterDivider = styled.div`
  height: 1px;
  background: #374151;
  margin: 24px 0;
`;

const FooterBottom = styled.div`
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
`;

const Copyright = styled.p`
  margin-bottom: 8px;
`;

const ICP = styled.p`
  margin: 0;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterInfo>
          <FooterTitle>✨ 神奇万事通 ✨</FooterTitle>
          <FooterDescription>
            🎨 一个多功能的聚合软件应用 💬
          </FooterDescription>
        </FooterInfo>

        <FooterLinks>
          <FooterLink href="/60sapi">📡聚合应用</FooterLink>
          <FooterLink href="/smallgame">🎮小游戏</FooterLink>
          <FooterLink href="/aimodel">🤖AI工具</FooterLink>
        </FooterLinks>

        <FooterDivider />

        <FooterBottom>
          <Copyright>
            📄 蜀ICP备2025151694号  | Copyright © 2025-{currentYear} ✨
          </Copyright>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
