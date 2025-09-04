import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  color: white;
  padding: 12px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  text-decoration: none;
  color: white;
  
  .logo-icon {
    margin-right: 8px;
    font-size: 24px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    
    .logo-icon {
      font-size: 20px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    
    .user-text {
      display: none;
    }
  }
`;

const UserAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  
  @media (max-width: 768px) {
    .user-name {
      display: none;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuContent = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: white;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  padding: 20px;
  overflow-y: auto;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const MobileMenuTitle = styled.h3`
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
`;

const MobileNavLink = styled(Link)`
  display: block;
  color: #374151;
  text-decoration: none;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  transition: color 0.2s ease;
  
  &:hover {
    color: #667eea;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Header = () => {
  const { user, isLoggedIn, logout, getQQAvatar } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo to="/">
            <span className="logo-icon">✨</span>
            神奇万事通
          </Logo>

          <Nav>
            <NavLink to="/60sapi">60s API</NavLink>
            <NavLink to="/smallgame">小游戏</NavLink>
            <NavLink to="/aimodel">AI模型</NavLink>
          </Nav>

          <UserSection>
            {isLoggedIn && user ? (
              <>
                <UserInfo>
                  {getQQAvatar(user.account) ? (
                    <UserAvatar 
                      src={getQQAvatar(user.account)} 
                      alt="QQ头像"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                  ) : null}
                  <FiUser style={{ display: getQQAvatar(user.account) ? 'none' : 'inline' }} />
                  <span className="user-name">{user.account}</span>
                </UserInfo>
                <UserButton onClick={handleLogout}>
                  <FiLogOut size={16} />
                  <span className="user-text">退出</span>
                </UserButton>
              </>
            ) : (
              <UserButton as={Link} to="/login">
                <FiUser />
                <span className="user-text">登录</span>
              </UserButton>
            )}

            <MobileMenuButton onClick={handleMenuToggle}>
              <FiMenu />
            </MobileMenuButton>
          </UserSection>
        </HeaderContent>
      </HeaderContainer>

      <MobileMenu isOpen={isMenuOpen} onClick={handleMenuClose}>
        <MobileMenuContent isOpen={isMenuOpen} onClick={(e) => e.stopPropagation()}>
          <MobileMenuHeader>
            <MobileMenuTitle>菜单</MobileMenuTitle>
            <CloseButton onClick={handleMenuClose}>
              <FiX />
            </CloseButton>
          </MobileMenuHeader>

          <MobileNavLink to="/" onClick={handleMenuClose}>
            🏠 首页
          </MobileNavLink>
          <MobileNavLink to="/60sapi" onClick={handleMenuClose}>
            📡 60s API
          </MobileNavLink>
          <MobileNavLink to="/smallgame" onClick={handleMenuClose}>
            🎮 小游戏
          </MobileNavLink>
          <MobileNavLink to="/aimodel" onClick={handleMenuClose}>
            🤖 AI模型
          </MobileNavLink>

          {isLoggedIn && user ? (
            <>
              <div style={{ 
                padding: '12px 0', 
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {getQQAvatar(user.account) ? (
                  <UserAvatar 
                    src={getQQAvatar(user.account)} 
                    alt="QQ头像"
                    style={{ width: '32px', height: '32px' }}
                  />
                ) : (
                  <FiUser size={24} color="#666" />
                )}
                <span style={{ color: '#374151', fontWeight: '500' }}>{user.account}</span>
              </div>
              <MobileNavLink as="button" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%', 
                  textAlign: 'left',
                  color: '#ef4444'
                }}
                onClick={() => {
                  handleLogout();
                  handleMenuClose();
                }}
              >
                🚪 退出登录
              </MobileNavLink>
            </>
          ) : (
            <MobileNavLink to="/login" onClick={handleMenuClose}>
              👤 登录注册
            </MobileNavLink>
          )}
        </MobileMenuContent>
      </MobileMenu>
    </>
  );
};

export default Header;
