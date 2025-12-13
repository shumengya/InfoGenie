import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FiPlay, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { SMALL_GAMES } from '../config/StaticPageConfig';

const GameContainer = styled.div`
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
  
  .title-emoji {
    margin: 0 8px;
  }
  
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

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const GameCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #4ade80;
  }
  
  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const GameHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const GameTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const GameIcon = styled.div`
  font-size: 24px;
  color: #4ade80;
  
  @media (max-width: 768px) {
    font-size: 22px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const GameDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 14px;
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 12px;
    line-height: 1.3;
  }
`;

const GameFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GameTheme = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 20px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 18px;
    border-radius: 5px;
  }
`;

const PlayButton = styled.button`
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
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
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 7px 14px;
    font-size: 13px;
    border-radius: 6px;
    gap: 5px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 5px;
    gap: 4px;
  }
`;

const LoadingCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
`;

const LoadingIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const LoadingTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
`;

// 独立全屏嵌套网页组件
const FullscreenEmbeddedPage = ({ game, onClose }) => {
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
    backgroundColor: '#4ade80',
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
        <h1 style={titleStyles}>{game.title}</h1>
        <button
          style={backButtonStyles}
          onClick={onClose}
          onMouseEnter={handleBackButtonHover}
          onMouseLeave={handleBackButtonLeave}
        >
          <FiArrowLeft size={16} />
          返回
        </button>
      </div>
      <iframe
        src={game.link}
        title={game.title}
        style={iframeStyles}
        allow="keyboard-map *"
        allowFullScreen
        loading="lazy"
        tabIndex="0"
        onLoad={(e) => {
          // 确保iframe获得焦点以接收键盘事件
          e.target.focus();
        }}
      />
    </div>
  );
};



const SmallGamePage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embeddedGame, setEmbeddedGame] = useState(null);



  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      
      // 从配置文件获取小游戏数据，过滤掉IsShow为false的游戏
      const visibleGames = SMALL_GAMES.filter(game => game.IsShow !== false);
      setGames(visibleGames);
    } catch (err) {
      console.error('获取游戏列表失败:', err);
      setError('获取游戏列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (game) => {
    // 直接使用相对路径，React会自动从public文件夹提供静态文件
    setEmbeddedGame({ ...game, link: game.link });
  };

  // 关闭内嵌显示
  const closeEmbedded = () => {
    setEmbeddedGame(null);
  };

  return (
    <GameContainer>
      <Container>
        <PageHeader>
          <PageTitle>
            休闲游戏
          </PageTitle>
          <PageDescription>
            <strong style={{ color: '#ffffff' }}>好玩的休闲小游戏合集，即点即玩，无需下载，支持离线游玩(,,・ω・,,)</strong>
          </PageDescription>
        </PageHeader>

        {loading ? (
          <LoadingCard>
            <LoadingIcon>🎮</LoadingIcon>
            <LoadingTitle>加载游戏中...</LoadingTitle>
            <LoadingText>
              正在为您准备精彩的小游戏，请稍候...
            </LoadingText>
          </LoadingCard>
        ) : error ? (
          <LoadingCard>
            <LoadingIcon>😅</LoadingIcon>
            <LoadingTitle>加载失败</LoadingTitle>
            <LoadingText>
              {error}
              <br />
              <button 
                onClick={fetchGames}
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
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
            </LoadingText>
          </LoadingCard>
        ) : games.length > 0 ? (
          <GameGrid>
            {games.map((game, index) => (
              <GameCard key={index} onClick={() => handlePlayGame(game)}>
                <GameHeader>
                  <GameTitle>{game.title}</GameTitle>
                  <GameIcon>
                    <FiPlay />
                  </GameIcon>
                </GameHeader>
                <GameDescription>{game.description}</GameDescription>
                <GameFooter>
                  <GameTheme>{game.icon}</GameTheme>
                  <PlayButton onClick={(e) => {
                    e.stopPropagation();
                    handlePlayGame(game);
                  }}>
                    <FiExternalLink />
                    开始游戏
                  </PlayButton>
                </GameFooter>
              </GameCard>
            ))}
          </GameGrid>
        ) : (
          <LoadingCard>
            <LoadingIcon>🎯</LoadingIcon>
            <LoadingTitle>暂无游戏</LoadingTitle>
            <LoadingText>
              目前还没有可用的游戏，请稍后再来查看。
            </LoadingText>
          </LoadingCard>
        )}

        {/* 使用Portal渲染独立的全屏嵌套网页 */}
        {embeddedGame && createPortal(
          <FullscreenEmbeddedPage 
            game={embeddedGame} 
            onClose={closeEmbedded} 
          />,
          document.body
        )}


      </Container>
    </GameContainer>
  );
};

export default SmallGamePage;
