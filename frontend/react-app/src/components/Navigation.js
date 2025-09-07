import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiActivity, FiGrid, FiCpu } from 'react-icons/fi';

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
  transition: all 0.2s ease;
  padding: 8px 12px;
  border-radius: 12px;
  min-width: 60px;
  
  &:hover {
    color: #66bb6a;
    background: rgba(129, 199, 132, 0.1);
  }
  
  .nav-icon {
    font-size: 20px;
    margin-bottom: 4px;
    transition: transform 0.2s ease;
  }
  
  .nav-text {
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
  }
  
  ${props => props.isActive && `
    .nav-icon {
      transform: scale(1.1);
    }
  `}
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
      text: 'API聚合应用'
    },
    {
      path: '/smallgame',
      icon: FiGrid,
      text: '玩玩小游戏'
    },
    {
      path: '/aimodel',
      icon: FiCpu,
      text: 'AI工具'
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
