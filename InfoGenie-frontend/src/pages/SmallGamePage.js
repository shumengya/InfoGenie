import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlay, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { SMALL_GAMES } from '../config/StaticPageConfig';

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
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  
  .title-emoji {
    margin: 0 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
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
`;

const GameIcon = styled.div`
  font-size: 24px;
  color: #4ade80;
`;

const GameDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
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
  background: linear-gradient(135deg, #4ade80, #22c55e);
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
            玩玩小游戏
          </PageTitle>
          <PageDescription>
            轻松有趣的休闲小游戏合集，即点即玩，无需下载
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

        {/* 内嵌显示组件 */}
        {embeddedGame && (
          <EmbeddedContainer onClick={closeEmbedded}>
            <EmbeddedContent onClick={(e) => e.stopPropagation()}>
              <EmbeddedHeader>
                <h3>{embeddedGame.title}</h3>
                <BackButton onClick={closeEmbedded}>
                  <FiArrowLeft />
                  返回
                </BackButton>
              </EmbeddedHeader>
              <EmbeddedFrame
                src={embeddedGame.link}
                title={embeddedGame.title}
              />
            </EmbeddedContent>
          </EmbeddedContainer>
        )}


      </Container>
    </GameContainer>
  );
};

export default SmallGamePage;
