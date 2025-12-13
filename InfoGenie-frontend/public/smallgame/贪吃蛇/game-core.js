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
        this.gameSpeed = 6.5; // 初始速度 (10 * 0.65)
        this.gameOver = false;
        this.startTime = Date.now();
        this.foodEaten = 0;
        
        // 特殊食物
        this.specialFood = null;
        this.specialFoodTimer = 0;
        this.specialFoodDuration = 5000; // 5秒
        
        this.init();
    }

    // 根据分数计算权重（权重越高，越容易触发且数量偏大）
    calculateWeightByScore(score) {
        const w = score / 100; // 1000分趋近高权重
        return Math.max(0.1, Math.min(0.95, w));
    }

    // 权重偏向的随机整数，weight越大越偏向更大值
    biasedRandomInt(maxInclusive, weight) {
        const r = Math.random();
        const biased = Math.pow(r, 1 - weight);
        const val = Math.floor(biased * (maxInclusive + 1));
        return Math.max(0, Math.min(maxInclusive, val));
    }

    // 在排行榜弹层追加结束信息
    appendEndInfo(text, type = 'info') {
        const summary = document.getElementById('leaderboardSummary');
        if (!summary) return;
        const info = document.createElement('div');
        info.style.marginTop = '8px';
        info.style.fontSize = '14px';
        info.style.color = type === 'error' ? '#d9534f' : (type === 'success' ? '#28a745' : '#333');
        info.textContent = text;
        summary.appendChild(info);
    }

    // 游戏结束后尝试加“萌芽币”
    async tryAwardCoinsOnGameOver() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.appendEndInfo('未登录，无法获得萌芽币');
                return;
            }

            let email = null;
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    email = userObj && (userObj.email || userObj['邮箱']);
                }
            } catch (_) {}

            if (!email) {
                this.appendEndInfo('未找到账户信息（email），无法加币', 'error');
                return;
            }

            const weight = this.calculateWeightByScore(this.score);
            let coins = 0;
            let guaranteed = false;

            // 得分大于400必定触发获得1-5个萌芽币
            if (this.score > 5) {
                guaranteed = true;
                coins = Math.floor(Math.random() * 5) + 1; // 1~5
            } else {
                // 使用权重作为概率
                const roll = Math.random();
                if (roll > weight) {
                    this.appendEndInfo('本局未获得萌芽币');
                    return;
                }
                // 生成0~10随机数量（权重越高越偏向更大）
                coins = this.biasedRandomInt(10, weight);
                coins = Math.max(0, Math.min(10, coins));
                if (coins <= 0) {
                    this.appendEndInfo('本局未获得萌芽币');
                    return;
                }
            }

            // 后端 API base（优先父窗口ENV_CONFIG）
            const apiBase = (window.parent && window.parent.ENV_CONFIG && window.parent.ENV_CONFIG.API_URL)
                ? window.parent.ENV_CONFIG.API_URL
                : ((window.ENV_CONFIG && window.ENV_CONFIG.API_URL) ? window.ENV_CONFIG.API_URL : 'http://127.0.0.1:5002');

            const resp = await fetch(`${apiBase}/api/user/add-coins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, amount: coins })
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                const msg = err && (err.message || err.error) ? (err.message || err.error) : `请求失败(${resp.status})`;
                this.appendEndInfo(`加币失败：${msg}`, 'error');
                return;
            }

            const data = await resp.json();
            if (data && data.success) {
                const newCoins = data.data && data.data.new_coins;
                this.appendEndInfo(`恭喜获得 ${coins} 个萌芽币！当前余额：${newCoins}`, 'success');
            } else {
                const msg = (data && (data.message || data.error)) || '未知错误';
                this.appendEndInfo(`加币失败：${msg}`, 'error');
            }
        } catch (e) {
            console.error('加币流程发生错误:', e);
            this.appendEndInfo('加币失败：网络或系统错误', 'error');
        }
    }
    
    init() {
        this.generateFood();
        this.gameLoop();
        
        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
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
            this.gameSpeed = Math.min(13, 6.5 + this.level * 0.65); // 速度上限13 (20 * 0.65)
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
    

    
    changeDirection(dx, dy) {
        if (this.gameOver) return;
        
        // 防止180度转弯
        if ((this.dx !== 0 && dx !== 0) || (this.dy !== 0 && dy !== 0)) {
            return;
        }
        
        this.dx = dx;
        this.dy = dy;
    }
    
    // 工具：格式化日期为 YYYY-MM-DD
    formatDate(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    
    showGameOver() {
        // 构建并展示排行榜弹层
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        const overlay = document.getElementById('leaderboardOverlay');
        const listEl = document.getElementById('leaderboardList');
        const lbScore = document.getElementById('lbScore');
        const lbLength = document.getElementById('lbLength');
        const lbLevel = document.getElementById('lbLevel');
        const lbGameTime = document.getElementById('lbGameTime');
        const lbRank = document.getElementById('lbRank');
        
        if (!overlay || !listEl) {
            console.warn('排行榜容器不存在');
            return;
        }
        
        // 汇总当前玩家数据
        lbScore.textContent = this.score;
        lbLength.textContent = this.snake.length;
        lbLevel.textContent = this.level;
        lbGameTime.textContent = `${gameTime}秒`;
        
        const currentEntry = {
            "名称": localStorage.getItem('snakePlayerName') || '我',
            "账号": localStorage.getItem('snakePlayerAccount') || 'guest@local',
            "分数": this.score,
            "时间": this.formatDate(new Date()),
            __isCurrent: true,
            __duration: gameTime
        };
        
        // 合并并排序数据（使用 gamedata.js 中的 playerdata）
        const baseData = (typeof playerdata !== 'undefined' && Array.isArray(playerdata)) ? playerdata : [];
        const merged = [...baseData, currentEntry];
        merged.sort((a, b) => (b["分数"] || 0) - (a["分数"] || 0));
        const playerIndex = merged.findIndex(e => e.__isCurrent);
        lbRank.textContent = playerIndex >= 0 ? `#${playerIndex + 1}` : '—';
        
        // 生成排行榜（TOP 10）
        const topList = merged.slice(0, 10).map((entry, idx) => {
            const isCurrent = !!entry.__isCurrent;
            const name = entry["名称"] ?? '未知玩家';
            const score = entry["分数"] ?? 0;
            const dateStr = entry["时间"] ?? '';
            const timeStr = isCurrent ? `时长:${entry.__duration}秒` : `时间:${dateStr}`;
            return `
                <div class="leaderboard-item ${isCurrent ? 'current-player' : ''}">
                    <span class="rank">#${idx + 1}</span>
                    <span class="player-name">${name}</span>
                    <span class="player-score">${score}分</span>
                    <span class="player-time">${timeStr}</span>
                </div>
            `;
        }).join('');
        listEl.innerHTML = topList;
        
        overlay.style.display = 'flex';
        // 结束时尝试加币（异步，不阻塞UI）
        this.tryAwardCoinsOnGameOver();
        
        // 触发游戏结束事件（供统计模块使用）
        const gameOverEvent = new CustomEvent('gameOver', {
            detail: {
                score: this.score,
                length: this.snake.length,
                level: this.level,
                gameTime: gameTime,
                foodEaten: this.foodEaten
            }
        });
        document.dispatchEvent(gameOverEvent);
        
        // 绑定重新开始按钮
        const restartBtn = document.getElementById('leaderboardRestartBtn');
        if (restartBtn) {
            restartBtn.onclick = () => {
                overlay.style.display = 'none';
                this.restart();
            };
        }
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
        this.gameSpeed = 6.5;
        this.gameOver = false;
        this.startTime = Date.now();
        this.foodEaten = 0;
        this.specialFood = null;
        
        // 隐藏排行榜弹层（若可见）
        const overlay = document.getElementById('leaderboardOverlay');
        if (overlay) overlay.style.display = 'none';
        
        this.generateFood();
        this.updateUI();
        
        this.gameLoop();
    }
}

// 全局游戏实例
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});