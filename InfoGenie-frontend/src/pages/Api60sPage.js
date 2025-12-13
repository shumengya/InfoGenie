import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import { API_60S_CATEGORIES } from '../config/StaticPageConfig';


//================css样式================
const Api60sContainer = styled.div`
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
  padding: 0 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: white;
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
`;

const CategorySection = styled.div`
  margin-bottom: 50px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.03) 0%, 
      rgba(255, 255, 255, 0.01) 50%, 
      rgba(0, 0, 0, 0.02) 100%);
    border-radius: 20px;
    pointer-events: none;
    z-index: -1;
  }
`;

const CategoryTitle = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.3);
  position: relative;
  padding: 8px 0;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.6) 0%, 
      rgba(255, 255, 255, 0.2) 100%);
    border-radius: 1px;
  }
`;

const CategoryDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 17px;
  margin: 0 0 20px 0;
  line-height: 1.4;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  position: relative;
  padding: 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.02) 0%, 
    rgba(255, 255, 255, 0.01) 50%, 
    rgba(0, 0, 0, 0.01) 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.05) 0%, 
      transparent 50%, 
      rgba(0, 0, 0, 0.02) 100%);
    pointer-events: none;
    z-index: -1;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 6px;
  }
`;

const ApiCard = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  border-radius: 16px;
  padding: 20px 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  cursor: pointer;
  min-height: 90px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 16px 12px;
    min-height: 80px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)'};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 50%, 
      rgba(0, 0, 0, 0.02) 100%);
    pointer-events: none;
    border-radius: 16px;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      0 0 0 1px rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
    background: linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(250, 252, 255, 0.98));
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 2px 6px rgba(0, 0, 0, 0.08),
      inset 0 2px 4px rgba(0, 0, 0, 0.06);
    background: linear-gradient(145deg, rgba(245, 248, 250, 0.98), rgba(240, 245, 248, 0.95));
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const CardIcon = styled.div`
  font-size: 20px;
  color: ${props => props.color || '#66bb6a'};
  margin-right: 10px;
  flex-shrink: 0;
  position: relative;
  padding: 4px;
  border-radius: 6px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  
  ${ApiCard}:hover & {
    transform: scale(1.1);
    box-shadow: 
      0 2px 6px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const CardTitle = styled.h3`
  font-size: calc(15px * 1.05);
  font-weight: 600;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #2e7d32;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  /* 强化加粗在中文上的可见度 */
  strong {
    font-weight: 800;
  }
  
  @media (max-width: 768px) {
    font-size: calc(14px * 1.05);
  }
  
  ${ApiCard}:hover & {
    color: #1b5e20;
    text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  }
`;

const ExternalIcon = styled.div`
  font-size: 14px;
  color: #81c784;
  opacity: 0.7;
  flex-shrink: 0;
  transition: all 0.2s ease;
  padding: 2px;
  border-radius: 4px;
  
  ${ApiCard}:hover & {
    opacity: 1;
    color: #4caf50;
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;





// 独立全屏嵌套网页组件
const FullscreenEmbeddedPage = ({ api, onClose }) => {
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
     backgroundColor: '#81C784',
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

  return (
    <div style={fullscreenStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>{api.title}</h1>
        <button
          style={backButtonStyles}
          onClick={onClose}
          onMouseEnter={handleBackButtonHover}
          onMouseLeave={handleBackButtonLeave}
        >
          返回
        </button>
      </div>
      <iframe
        src={api.link}
        title={api.title}
        style={iframeStyles}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};
//================css样式================

const Api60sPage = () => {
  const [mounted, setMounted] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [embeddedApi, setEmbeddedApi] = useState(null);



  // 从配置文件获取60s API数据
  const scanApiModules = async () => {
    try {
      // 过滤掉IsShow为false的API项目
      const filteredCategories = API_60S_CATEGORIES.map(category => ({
        ...category,
        apis: category.apis.filter(api => api.IsShow !== false)
      })).filter(category => category.apis.length > 0); // 过滤掉没有可显示API的分类
      
      return filteredCategories;
    } catch (error) {
      console.error('获取API模块时出错:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadApiModules = async () => {
      setLoading(true);
      const categories = await scanApiModules();
      setApiCategories(categories);
      setLoading(false);
      setMounted(true);
    };

    loadApiModules();
  }, []);

  // 处理API卡片点击
  const handleApiClick = (api) => {
    setEmbeddedApi(api);
  };

  // 关闭内嵌显示
  const closeEmbedded = () => {
    setEmbeddedApi(null);
  };

  if (!mounted || loading) {
    return (
      <Api60sContainer>
        <Container>
          <Header>
            <Title>聚合应用</Title>
            <Subtitle>
              提供各大社交平台最新的实时数据，让您摆脱平台大数据算法的干扰，走出信息茧房，涵盖热搜榜单、日更资讯、实用工具和娱乐消遣四大板块
            </Subtitle>
          </Header>
        </Container>
      </Api60sContainer>
    );
  }

  return (
    <Api60sContainer>
      <Container>
        <Header>
          <Title>聚合应用</Title>
            <Subtitle>
              <strong style={{ color: '#ffffff' }}>提供各大社交平台最新的实时数据，让您摆脱平台大数据算法的干扰，走出信息茧房，涵盖热搜榜单、日更资讯、实用工具和娱乐消遣四大板块(˘•ω•˘)</strong>
            </Subtitle>
        </Header>

        {apiCategories.length === 0 ? (
          <CategorySection>
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.8)' }}>
              <h3>暂无可用的API模块</h3>
              <p>请检查60sapi目录结构或联系管理员</p>
            </div>
          </CategorySection>
        ) : (
          apiCategories.map((category, index) => (
            <CategorySection key={index}>
              <CategoryTitle style={{ color: category.color }}>
                {category.icon}
                {category.title}
              </CategoryTitle>
              <CategoryDescription>
                {category.description}
              </CategoryDescription>
              <CategoryGrid>
                {category.apis.map((api, apiIndex) => (
                  <ApiCard
                    key={apiIndex}
                    onClick={() => handleApiClick(api)}
                    color={api.color}
                  >
                    <CardHeader>
                      <CardIcon color={category.color}>
                        {api.icon || category.icon}
                      </CardIcon>
                      <CardTitle><strong>{api.title}</strong></CardTitle>

                    </CardHeader>
                  </ApiCard>
                ))}
              </CategoryGrid>
            </CategorySection>
          ))
        )}
      </Container>
      
      {/* 使用Portal渲染独立的全屏嵌套网页 */}
      {embeddedApi && createPortal(
        <FullscreenEmbeddedPage 
          api={embeddedApi} 
          onClose={closeEmbedded} 
        />,
        document.body
      )}
    </Api60sContainer>
  );
};

export default Api60sPage;
