import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 组件
 * 监听路由变化，在页面切换时自动滚动到顶部
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 页面切换时滚动到顶部
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 立即滚动，不使用平滑动画
    });
  }, [pathname]); // 依赖于路径变化

  return null; // 这个组件不渲染任何内容
}

export default ScrollToTop;