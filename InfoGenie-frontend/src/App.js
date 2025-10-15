import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';

// 页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Api60sPage from './pages/Api60sPage';
import SmallGamePage from './pages/SmallGamePage';
import AiModelPage from './pages/AiModelPage';
import UserProfilePage from './pages/UserProfilePage';
import AboutPage from './pages/AboutPage';

// 公共组件
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ParticleEffect from './components/ParticleEffect';
import ScrollToTop from './components/ScrollToTop';

// 上下文
import { UserProvider } from './contexts/UserContext';

// 样式
import './styles/global.css';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3a5 100%);
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0;
  margin: 0;
`;

function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <AppContainer>
          <Header />
          <MainContent>
            <Routes>
              {/* 主要页面 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/60sapi" element={<Api60sPage />} />
              <Route path="/smallgame" element={<SmallGamePage />} />
              <Route path="/aimodel" element={<AiModelPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              {/* 通配符路由 - 所有未匹配的路径都重定向到首页 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainContent>
          <Navigation />
          <Footer />
          
          {/* 全局提示组件 */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '14px'
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff'
                }
              }
            }}
          />
          
          {/* 全局粒子效果 */}
          <ParticleEffect />
        </AppContainer>
      </Router>
    </UserProvider>
  );
}

export default App;
