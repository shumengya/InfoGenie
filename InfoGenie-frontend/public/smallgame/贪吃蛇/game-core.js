class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.tileCountY = this.canvas.height / this.gridSize;
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        
        // 食物位置
        this.food = {x: 15, y: 15};
        
        // 游戏状态
        this.dx = 1; // 初始向右移动
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 10; // 初始速度
        this.isPaused = false;
        this.gameOver = false;
        this.startTime = Date.now();
        this.foodEaten = 0;
        
        // 特殊食物
        this.specialFood = null;
        this.specialFoodTimer = 0;
        this.specialFoodDuration = 5000; // 5秒
        
        this.init();
    }
    
    init() {
        this.generateFood();
        this.gameLoop();
        
        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.isPaused || this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx === 0) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx === 0) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    this.togglePause();
                    break;
            }
        });
    }
    
    generateFood() {
        // 生成普通食物
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCountY)
            };
        } while (this.isPositionOccupied(newFood));
        
        this.food = newFood;
        
        // 有10%几率生成特殊食物
        if (Math.random() < 0.1 && !this.specialFood) {
            this.generateSpecialFood();
        }
    }
    
    generateSpecialFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCountY),
                type: 'special',
                value: 5 // 特殊食物价值5分
            };
        } while (this.isPositionOccupied(newFood));
        
        this.specialFood = newFood;
        this.specialFoodTimer = Date.now();
    }
    
    isPositionOccupied(position) {
        // 检查是否与蛇身重叠
        for (let segment of this.snake) {
            if (segment.x === position.x && segment.y === position.y) {
                return true;
            }
        }
        
        // 检查是否与普通食物重叠
        if (this.food && this.food.x === position.x && this.food.y === position.y) {
            return true;
        }
        
        // 检查是否与特殊食物重叠
        if (this.specialFood && this.specialFood.x === position.x && this.specialFood.y === position.y) {
            return true;
        }
        
        return false;
    }
    
    update() {
        if (this.isPaused || this.gameOver) return;
        
        // 更新蛇头位置
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查游戏结束条件
        if (this.checkCollision(head)) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // 移动蛇
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 1;
            this.foodEaten++;
            this.generateFood();
            this.updateLevel();
        } else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.score += this.specialFood.value;
            this.foodEaten++;
            this.specialFood = null;
            this.generateFood();
            this.updateLevel();
        } else {
            this.snake.pop(); // 如果没有吃到食物，移除尾部
        }
        
        // 检查特殊食物超时
        if (this.specialFood && Date.now() - this.specialFoodTimer > this.specialFoodDuration) {
            this.specialFood = null;
        }
        
        // 更新UI
        this.updateUI();
    }
    
    checkCollision(head) {
        // 检查撞墙
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCountY) {
            return true;
        }
        
        // 检查撞到自己（从第4节开始检查，避免误判）
        for (let i = 4; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        
        return false;
    }
    
    updateLevel() {
        // 每吃5个食物升一级
        const newLevel = Math.floor(this.foodEaten / 5) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.min(20, 10 + this.level); // 速度上限20
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('length').textContent = this.snake.length;
        document.getElementById('level').textContent = this.level;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格（背景）
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCountY; y++) {
                this.ctx.strokeRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
            }
        }
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // 蛇身，渐变颜色
                const gradient = (index / this.snake.length) * 100;
                this.ctx.fillStyle = `hsl(120, 80%, ${60 - gradient}%)`;
            }
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
            
            // 边框
            this.ctx.strokeStyle = '#2E7D32';
            this.ctx.strokeRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
        });
        
        // 绘制普通食物
        this.ctx.fillStyle = '#FF5252';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 绘制特殊食物（如果存在）
        if (this.specialFood) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(
                this.specialFood.x * this.gridSize + this.gridSize / 2,
                this.specialFood.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // 闪烁效果
            const time = Date.now() - this.specialFoodTimer;
            const alpha = 0.5 + 0.5 * Math.sin(time / 200);
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#FF6B00';
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        // 绘制暂停状态
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        if (!this.gameOver) {
            setTimeout(() => this.gameLoop(), 1000 / this.gameSpeed);
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
        
        if (!this.isPaused && !this.gameOver) {
            this.gameLoop();
        }
    }
    
    changeDirection(dx, dy) {
        if (this.isPaused || this.gameOver) return;
        
        // 防止180度转弯
        if ((this.dx !== 0 && dx !== 0) || (this.dy !== 0 && dy !== 0)) {
            return;
        }
        
        this.dx = dx;
        this.dy = dy;
    }
    
    showGameOver() {
        const modal = document.getElementById('gameOverModal');
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLength').textContent = this.snake.length;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('gameTime').textContent = gameTime;
        document.getElementById('foodEaten').textContent = this.foodEaten;
        
        modal.style.display = 'flex';
    }
    
    restart() {
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 10;
        this.isPaused = false;
        this.gameOver = false;
        this.startTime = Date.now();
        this.foodEaten = 0;
        this.specialFood = null;
        
        this.generateFood();
        this.updateUI();
        
        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('pauseBtn').textContent = '暂停';
        
        this.gameLoop();
    }
}

// 全局游戏实例
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});