// 游戏控制模块
class GameControls {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.keyRepeatDelay = 150;
        this.keyRepeatInterval = 50;
        this.keyTimers = {};
        
        this.init();
    }
    
    init() {
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupButtonControls();
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }
    
    handleKeyDown(e) {
        const key = e.key;
        
        // 防止重复触发
        if (this.keys[key]) return;
        this.keys[key] = true;
        
        switch(key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.game.moveLeft();
                this.startKeyRepeat(key, () => this.game.moveLeft());
                break;
                
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.game.moveRight();
                this.startKeyRepeat(key, () => this.game.moveRight());
                break;
                
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.game.moveDown();
                this.startKeyRepeat(key, () => this.game.moveDown());
                break;
                
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.game.rotatePiece();
                break;
                
            case ' ':
                e.preventDefault();
                if (this.game.gameRunning) {
                    this.game.pause();
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (!this.game.gameRunning) {
                    this.game.start();
                }
                break;
                
            case 'r':
            case 'R':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.game.restart();
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                if (this.game.gameRunning) {
                    this.game.pause();
                }
                break;
        }
    }
    
    handleKeyUp(e) {
        const key = e.key;
        this.keys[key] = false;
        this.stopKeyRepeat(key);
    }
    
    startKeyRepeat(key, action) {
        this.stopKeyRepeat(key);
        
        this.keyTimers[key] = setTimeout(() => {
            const intervalId = setInterval(() => {
                if (this.keys[key]) {
                    action();
                } else {
                    clearInterval(intervalId);
                }
            }, this.keyRepeatInterval);
            
            this.keyTimers[key] = intervalId;
        }, this.keyRepeatDelay);
    }
    
    stopKeyRepeat(key) {
        if (this.keyTimers[key]) {
            clearTimeout(this.keyTimers[key]);
            clearInterval(this.keyTimers[key]);
            delete this.keyTimers[key];
        }
    }
    
    setupTouchControls() {
        // 移动端触摸控制
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const downBtn = document.getElementById('downBtn');
        const rotateBtn = document.getElementById('rotateBtn');
        const dropBtn = document.getElementById('dropBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        // 左移
        this.addTouchEvents(leftBtn, () => this.game.moveLeft());
        
        // 右移
        this.addTouchEvents(rightBtn, () => this.game.moveRight());
        
        // 下移
        this.addTouchEvents(downBtn, () => this.game.moveDown());
        
        // 旋转
        rotateBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.rotatePiece();
        });
        
        rotateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.game.rotatePiece();
        });
        
        // 硬降
        dropBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.hardDrop();
        });
        
        dropBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.game.hardDrop();
        });
        
        // 暂停
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.pause();
        });
        
        pauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.game.pause();
        });
    }
    
    addTouchEvents(element, action) {
        let touchInterval;
        let touchTimeout;
        
        const startAction = (e) => {
            e.preventDefault();
            action();
            
            touchTimeout = setTimeout(() => {
                touchInterval = setInterval(action, this.keyRepeatInterval);
            }, this.keyRepeatDelay);
        };
        
        const stopAction = (e) => {
            e.preventDefault();
            if (touchTimeout) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
            }
            if (touchInterval) {
                clearInterval(touchInterval);
                touchInterval = null;
            }
        };
        
        element.addEventListener('touchstart', startAction);
        element.addEventListener('touchend', stopAction);
        element.addEventListener('touchcancel', stopAction);
        element.addEventListener('mousedown', startAction);
        element.addEventListener('mouseup', stopAction);
        element.addEventListener('mouseleave', stopAction);
    }
    
    setupButtonControls() {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        startBtn.addEventListener('click', () => {
            this.game.start();
        });
        
        restartBtn.addEventListener('click', () => {
            this.game.restart();
        });
    }
    
    // 游戏手势支持
    setupSwipeControls() {
        let startX = 0;
        let startY = 0;
        let threshold = 50;
        
        this.game.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.game.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.game.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0) {
                        this.game.moveRight();
                    } else {
                        this.game.moveLeft();
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(deltaY) > threshold) {
                    if (deltaY > 0) {
                        this.game.moveDown();
                    } else {
                        this.game.rotatePiece();
                    }
                }
            }
        });
        
        // 双击旋转
        let lastTap = 0;
        this.game.canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
                this.game.rotatePiece();
            }
            lastTap = currentTime;
        });
    }
}

// 初始化控制系统
const gameControls = new GameControls(game);
