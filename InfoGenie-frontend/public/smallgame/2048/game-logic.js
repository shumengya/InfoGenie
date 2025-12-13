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

    // 依据分数计算权重（0.1 ~ 0.95）
    calculateWeightByScore(score) {
        const w = score / 4000; // 4000分约接近满权重
        return Math.max(0.1, Math.min(0.95, w));
    }

    // 按权重偏向生成0~10的随机整数，权重越高越偏向更大值
    biasedRandomInt(maxInclusive, weight) {
        const rand = Math.random();
        const biased = Math.pow(rand, 1 - weight); // weight越大，biased越接近1
        const val = Math.floor(biased * (maxInclusive + 1));
        return Math.max(0, Math.min(maxInclusive, val));
    }

    // 附加结束信息到界面
    appendEndInfo(text, type = 'info') {
        const message = document.getElementById('game-message');
        if (!message) return;
        const info = document.createElement('div');
        info.style.marginTop = '10px';
        info.style.fontSize = '16px';
        info.style.color = type === 'error' ? '#d9534f' : (type === 'success' ? '#28a745' : '#776e65');
        info.textContent = text;
        message.appendChild(info);
    }

    // 游戏结束时尝试给当前登录账户加“萌芽币”
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
            } catch (e) {
                // 忽略解析错误
            }

            if (!email) {
                this.appendEndInfo('未找到账户信息（email），无法加币', 'error');
                return;
            }

            // 根据分数计算权重与概率
            const weight = this.calculateWeightByScore(this.score);
            let awardProbability = weight; // 默认用权重作为概率
            let guaranteed = false;

            // 分数≥500时必定触发奖励
            if (this.score >= 500) {
                awardProbability = 1;
                guaranteed = true;
            }

            const roll = Math.random();
            if (roll > awardProbability) {
                this.appendEndInfo('本局未获得萌芽币');
                return;
            }

            // 生成0~10随机萌芽币数量，权重越高越偏向更大值
            let coins = this.biasedRandomInt(5, weight);
            // 保底至少 1 个（仅当分数≥500时）
            if (guaranteed) {
                coins = Math.max(1, coins);
            }
            coins = Math.max(0, Math.min(10, coins));

            if (coins <= 0) {
                this.appendEndInfo('本局未获得萌芽币');
                return;
            }

            // 后端 API base URL（从父窗口ENV_CONFIG获取，回退到本地默认）
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

        // 胜利也尝试加币（异步，不阻塞UI）
        this.tryAwardCoinsOnGameOver();

        // 显示最终统计
        setTimeout(() => {
            if (window.gameStats) {
                window.gameStats.showFinalStats();
            }
        }, 1000);
    }
    
    showGameOver() {
        const message = document.getElementById('game-message');
        message.className = 'game-message game-over';
        message.style.display = 'flex';
        message.querySelector('p').textContent = '游戏结束！';
        
        // 渲染排行榜
        try {
            this.renderLeaderboard();
        } catch (e) {
            console.error('渲染排行榜时发生错误:', e);
        }
        
        // 尝试加币（异步，不阻塞UI）
        this.tryAwardCoinsOnGameOver();

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
    
    // 构建并渲染排行榜
    renderLeaderboard() {
        const container = document.getElementById('leaderboard');
        if (!container) return;

        // 生成当前玩家数据
        const today = this.formatDate(new Date());
        const currentPlayer = {
            "名称": "我",
            "账号": "guest-local",
            "分数": this.score,
            "时间": today,
            _current: true
        };

        // 合并并排序数据（分数由高到低）
        const baseData = (typeof playerdata !== 'undefined' && Array.isArray(playerdata)) ? playerdata : [];
        const merged = [...baseData.map(d => ({...d})), currentPlayer]
            .sort((a, b) => (b["分数"] || 0) - (a["分数"] || 0));

        // 计算当前玩家排名
        const currentIndex = merged.findIndex(d => d._current);
        const rank = currentIndex >= 0 ? currentIndex + 1 : '-';

        // 仅展示前10条
        const topN = merged.slice(0, 10);

        // 生成 HTML
        const summaryHtml = `
            <div class="leaderboard-summary">
                <span>本局分数：<strong>${this.score}</strong></span>
                <span>用时：<strong>${this.stats.gameTime}</strong> 秒</span>
                <span>你的排名：<strong>${rank}</strong></span>
            </div>
        `;

        const headerHtml = `
            <div class="leaderboard-header">
                <div class="leaderboard-col rank">排名</div>
                <div class="leaderboard-col name">名称</div>
                <div class="leaderboard-col score">分数</div>
                <div class="leaderboard-col time">日期</div>
            </div>
        `;

        const rowsHtml = topN.map((d, i) => {
            const isCurrent = !!d._current;
            const rowClass = `leaderboard-row${isCurrent ? ' current' : ''}`;
            return `
                <div class="${rowClass}">
                    <div class="leaderboard-col rank">${i + 1}</div>
                    <div class="leaderboard-col name">${this.escapeHtml(d["名称"] || '未知')}</div>
                    <div class="leaderboard-col score">${d["分数"] ?? 0}</div>
                    <div class="leaderboard-col time">${this.escapeHtml(d["时间"] || '-')}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="leaderboard-title">排行榜</div>
            ${summaryHtml}
            <div class="leaderboard-table">
                ${headerHtml}
                <div class="leaderboard-body">${rowsHtml}</div>
            </div>
        `;
    }

    // 工具：日期格式化 YYYY-MM-DD
    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // 工具：简单转义以避免 XSS
    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
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