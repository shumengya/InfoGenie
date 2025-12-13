import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  color: white;
  padding: 40px 0 80px; /* 底部留出导航栏空间 */
  margin-top: 60px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  
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
  color: rgba(255, 255, 255, 0.9);
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
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 6px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const FooterDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 24px 0;
`;

const FooterBottom = styled.div`
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
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
          <FooterTitle>✨ 万象口袋 ✨</FooterTitle>
        </FooterInfo>



        <FooterDivider />

        <FooterBottom>
          <Copyright>
    <strong>蜀ICP备2025151694号 | Copyright © 2025-{currentYear}</strong>
          </Copyright>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
