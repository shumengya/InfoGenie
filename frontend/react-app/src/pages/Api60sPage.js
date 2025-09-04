import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiActivity, FiStar, FiExternalLink, FiArrowLeft } from 'react-icons/fi';

const Api60sContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: 20px 0;
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
  font-size: 32px;
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
`;

const CategoryTitle = styled.h2`
  color: rgba(255, 255, 255, 0.95);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const ApiCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  min-height: 80px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)'};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ExternalIcon = styled.div`
  font-size: 14px;
  color: #81c784;
  opacity: 0.7;
  flex-shrink: 0;
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
  background: linear-gradient(135deg, #4caf50, #66bb6a);
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

const Api60sPage = () => {
  const [mounted, setMounted] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [embeddedApi, setEmbeddedApi] = useState(null);

  // 动态扫描60sapi文件夹
  const scanApiModules = async () => {
    try {
      // 定义分类配置
      const categoryConfig = {
        '热搜榜单': {
          icon: <FiStar />,
          color: '#66bb6a'
        },
        '日更资讯': {
          icon: <FiStar />,
          color: '#4caf50'
        },
        '实用功能': {
          icon: <FiStar />,
          color: '#388e3c'
        },
        '娱乐消遣': {
          icon: <FiActivity />,
          color: '#66bb6a'
        }
      };

      // 颜色渐变配置
      const gradientColors = [
        'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
        'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
        'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
        'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
        'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
      ];

      // 从后端API获取目录结构
      const scanDirectories = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/60s/scan-directories');
          if (response.ok) {
            const data = await response.json();
            return data;
          }
        } catch (error) {
          console.warn('无法从后端获取目录结构，使用前端扫描方式');
        }
        return null;
      };

      // 前端扫描方式（备用）
      const frontendScan = async () => {
        const categories = [];
        
        for (const [categoryName, config] of Object.entries(categoryConfig)) {
          const apis = [];
          
          // 尝试访问已知的模块列表（只包含实际存在的模块）
          const knownModules = {
            '热搜榜单': ['抖音热搜榜'],
            '日更资讯': [],
            '实用功能': [],
            '娱乐消遣': []
          };

          const moduleNames = knownModules[categoryName] || [];
          
          for (let i = 0; i < moduleNames.length; i++) {
            const moduleName = moduleNames[i];
            try {
              const indexPath = `/60sapi/${categoryName}/${moduleName}/index.html`;
              const fullUrl = `http://localhost:5000${indexPath}`;
              const response = await fetch(fullUrl, { method: 'HEAD' });
              
              if (response.ok) {
                // 获取页面标题
                const htmlResponse = await fetch(fullUrl);
                const html = await htmlResponse.text();
                const titleMatch = html.match(/<title>(.*?)<\/title>/i);
                const title = titleMatch ? titleMatch[1].trim() : moduleName;
                
                apis.push({
                  title,
                  description: `${moduleName}相关功能`,
                  link: fullUrl,
                  status: 'active',
                  color: gradientColors[i % gradientColors.length]
                });
              }
            } catch (error) {
              // 忽略访问失败的模块
            }
          }
          
          if (apis.length > 0) {
            categories.push({
              title: categoryName,
              icon: config.icon,
              color: config.color,
              apis
            });
          }
        }
        
        return categories;
      };

      // 首先尝试后端扫描，失败则使用前端扫描
      const backendResult = await scanDirectories();
      if (backendResult && backendResult.success) {
        return backendResult.categories || [];
      } else {
        return await frontendScan();
      }
      
    } catch (error) {
      console.error('扫描API模块时出错:', error);
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
            <Title>60s API 数据聚合</Title>
            <Subtitle>正在加载API模块...</Subtitle>
          </Header>
        </Container>
      </Api60sContainer>
    );
  }

  return (
    <Api60sContainer>
      <Container>
        <Header>
          <Title>60s API 数据聚合</Title>
          <Subtitle>
            提供丰富的实时数据接口，涵盖热搜榜单、日更资讯、实用工具和娱乐功能
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
              <CategoryGrid>
                {category.apis.map((api, apiIndex) => (
                  <ApiCard
                    key={apiIndex}
                    onClick={() => handleApiClick(api)}
                    color={api.color}
                  >
                    <CardHeader>
                      <CardIcon color={category.color}>
                        {category.icon}
                      </CardIcon>
                      <CardTitle>{api.title}</CardTitle>
                      <ExternalIcon>
                        <FiExternalLink />
                      </ExternalIcon>
                    </CardHeader>
                  </ApiCard>
                ))}
              </CategoryGrid>
            </CategorySection>
          ))
        )}
      </Container>
      
      {/* 内嵌显示组件 */}
      {embeddedApi && (
        <EmbeddedContainer onClick={closeEmbedded}>
          <EmbeddedContent onClick={(e) => e.stopPropagation()}>
            <EmbeddedHeader>
              <h3>{embeddedApi.title}</h3>
              <BackButton onClick={closeEmbedded}>
                <FiArrowLeft />
                返回
              </BackButton>
            </EmbeddedHeader>
            <EmbeddedFrame
              src={embeddedApi.link}
              title={embeddedApi.title}
            />
          </EmbeddedContent>
        </EmbeddedContainer>
      )}
    </Api60sContainer>
  );
};

export default Api60sPage;
