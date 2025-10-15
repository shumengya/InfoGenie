class GameControls {
    constructor(game) {
        this.game = game;
        this.initControls();
        this.initTouchControls();
    }
    
    initControls() {
        // 重新开始按钮
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.game.restart();
        });
        
        // 键盘快捷键
        this.initKeyboardShortcuts();
    }
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'r':
                case 'R':
                    if (this.game.gameOver) {
                        this.game.restart();
                    }
                    break;
            }
        });
    }
    
    initTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        let isDragging = false;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let lastDirectionChange = 0;
        const directionChangeDelay = 200; // 防止方向变化过快
        
        // 触摸开始
        canvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        // 拖动过程中实时检测方向
        canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentTime = Date.now();
            if (currentTime - lastDirectionChange < directionChangeDelay) {
                e.preventDefault();
                return;
            }
            
            const currentTouchX = e.touches[0].clientX;
            const currentTouchY = e.touches[0].clientY;
            
            const deltaX = currentTouchX - lastTouchX;
            const deltaY = currentTouchY - lastTouchY;
            const minDragDistance = 20; // 最小拖动距离
            
            // 检查是否达到最小拖动距离
            if (Math.abs(deltaX) > minDragDistance || Math.abs(deltaY) > minDragDistance) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 水平拖动
                    if (deltaX > 0) {
                        this.game.changeDirection(1, 0); // 向右拖动
                    } else {
                        this.game.changeDirection(-1, 0); // 向左拖动
                    }
                } else {
                    // 垂直拖动
                    if (deltaY > 0) {
                        this.game.changeDirection(0, 1); // 向下拖动
                    } else {
                        this.game.changeDirection(0, -1); // 向上拖动
                    }
                }
                
                // 更新最后触摸位置和方向变化时间
                lastTouchX = currentTouchX;
                lastTouchY = currentTouchY;
                lastDirectionChange = currentTime;
                
                // 添加触觉反馈
                this.vibrate(30);
            }
            
            e.preventDefault();
        }, { passive: false });
        
        // 触摸结束
        canvas.addEventListener('touchend', (e) => {
            isDragging = false;
            e.preventDefault();
        }, { passive: false });
        
        // 触摸取消
        canvas.addEventListener('touchcancel', (e) => {
            isDragging = false;
            e.preventDefault();
        }, { passive: false });
        
        // 防止移动端页面滚动
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.game-container')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 添加鼠标拖动支持（用于桌面测试）
        this.initMouseDragControls(canvas);
    }
    
    // 鼠标拖动控制（用于桌面测试）
    initMouseDragControls(canvas) {
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let lastDirectionChange = 0;
        const directionChangeDelay = 200;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            e.preventDefault();
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const currentTime = Date.now();
            if (currentTime - lastDirectionChange < directionChangeDelay) {
                return;
            }
            
            const currentMouseX = e.clientX;
            const currentMouseY = e.clientY;
            
            const deltaX = currentMouseX - lastMouseX;
            const deltaY = currentMouseY - lastMouseY;
            const minDragDistance = 20;
            
            if (Math.abs(deltaX) > minDragDistance || Math.abs(deltaY) > minDragDistance) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        this.game.changeDirection(1, 0); // 向右拖动
                    } else {
                        this.game.changeDirection(-1, 0); // 向左拖动
                    }
                } else {
                    if (deltaY > 0) {
                        this.game.changeDirection(0, 1); // 向下拖动
                    } else {
                        this.game.changeDirection(0, -1); // 向上拖动
                    }
                }
                
                lastMouseX = currentMouseX;
                lastMouseY = currentMouseY;
                lastDirectionChange = currentTime;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    // 震动反馈（移动端）
    vibrate(duration = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
}

// 初始化控制模块
document.addEventListener('DOMContentLoaded', () => {
    // 等待游戏实例创建后初始化控制
    setTimeout(() => {
        new GameControls(game);
    }, 100);
});