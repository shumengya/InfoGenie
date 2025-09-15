class GameControls {
    constructor(game) {
        this.game = game;
        this.initControls();
        this.initTouchControls();
    }
    
    initControls() {
        // 方向按钮控制
        document.getElementById('upBtn').addEventListener('click', () => {
            this.game.changeDirection(0, -1);
        });
        
        document.getElementById('downBtn').addEventListener('click', () => {
            this.game.changeDirection(0, 1);
        });
        
        document.getElementById('leftBtn').addEventListener('click', () => {
            this.game.changeDirection(-1, 0);
        });
        
        document.getElementById('rightBtn').addEventListener('click', () => {
            this.game.changeDirection(1, 0);
        });
        
        // 暂停/继续按钮
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.game.togglePause();
        });
        
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
                case 'p':
                case 'P':
                    this.game.togglePause();
                    break;
                case 'Escape':
                    if (this.game.gameOver) {
                        document.getElementById('gameOverModal').style.display = 'none';
                    }
                    break;
            }
        });
    }
    
    initTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        let touchStartX = 0;
        let touchStartY = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.game.changeDirection(1, 0); // 右滑
                    } else {
                        this.game.changeDirection(-1, 0); // 左滑
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.game.changeDirection(0, 1); // 下滑
                    } else {
                        this.game.changeDirection(0, -1); // 上滑
                    }
                }
            }
            
            e.preventDefault();
        }, { passive: false });
        
        // 防止移动端页面滚动
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.game-container')) {
                e.preventDefault();
            }
        }, { passive: false });
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