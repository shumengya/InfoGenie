import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiActivity, FiGrid, FiCpu, FiUser } from 'react-icons/fi';

const NavigationContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(168, 230, 207, 0.3);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(168, 230, 207, 0.2);
  backdrop-filter: blur(15px);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavList = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 16px;
`;

const NavItem = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${props => props.isActive ? '#66bb6a' : '#6b7280'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 10px 14px;
  border-radius: 16px;
  min-width: 64px;
  position: relative;
  overflow: hidden;
  
  /* 基础状态 */
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, rgba(102, 187, 106, 0.15), rgba(129, 199, 132, 0.1))' 
    : 'transparent'};
  box-shadow: ${props => props.isActive 
    ? '0 2px 8px rgba(102, 187, 106, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
    : '0 0 0 rgba(0, 0, 0, 0)'};
  transform: ${props => props.isActive ? 'translateY(-2px)' : 'translateY(0)'};
  
  /* 伪元素用于悬停效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 187, 106, 0.1), rgba(129, 199, 132, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 16px;
  }
  
  &:hover {
    color: #66bb6a;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.25), 
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    transition: all 0.1s ease;
  }
  
  .nav-icon {
    font-size: 22px;
    margin-bottom: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    filter: ${props => props.isActive ? 'drop-shadow(0 1px 2px rgba(102, 187, 106, 0.3))' : 'none'};
  }
  
  .nav-text {
    font-size: 11px;
    font-weight: ${props => props.isActive ? '600' : '500'};
    line-height: 1;
    position: relative;
    z-index: 1;
    text-shadow: ${props => props.isActive ? '0 1px 2px rgba(102, 187, 106, 0.2)' : 'none'};
  }
  
  ${props => props.isActive && `
    .nav-icon {
      transform: scale(1.15) rotate(5deg);
      animation: bounce 0.6s ease;
    }
    
    .nav-text {
      animation: fadeInUp 0.4s ease 0.1s both;
    }
  `}
  
  &:hover .nav-icon {
    transform: scale(1.2) rotate(-2deg);
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: scale(1.15) rotate(5deg) translateY(0);
    }
    40%, 43% {
      transform: scale(1.15) rotate(5deg) translateY(-4px);
    }
    70% {
      transform: scale(1.15) rotate(5deg) translateY(-2px);
    }
    90% {
      transform: scale(1.15) rotate(5deg) translateY(-1px);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: FiHome,
      text: '首页',
      exact: true
    },
    {
      path: '/60sapi',
      icon: FiActivity,
      text: '聚合应用'
    },
    {
      path: '/smallgame',
      icon: FiGrid,
      text: '休闲游戏'
    },
    {
      path: '/aimodel',
      icon: FiCpu,
      text: 'AI工具'
    },
    {
      path: '/profile',
      icon: FiUser,
      text: '个人中心'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <NavigationContainer>
      <NavList>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path, item.exact);
          
          return (
            <NavItem
              key={item.path}
              to={item.path}
              isActive={active}
            >
              <IconComponent className="nav-icon" />
              <span className="nav-text">{item.text}</span>
            </NavItem>
          );
        })}
      </NavList>
    </NavigationContainer>
  );
};

export default Navigation;
