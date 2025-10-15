// 2048游戏核心逻辑
class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;

        this.gameWon = false;
        this.gameOver = false;
        this.moved = false;
        
        // 游戏统计数据
        this.stats = {
            moves: 0,
            startTime: null,
            gameTime: 0,
            maxTile: 2,
            mergeCount: 0
        };
        
        this.initializeGrid();
        this.updateDisplay();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始计时
        this.startTimer();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.x][randomCell.y] = value;
            
            // 创建新方块动画
            this.createTileElement(randomCell.x, randomCell.y, value, true);
        }
    }
    
    createTileElement(x, y, value, isNew = false) {
        const container = document.getElementById('tile-container');
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        if (isNew) tile.classList.add('tile-new');
        
        tile.textContent = value;
        tile.style.left = `${y * (100/4)}%`;
        tile.style.top = `${x * (100/4)}%`;
        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.dataset.value = value;
        
        container.appendChild(tile);
        
        // 移除动画类
        setTimeout(() => {
            tile.classList.remove('tile-new');
        }, 200);
    }
    
    updateDisplay() {
        // 清除所有方块
        const container = document.getElementById('tile-container');
        container.innerHTML = '';
        
        // 重新创建所有方块
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTileElement(i, j, this.grid[i][j]);
                }
            }
        }
        
        // 更新分数
        document.getElementById('score').textContent = this.score;
        
        // 更新统计数据显示
        if (window.gameStats) {
            window.gameStats.updateDisplay();
        }
    }
    
    move(direction) {
        if (this.gameOver) return;
        
        this.moved = false;
        const previousGrid = this.grid.map(row => [...row]);
        
        switch (direction) {
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
        }
        
        if (this.moved) {
            this.stats.moves++;
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.isGameWon() && !this.gameWon) {
                this.gameWon = true;
                this.showGameWon();
            } else if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameOver();
            }
        }
    }
    
    moveLeft() {
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];
            
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1] && !merged[j] && !merged[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    this.stats.mergeCount++;
                    this.stats.maxTile = Math.max(this.stats.maxTile, row[j]);
                    row[j + 1] = 0;
                    merged[j] = true;
                }
            }
            
            const newRow = row.filter(val => val !== 0);
            while (newRow.length < this.size) {
                newRow.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== newRow[j]) {
                    this.moved = true;
                }
                this.grid[i][j] = newRow[j];
            }
        }
    }
    
    moveRight() {
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];
            
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1] && !merged[j] && !merged[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    this.stats.mergeCount++;
                    this.stats.maxTile = Math.max(this.stats.maxTile, row[j]);
                    row[j - 1] = 0;
                    merged[j] = true;
                }
            }
            
            const newRow = row.filter(val => val !== 0);
            while (newRow.length < this.size) {
                newRow.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== newRow[j]) {
                    this.moved = true;
                }
                this.grid[i][j] = newRow[j];
            }
        }
    }
    
    moveUp() {
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const merged = [];
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1] && !merged[i] && !merged[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    this.stats.mergeCount++;
                    this.stats.maxTile = Math.max(this.stats.maxTile, column[i]);
                    column[i + 1] = 0;
                    merged[i] = true;
                }
            }
            
            const newColumn = column.filter(val => val !== 0);
            while (newColumn.length < this.size) {
                newColumn.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    this.moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
    }
    
    moveDown() {
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const merged = [];
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1] && !merged[i] && !merged[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    this.stats.mergeCount++;
                    this.stats.maxTile = Math.max(this.stats.maxTile, column[i]);
                    column[i - 1] = 0;
                    merged[i] = true;
                }
            }
            
            const newColumn = column.filter(val => val !== 0);
            while (newColumn.length < this.size) {
                newColumn.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    this.moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
    }
    
    isGameWon() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isGameOver() {
        // 检查是否有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否可以合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (
                    (i > 0 && this.grid[i - 1][j] === current) ||
                    (i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j > 0 && this.grid[i][j - 1] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)
                ) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showGameWon() {
        const message = document.getElementById('game-message');
        message.className = 'game-message game-won';
        message.style.display = 'flex';
        message.querySelector('p').textContent = '你赢了！';
    }
    
    showGameOver() {
        const message = document.getElementById('game-message');
        message.className = 'game-message game-over';
        message.style.display = 'flex';
        message.querySelector('p').textContent = '游戏结束！';
        
        // 显示最终统计
        setTimeout(() => {
            if (window.gameStats) {
                window.gameStats.showFinalStats();
            }
        }, 1000);
    }
    
    restart() {
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.moved = false;
        
        // 重置统计数据
        this.stats = {
            moves: 0,
            startTime: null,
            gameTime: 0,
            maxTile: 2,
            mergeCount: 0
        };
        
        this.initializeGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        
        // 隐藏游戏消息
        document.getElementById('game-message').style.display = 'none';
        
        // 重新开始计时
        this.startTimer();
    }
    

    
    startTimer() {
        this.stats.startTime = Date.now();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (!this.gameOver && this.stats.startTime) {
                this.stats.gameTime = Math.floor((Date.now() - this.stats.startTime) / 1000);
                if (window.gameStats) {
                    window.gameStats.updateDisplay();
                }
            }
        }, 1000);
    }
    
    bindEvents() {
        // 重试按钮
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.restart();
        });
    }
    

}

// 游戏实例
let game;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    game = new Game2048();
    

    
    // 导出游戏实例供其他模块使用
    window.game2048 = game;
});