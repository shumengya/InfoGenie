// 静态页面配置文件
// 统一管理所有静态网页的链接和配置信息

export const AI_MODEL_APPS = [
  {
    title: 'AI变量命名助手',
    description: '智能变量命名工具，帮助开发者快速生成规范的变量名',
    link: '/aimodelapp/AI变量命名助手/index.html',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🤖'
  },
  {
    title: 'AI写诗小助手',
    description: 'AI创作诗歌助手，体验古典诗词的魅力',
    link: '/aimodelapp/AI写诗小助手/index.html',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '📝'
  },
  {
    title: 'AI姓名评测',
    description: '基于AI的姓名分析和评测工具',
    link: '/aimodelapp/AI姓名评测/index.html',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '👤'
  }
];

export const SMALL_GAMES = [
  {
    title: '2048',
    description: '经典数字合并游戏，挑战你的策略思维',
    link: '/smallgame/2048/index.html',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🔢'
  },
  {
    title: '别踩白方块',
    description: '节奏感游戏，考验你的反应速度和手指协调',
    link: '/smallgame/别踩白方块/index.html',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '⚫'
  },
  {
    title: '俄罗斯方块',
    description: '经典落块消除游戏，永恒的经典之作',
    link: '/smallgame/俄罗斯方块/index.html',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🧩'
  }
];

export const API_60S_CATEGORIES = [
  {
    title: '热搜榜单',
    icon: '🔥',
    color: '#ff6b6b',
    apis: [
      { title: '哔哩哔哩热搜榜', link: '/60sapi/热搜榜单/哔哩哔哩热搜榜/index.html' },
      { title: '抖音热搜榜', link: '/60sapi/热搜榜单/抖音热搜榜/index.html' },
      { title: '猫眼票房排行榜', link: '/60sapi/热搜榜单/猫眼票房排行榜/index.html' },
      { title: '头条热搜榜', link: '/60sapi/热搜榜单/头条热搜榜/index.html' },
      { title: '网易云榜单', link: '/60sapi/热搜榜单/网易云榜单/index.html' },
      { title: '微博热搜榜', link: '/60sapi/热搜榜单/微博热搜榜/index.html' },
      { title: '知乎热门话题', link: '/60sapi/热搜榜单/知乎热门话题/index.html' },
      { title: 'Hacker News 榜单', link: '/60sapi/热搜榜单/Hacker News 榜单/index.html' }
    ]
  },
  {
    title: '日更资讯',
    icon: '📰',
    color: '#4ecdc4',
    apis: [
      { title: '必应每日壁纸', link: '/60sapi/日更资讯/必应每日壁纸/index.html' },
      { title: '历史上的今天', link: '/60sapi/日更资讯/历史上的今天/index.html' },
      { title: '每日国际汇率', link: '/60sapi/日更资讯/每日国际汇率/index.html' },
      { title: '每天60s读懂世界', link: '/60sapi/日更资讯/每天60s读懂世界/index.html' }
    ]
  },
  {
    title: '实用功能',
    icon: '🛠️',
    color: '#45b7d1',
    apis: [
      { title: '百度百科词条', link: '/60sapi/实用功能/百度百科词条/index.html' },
      { title: '公网IP地址', link: '/60sapi/实用功能/公网IP地址/index.html' },
      { title: '哈希解压压缩', link: '/60sapi/实用功能/哈希解压压缩/index.html' },
      { title: '链接OG信息', link: '/60sapi/实用功能/链接OG信息/index.html' },
      { title: '密码强度检测', link: '/60sapi/实用功能/密码强度检测/index.html' },
      { title: '农历信息', link: '/60sapi/实用功能/农历信息/index.html' },
      { title: '配色方案', link: '/60sapi/实用功能/配色方案/index.html' },
      { title: '身体健康分析', link: '/60sapi/实用功能/身体健康分析/index.html' },
      { title: '生成二维码', link: '/60sapi/实用功能/生成二维码/index.html' },
      { title: '随机密码生成器', link: '/60sapi/实用功能/随机密码生成器/index.html' },
      { title: '随机颜色', link: '/60sapi/实用功能/随机颜色/index.html' },
      { title: '天气预报', link: '/60sapi/实用功能/天气预报/index.html' },
      { title: 'EpicGames免费游戏', link: '/60sapi/实用功能/EpicGames免费游戏/index.html' }
    ]
  },
  {
    title: '娱乐消遣',
    icon: '🎉',
    color: '#f7b731',
    apis: [
      { title: '随机唱歌音频', link: '/60sapi/娱乐消遣/随机唱歌音频/index.html' },
      { title: '随机发病文学', link: '/60sapi/娱乐消遣/随机发病文学/index.html' },
      { title: '随机搞笑段子', link: '/60sapi/娱乐消遣/随机搞笑段子/index.html' },
      { title: '随机冷笑话', link: '/60sapi/娱乐消遣/随机冷笑话/index.html' },
      { title: '随机一言', link: '/60sapi/娱乐消遣/随机一言/index.html' },
      { title: '随机运势', link: '/60sapi/娱乐消遣/随机运势/index.html' },
      { title: '随机JavaScript趣味题', link: '/60sapi/娱乐消遣/随机JavaScript趣味题/index.html' },
      { title: '随机KFC文案', link: '/60sapi/娱乐消遣/随机KFC文案/index.html' }
    ]
  }
];

// 辅助函数：根据分类名获取配置
export const getApiCategoryByName = (categoryName) => {
  return API_60S_CATEGORIES.find(category => category.title === categoryName);
};

// 辅助函数：根据游戏名获取配置
export const getGameByName = (gameName) => {
  return SMALL_GAMES.find(game => game.title === gameName);
};

// 辅助函数：根据AI应用名获取配置
export const getAiAppByName = (appName) => {
  return AI_MODEL_APPS.find(app => app.title === appName);
};

// 辅助函数：获取所有静态页面链接
export const getAllStaticLinks = () => {
  const aiLinks = AI_MODEL_APPS.map(app => app.link);
  const gameLinks = SMALL_GAMES.map(game => game.link);
  const apiLinks = API_60S_CATEGORIES.flatMap(category => 
    category.apis.map(api => api.link)
  );
  
  return [...aiLinks, ...gameLinks, ...apiLinks];
};

// 默认导出配置对象
const StaticPageConfig = {
  AI_MODEL_APPS,
  SMALL_GAMES,
  API_60S_CATEGORIES,
  getApiCategoryByName,
  getGameByName,
  getAiAppByName,
  getAllStaticLinks
};

export default StaticPageConfig;
