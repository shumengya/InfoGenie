class GameStatistics {
    constructor() {
        this.highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
        this.sessionStats = {
            gamesPlayed: 0,
            totalScore: 0,
            maxLength: 0,
            maxLevel: 0,
            totalTime: 0
        };
        
        this.init();
    }
    
    init() {
        // 恢复会话统计（如果存在）
        const savedSession = localStorage.getItem('snakeSessionStats');
        if (savedSession) {
            this.sessionStats = JSON.parse(savedSession);
        }
        
        // 监听游戏事件
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 监听自定义游戏事件
        document.addEventListener('gameOver', (e) => {
            this.handleGameOver(e.detail);
        });
        
        document.addEventListener('foodEaten', (e) => {
            this.handleFoodEaten(e.detail);
        });
        
        document.addEventListener('levelUp', (e) => {
            this.handleLevelUp(e.detail);
        });
    }
    
    handleGameOver(gameData) {
        this.sessionStats.gamesPlayed++;
        this.sessionStats.totalScore += gameData.score;
        this.sessionStats.maxLength = Math.max(this.sessionStats.maxLength, gameData.length);
        this.sessionStats.maxLevel = Math.max(this.sessionStats.maxLevel, gameData.level);
        this.sessionStats.totalTime += gameData.gameTime;
        
        // 保存会话统计
        localStorage.setItem('snakeSessionStats', JSON.stringify(this.sessionStats));
        
        // 检查是否进入高分榜
        this.checkHighScore(gameData);
        
        // 显示统计信息
        this.displaySessionStats();
    }
    
    handleFoodEaten(foodData) {
        // 可以记录特殊食物统计等
        console.log('食物被吃掉:', foodData);
    }
    
    handleLevelUp(levelData) {
        // 等级提升统计
        console.log('等级提升到:', levelData.level);
    }
    
    checkHighScore(gameData) {
        const highScoreEntry = {
            score: gameData.score,
            length: gameData.length,
            level: gameData.level,
            time: gameData.gameTime,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        // 添加到高分榜
        this.highScores.push(highScoreEntry);
        
        // 按分数排序（降序）
        this.highScores.sort((a, b) => b.score - a.score);
        
        // 只保留前10名
        this.highScores = this.highScores.slice(0, 10);
        
        // 保存到本地存储
        localStorage.setItem('snakeHighScores', JSON.stringify(this.highScores));
        
        // 显示高分榜
        this.displayHighScores();
    }
    
    displaySessionStats() {
        const statsElement = document.createElement('div');
        statsElement.className = 'session-stats';
        statsElement.innerHTML = `
            <h3>本次会话统计</h3>
            <p>游戏次数: ${this.sessionStats.gamesPlayed}</p>
            <p>总得分: ${this.sessionStats.totalScore}</p>
            <p>最高长度: ${this.sessionStats.maxLength}</p>
            <p>最高等级: ${this.sessionStats.maxLevel}</p>
            <p>总游戏时间: ${Math.floor(this.sessionStats.totalTime / 60)}分钟</p>
            <p>平均得分: ${Math.round(this.sessionStats.totalScore / this.sessionStats.gamesPlayed)}</p>
        `;
        
        // 添加到游戏结束模态框
        const statsContainer = document.querySelector('.stats');
        if (statsContainer && !document.querySelector('.session-stats')) {
            statsContainer.appendChild(statsElement);
        }
    }
    
    displayHighScores() {
        const highScoresElement = document.createElement('div');
        highScoresElement.className = 'high-scores';
        
        if (this.highScores.length > 0) {
            highScoresElement.innerHTML = `
                <h3>🏆 高分榜</h3>
                ${this.highScores.map((score, index) => `
                    <div class="score-item ${index === 0 ? 'first-place' : ''}">
                        <span class="rank">${index + 1}.</span>
                        <span class="score">${score.score}分</span>
                        <span class="length">长度:${score.length}</span>
                        <span class="date">${score.date}</span>
                    </div>
                `).join('')}
            `;
        } else {
            highScoresElement.innerHTML = '<p>暂无高分记录</p>';
        }
        
        // 添加到游戏结束模态框
        const modalContent = document.querySelector('.modal-content');
        if (modalContent && !document.querySelector('.high-scores')) {
            modalContent.appendChild(highScoresElement);
        }
    }
    
    getAchievements(gameData) {
        const achievements = [];
        
        if (gameData.score >= 100) achievements.push('百分达人');
        if (gameData.length >= 20) achievements.push('长蛇之王');
        if (gameData.level >= 5) achievements.push('等级大师');
        if (gameData.gameTime >= 300) achievements.push('持久战将');
        if (gameData.score >= 50 && gameData.gameTime <= 60) achievements.push('速通高手');
        
        return achievements;
    }
    
    // 工具方法：格式化时间
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    }
    
    // 清除统计
    clearStatistics() {
        this.highScores = [];
        this.sessionStats = {
            gamesPlayed: 0,
            totalScore: 0,
            maxLength: 0,
            maxLevel: 0,
            totalTime: 0
        };
        
        localStorage.removeItem('snakeHighScores');
        localStorage.removeItem('snakeSessionStats');
        
        console.log('统计信息已清除');
    }
}

// 扩展游戏核心类，添加统计事件触发
SnakeGame.prototype.showGameOver = function() {
    const modal = document.getElementById('gameOverModal');
    const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLength').textContent = this.snake.length;
    document.getElementById('finalLevel').textContent = this.level;
    document.getElementById('gameTime').textContent = gameTime;
    document.getElementById('foodEaten').textContent = this.foodEaten;
    
    // 触发游戏结束事件
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
    
    modal.style.display = 'flex';
};

// 初始化统计模块
let gameStats;

document.addEventListener('DOMContentLoaded', () => {
    gameStats = new GameStatistics();
});

// 添加CSS样式
const statsStyles = `
.session-stats {
    margin-top: 20px;
    padding: 15px;
    background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
    border-radius: 10px;
    border: 2px solid #d4a76a;
}

.session-stats h3 {
    color: #8b4513;
    margin-bottom: 10px;
    text-align: center;
}

.session-stats p {
    margin: 5px 0;
    color: #654321;
    font-size: 0.9rem;
}

.high-scores {
    margin-top: 20px;
    padding: 15px;
    background: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%);
    border-radius: 10px;
    border: 2px solid #4682b4;
}

.high-scores h3 {
    color: #2c5282;
    margin-bottom: 10px;
    text-align: center;
}

.score-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #cbd5e0;
}

.score-item:last-child {
    border-bottom: none;
}

.score-item.first-place {
    background: linear-gradient(135deg, #fceabb 0%, #f8b500 100%);
    border-radius: 5px;
    padding: 8px;
    margin: -8px -8px 8px -8px;
}

.rank {
    font-weight: bold;
    color: #2d3748;
    min-width: 30px;
}

.score {
    font-weight: bold;
    color: #e53e3e;
    min-width: 60px;
}

.length {
    color: #4a5568;
    font-size: 0.8rem;
    min-width: 60px;
}

.date {
    color: #718096;
    font-size: 0.7rem;
    min-width: 60px;
    text-align: right;
}
`;

// 注入样式
const styleSheet = document.createElement('style');
styleSheet.textContent = statsStyles;
document.head.appendChild(styleSheet);