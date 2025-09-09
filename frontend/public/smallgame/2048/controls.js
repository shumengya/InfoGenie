// 游戏控制模块 - 处理键盘和触摸输入
class GameControls {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30; // 最小滑动距离
        this.isGameActive = true;
        
        this.initializeControls();
    }
    
    initializeControls() {
        // 键盘控制
        this.initKeyboardControls();
        
        // 触摸控制
        this.initTouchControls();
        
        // 鼠标控制（用于电脑端测试）
        this.initMouseControls();
        
        // 防止页面滚动
        this.preventScrolling();
    }
    
    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive || !window.game2048) {
                console.log('Game not ready:', { isGameActive: this.isGameActive, game2048: !!window.game2048 });
                return;
            }
            
            // 防止默认行为
            const preventKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
            if (preventKeys.includes(e.key)) {
                e.preventDefault();
            }
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    window.game2048.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    window.game2048.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    window.game2048.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    window.game2048.move('right');
                    break;
                case 'r':
                case 'R':
                    // R键重新开始游戏
                    window.game2048.restart();
                    break;
                case 'Escape':
                    // ESC键暂停/继续游戏
                    this.togglePause();
                    break;
            }
        });
    }
    
    initTouchControls() {
        const gameContainer = document.querySelector('.game-container');
        
        // 触摸开始
        gameContainer.addEventListener('touchstart', (e) => {
            if (!this.isGameActive) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        // 触摸移动（可选：显示滑动方向提示）
        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // 触摸结束
        gameContainer.addEventListener('touchend', (e) => {
            if (!this.isGameActive || !window.game2048) return;
            
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.touchEndX = touch.clientX;
            this.touchEndY = touch.clientY;
            
            this.handleSwipe();
        }, { passive: false });
        
        // 触摸取消
        gameContainer.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.resetTouch();
        }, { passive: false });
    }
    
    initMouseControls() {
        const gameContainer = document.querySelector('.game-container');
        let isMouseDown = false;
        let mouseStartX = 0;
        let mouseStartY = 0;
        
        // 鼠标按下
        gameContainer.addEventListener('mousedown', (e) => {
            if (!this.isGameActive) return;
            
            isMouseDown = true;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
            e.preventDefault();
        });
        
        // 鼠标释放
        gameContainer.addEventListener('mouseup', (e) => {
            if (!this.isGameActive || !isMouseDown || !window.game2048) return;
            
            isMouseDown = false;
            const mouseEndX = e.clientX;
            const mouseEndY = e.clientY;
            
            // 使用鼠标坐标模拟触摸
            this.touchStartX = mouseStartX;
            this.touchStartY = mouseStartY;
            this.touchEndX = mouseEndX;
            this.touchEndY = mouseEndY;
            
            this.handleSwipe();
            e.preventDefault();
        });
        
        // 鼠标离开游戏区域
        gameContainer.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });
        
        // 防止右键菜单
        gameContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // 检查是否达到最小滑动距离
        if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
            this.resetTouch();
            return;
        }
        
        // 确定滑动方向
        let direction = null;
        
        if (absDeltaX > absDeltaY) {
            // 水平滑动
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            // 垂直滑动
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // 执行移动
        if (direction && window.game2048) {
            window.game2048.move(direction);
            
            // 添加触觉反馈（如果支持）
            this.addHapticFeedback();
            
            // 添加视觉反馈
            this.addVisualFeedback(direction);
        }
        
        this.resetTouch();
    }
    
    resetTouch() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
    }
    
    addHapticFeedback() {
        // 添加触觉反馈（仅在支持的设备上）
        if (navigator.vibrate) {
            navigator.vibrate(50); // 50ms的轻微震动
        }
    }
    
    addVisualFeedback(direction) {
        // 添加方向指示的视觉反馈
        const gameContainer = document.querySelector('.game-container');
        const feedback = document.createElement('div');
        
        feedback.className = 'swipe-feedback';
        feedback.textContent = this.getDirectionArrow(direction);
        
        // 设置样式
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: rgba(255, 255, 255, 0.8);
            pointer-events: none;
            z-index: 1000;
            animation: swipeFeedback 0.3s ease-out;
        `;
        
        gameContainer.appendChild(feedback);
        
        // 添加动画样式（如果不存在）
        if (!document.getElementById('swipe-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'swipe-feedback-styles';
            style.textContent = `
                @keyframes swipeFeedback {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    50% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 移除反馈元素
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 300);
    }
    
    getDirectionArrow(direction) {
        const arrows = {
            'up': '↑',
            'down': '↓',
            'left': '←',
            'right': '→'
        };
        return arrows[direction] || '';
    }
    
    preventScrolling() {
        // 防止页面滚动，特别是在移动设备上
        document.addEventListener('touchmove', (e) => {
            // 只在游戏容器内防止滚动
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer && gameContainer.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 防止双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 防止长按选择文本
        document.addEventListener('selectstart', (e) => {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer && gameContainer.contains(e.target)) {
                e.preventDefault();
            }
        });
    }
    
    togglePause() {
        this.isGameActive = !this.isGameActive;
        
        const pauseOverlay = document.getElementById('pause-overlay') || this.createPauseOverlay();
        
        if (this.isGameActive) {
            pauseOverlay.style.display = 'none';
            // 恢复计时器
            if (window.game2048 && window.game2048.stats.startTime) {
                const pausedTime = Date.now() - window.game2048.pauseStartTime;
                window.game2048.stats.startTime += pausedTime;
            }
        } else {
            pauseOverlay.style.display = 'flex';
            // 记录暂停时间
            if (window.game2048) {
                window.game2048.pauseStartTime = Date.now();
            }
        }
    }
    
    createPauseOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'pause-overlay';
        overlay.innerHTML = `
            <div class="pause-content">
                <h2>游戏暂停</h2>
                <p>按ESC键或点击继续游戏</p>
                <button class="resume-btn">继续游戏</button>
            </div>
        `;
        
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        const pauseContent = overlay.querySelector('.pause-content');
        pauseContent.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        const resumeBtn = overlay.querySelector('.resume-btn');
        resumeBtn.style.cssText = `
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
        `;
        
        // 继续游戏按钮事件
        resumeBtn.addEventListener('click', () => {
            this.togglePause();
        });
        
        // 点击背景继续游戏
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.togglePause();
            }
        });
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // 禁用控制（游戏结束时调用）
    disable() {
        this.isGameActive = false;
    }
    
    // 启用控制（游戏开始时调用）
    enable() {
        this.isGameActive = true;
    }
    
    // 显示控制提示
    showControlHints() {
        const hints = document.createElement('div');
        hints.className = 'control-hints';
        hints.innerHTML = `
            <div class="hint-content">
                <h3>操作说明</h3>
                <div class="hint-section">
                    <h4>📱 手机操作</h4>
                    <p>在游戏区域滑动手指移动方块</p>
                    <div class="gesture-demo">
                        <span>👆 上滑</span>
                        <span>👇 下滑</span>
                        <span>👈 左滑</span>
                        <span>👉 右滑</span>
                    </div>
                </div>
                <div class="hint-section">
                    <h4>⌨️ 键盘操作</h4>
                    <div class="key-demo">
                        <div class="key-row">
                            <span class="key">↑</span>
                            <span class="key">W</span>
                            <span>上移</span>
                        </div>
                        <div class="key-row">
                            <span class="key">↓</span>
                            <span class="key">S</span>
                            <span>下移</span>
                        </div>
                        <div class="key-row">
                            <span class="key">←</span>
                            <span class="key">A</span>
                            <span>左移</span>
                        </div>
                        <div class="key-row">
                            <span class="key">→</span>
                            <span class="key">D</span>
                            <span>右移</span>
                        </div>
                        <div class="key-row">
                            <span class="key">R</span>
                            <span>重新开始</span>
                        </div>
                        <div class="key-row">
                            <span class="key">ESC</span>
                            <span>暂停/继续</span>
                        </div>
                    </div>
                </div>
                <button class="close-hints">知道了</button>
            </div>
        `;
        
        // 添加样式
        hints.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        document.body.appendChild(hints);
        
        // 关闭按钮事件
        hints.querySelector('.close-hints').addEventListener('click', () => {
            hints.remove();
        });
        
        // 点击背景关闭
        hints.addEventListener('click', (e) => {
            if (e.target === hints) {
                hints.remove();
            }
        });
    }
}

// 创建全局控制实例
let gameControls;

// 页面加载完成后初始化控制
document.addEventListener('DOMContentLoaded', () => {
    // 等待游戏对象初始化完成
    const initControls = () => {
        if (window.game2048) {
            gameControls = new GameControls();
            console.log('Game controls initialized successfully');
            
            // 创建帮助按钮
            createHelpButton();
        } else {
            console.log('Waiting for game2048 to initialize...');
            setTimeout(initControls, 100);
        }
    };
    
    initControls();
});

// 创建帮助按钮函数
function createHelpButton() {
    const helpBtn = document.createElement('button');
    helpBtn.textContent = '❓';
    helpBtn.title = '操作说明';
    helpBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    helpBtn.addEventListener('click', () => {
        gameControls.showControlHints();
    });
    
    helpBtn.addEventListener('mouseenter', () => {
        helpBtn.style.transform = 'scale(1.1)';
    });
    
    helpBtn.addEventListener('mouseleave', () => {
        helpBtn.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(helpBtn);
}

// 导出控制实例
window.gameControls = gameControls;