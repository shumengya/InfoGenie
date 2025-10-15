import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';

const ParticleContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
`;

const ParticleEffect = () => {
  const containerRef = useRef(null);
  const particleId = useRef(0);

  const colors = useMemo(() => [
    '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9',
    '#66bb6a', '#8bc34a', '#cddc39', '#ffeb3b',
    '#ffc107', '#ff9800', '#ff5722', '#e91e63',
    '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688', '#4caf50'
  ], []);

  const createParticle = useCallback((x, y) => {
    if (!containerRef.current) return;

    const particleCount = Math.random() * 8 + 6; // 6-14个粒子
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-particle';
      particle.id = `particle-${particleId.current++}`;
      
      // 随机颜色
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // 随机大小
      const size = Math.random() * 8 + 4; // 4-12px
      
      // 随机方向和距离
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const distance = Math.random() * 100 + 50; // 50-150px
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - Math.random() * 50; // 向上偏移
      
      // 设置样式
      particle.style.cssText = `
        position: absolute;
        left: ${x - size/2}px;
        top: ${y - size/2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 6px ${color}40;
        --dx: ${dx}px;
        --dy: ${dy}px;
        animation: particleAnimation 1.2s ease-out forwards;
        z-index: 9999;
      `;
      
      containerRef.current.appendChild(particle);
      
      // 动画结束后移除粒子
      setTimeout(() => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1200);
    }
  }, [colors]);

  const createRipple = useCallback((x, y) => {
    if (!containerRef.current) return;

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.id = `ripple-${particleId.current++}`;
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: radial-gradient(circle, ${color}20 0%, transparent 70%);
      border: 2px solid ${color}40;
      pointer-events: none;
      animation: rippleAnimation 0.8s ease-out forwards;
      z-index: 9998;
      transform: translate(-50%, -50%);
    `;
    
    // 添加涟漪动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rippleAnimation {
        0% {
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          width: 100px;
          height: 100px;
          opacity: 0;
        }
      }
    `;
    
    if (!document.querySelector('#ripple-animation-style')) {
      style.id = 'ripple-animation-style';
      document.head.appendChild(style);
    }
    
    containerRef.current.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple && ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  }, [colors]);

  const handleClick = useCallback((event) => {
    const x = event.clientX;
    const y = event.clientY;
    
    // 创建粒子效果
    createParticle(x, y);
    
    // 创建涟漪效果
    createRipple(x, y);
  }, [createParticle, createRipple]);

  useEffect(() => {
    // 添加全局点击监听器
    document.addEventListener('click', handleClick);
    
    // 添加粒子动画样式
    const style = document.createElement('style');
    style.id = 'particle-animation-style';
    style.textContent = `
      @keyframes particleAnimation {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--dx), var(--dy)) scale(0);
          opacity: 0;
        }
      }
      
      .click-particle {
        animation: particleAnimation 1.2s ease-out forwards;
      }
      
      .click-ripple {
        animation: rippleAnimation 0.8s ease-out forwards;
      }
    `;
    
    if (!document.querySelector('#particle-animation-style')) {
      document.head.appendChild(style);
    }
    
    return () => {
      document.removeEventListener('click', handleClick);
      
      // 清理样式
      const existingStyle = document.querySelector('#particle-animation-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const rippleStyle = document.querySelector('#ripple-animation-style');
      if (rippleStyle) {
        rippleStyle.remove();
      }
    };
  }, [handleClick]);

  return <ParticleContainer ref={containerRef} />;
};

export default ParticleEffect;