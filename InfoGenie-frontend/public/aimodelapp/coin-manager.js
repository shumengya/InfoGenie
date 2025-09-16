/**
 * InfoGenie 萌芽币管理工具
 * 此模块负责管理用户AI功能的萌芽币余额和消费
 * 为所有AI模型应用提供统一的萌芽币检查和显示功能
 */

class CoinManager {
  constructor() {
    // 状态变量
    this.coins = 0;
    this.aiCost = 100;
    this.canUseAi = false;
    this.username = '';
    this.usageCount = 0;
    this.recentUsage = [];
    this.isLoaded = false;
    this.isLoading = false;
    this.error = null;

    // UI元素
    this.coinInfoContainer = null;
    
    // 初始化
    this.init();
  }

  /**
   * 初始化萌芽币管理器
   */
  async init() {
    // 创建UI元素
    this.createCoinInfoUI();
    
    // 加载萌芽币信息
    await this.loadCoinsInfo();

    // 监听网络状态变化
    window.addEventListener('online', () => this.loadCoinsInfo());
  }

  /**
   * 创建萌芽币信息UI
   */
  createCoinInfoUI() {
    // 检查是否已创建
    if (this.coinInfoContainer) {
      return;
    }

    // 创建容器
    this.coinInfoContainer = document.createElement('div');
    this.coinInfoContainer.className = 'coin-info-container';
    this.coinInfoContainer.style = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 300px;
      transition: all 0.3s ease;
      border: 1px solid rgba(74, 222, 128, 0.4);
    `;

    // 更新UI内容
    this.updateCoinInfoUI();

    // 添加到页面
    document.body.appendChild(this.coinInfoContainer);
  }

  /**
   * 更新萌芽币信息UI
   */
  updateCoinInfoUI() {
    if (!this.coinInfoContainer) {
      return;
    }

    let content = '';

    if (this.isLoading) {
      content = '<div style="text-align: center; padding: 10px;">加载中...</div>';
    } else if (this.error) {
      content = `
        <div style="color: #d32f2f; text-align: center; padding: 10px;">
          <div style="font-weight: bold; margin-bottom: 5px;">加载失败</div>
          <div style="font-size: 12px;">${this.error}</div>
          <button 
            onclick="coinManager.loadCoinsInfo()" 
            style="
              background: #4ade80;
              color: white;
              border: none;
              padding: 5px 10px;
              border-radius: 4px;
              margin-top: 8px;
              cursor: pointer;
            "
          >
            重试
          </button>
        </div>
      `;
    } else if (!this.isLoaded) {
      content = '<div style="text-align: center; padding: 10px;">正在检查萌芽币余额...</div>';
    } else {
      const usageHistory = this.recentUsage.length > 0 
        ? `
          <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">最近使用记录:</div>
            ${this.recentUsage.map(usage => `
              <div style="font-size: 11px; color: #555; margin: 3px 0;">
                ${this.formatApiType(usage.api_type)} (-${usage.cost}币)
                <span style="color: #999; float: right;">${this.formatDate(usage.timestamp)}</span>
              </div>
            `).join('')}
          </div>
        `
        : '';
      
      content = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: bold; color: #333;">${this.username || '用户'}的萌芽币</div>
          <div style="
            background: ${this.canUseAi ? '#4ade80' : '#ef4444'};
            color: white;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 10px;
          ">
            ${this.canUseAi ? '可使用' : '币不足'}
          </div>
        </div>
        
        <div style="margin: 10px 0; display: flex; align-items: center; justify-content: center;">
          <div style="
            font-size: 28px;
            font-weight: bold;
            color: ${this.canUseAi ? '#16a34a' : '#dc2626'};
          ">
            ${this.coins}
          </div>
          <div style="margin-left: 5px; font-size: 12px; color: #666;">萌芽币</div>
        </div>
        
        <div style="font-size: 12px; color: #666; text-align: center;">
          AI功能每次使用消耗 <b>${this.aiCost}</b> 萌芽币
        </div>
        
        ${usageHistory}
      `;
    }

    this.coinInfoContainer.innerHTML = content;
  }

  /**
   * 加载萌芽币信息
   */
  async loadCoinsInfo() {
    try {
      this.isLoading = true;
      this.error = null;
      this.updateCoinInfoUI();
      
      // 获取JWT token
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.error = '未登录，无法获取萌芽币信息';
        this.isLoading = false;
        this.updateCoinInfoUI();
        return;
      }
      
      // 调用API
      const response = await fetch('/api/aimodelapp/coins', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '获取萌芽币信息失败');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 更新状态
        this.coins = data.data.coins;
        this.aiCost = data.data.ai_cost;
        this.canUseAi = data.data.can_use_ai;
        this.username = data.data.username;
        this.usageCount = data.data.usage_count;
        this.recentUsage = data.data.recent_usage || [];
        this.isLoaded = true;
      } else {
        throw new Error(data.message || '获取萌芽币信息失败');
      }
    } catch (error) {
      console.error('加载萌芽币信息失败:', error);
      this.error = error.message || '获取萌芽币信息失败';
    } finally {
      this.isLoading = false;
      this.updateCoinInfoUI();
    }
  }

  /**
   * 格式化API类型
   */
  formatApiType(apiType) {
    const typeMap = {
      'chat': 'AI聊天',
      'name-analysis': '姓名评测',
      'variable-naming': '变量命名',
      'poetry': 'AI写诗',
      'translation': 'AI翻译',
      'classical_conversion': '文言文转换',
      'expression-maker': '表情制作',
      'linux-command': 'Linux命令'
    };
    
    return typeMap[apiType] || apiType;
  }

  /**
   * 格式化日期
   */
  formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return isoString;
    }
  }

  /**
   * 检查是否有足够的萌芽币
   */
  hasEnoughCoins() {
    return this.canUseAi;
  }

  /**
   * 显示萌芽币不足提示
   */
  showInsufficientCoinsMessage() {
    alert(`萌芽币余额不足！\n当前余额：${this.coins}，需要：${this.aiCost}\n请通过每日签到等方式获取更多萌芽币。`);
  }

  /**
   * 在API调用前检查萌芽币
   * @returns {boolean} 是否有足够的萌芽币
   */
  checkBeforeApiCall() {
    // 强制刷新萌芽币状态
    this.loadCoinsInfo().then(() => {
      // 检查余额
      if (!this.hasEnoughCoins()) {
        this.showInsufficientCoinsMessage();
        return false;
      }
      return true;
    });
    
    // 使用当前缓存的状态进行快速检查
    if (!this.hasEnoughCoins()) {
      this.showInsufficientCoinsMessage();
      return false;
    }
    return true;
  }
}

// 创建全局实例
const coinManager = new window.CoinManager = new CoinManager();

// 导出实例
export default coinManager;
