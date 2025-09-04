// 游戏统计和成就系统
class GameStats {
    constructor() {
        this.achievements = [
            {
                id: 'first_game',
                name: '初次体验',
                description: '完成第一次游戏',
                condition: (stats) => true
            },
            {
                id: 'score_1000',
                name: '小试牛刀',
                description: '单局得分达到1000分',
                condition: (stats) => stats.score >= 1000
            },
            {
                id: 'score_5000',
                name: '游戏达人',
                description: '单局得分达到5000分',
                condition: (stats) => stats.score >= 5000
            },
            {
                id: 'score_10000',
                name: '方块大师',
                description: '单局得分达到10000分',
                condition: (stats) => stats.score >= 10000
            },
            {
                id: 'level_5',
                name: '步步高升',
                description: '达到第5级',
                condition: (stats) => stats.level >= 5
            },
            {
                id: 'level_10',
                name: '速度之王',
                description: '达到第10级',
                condition: (stats) => stats.level >= 10
            },
            {
                id: 'lines_50',
                name: '消除专家',
                description: '累计消除50行',
                condition: (stats) => stats.lines >= 50
            },
            {
                id: 'lines_100',
                name: '清理大师',
                description: '累计消除100行',
                condition: (stats) => stats.lines >= 100
            },
            {
                id: 'tetris',
                name: 'Tetris!',
                description: '一次消除4行',
                condition: (stats) => stats.maxCombo >= 4
            },
            {
                id: 'time_10min',
                name: '持久战士',
                description: '单局游戏时间超过10分钟',
                condition: (stats) => stats.playTime >= 600000
            },
            {
                id: 'efficiency',
                name: '效率专家',
                description: '平均每分钟得分超过500',
                condition: (stats) => stats.avgScore >= 500
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const playAgainBtn = document.getElementById('playAgainBtn');
        playAgainBtn.addEventListener('click', () => {
            this.hideStats();
            game.restart();
        });
    }
    
    showStats(gameData) {
        const playTimeMinutes = gameData.playTime / 60000;
        const avgScore = playTimeMinutes > 0 ? Math.round(gameData.score / playTimeMinutes) : 0;
        
        const stats = {
            ...gameData,
            avgScore: avgScore
        };
        
        // 更新统计显示
        document.getElementById('finalScore').textContent = stats.score.toLocaleString();
        document.getElementById('finalLevel').textContent = stats.level;
        document.getElementById('finalLines').textContent = stats.lines;
        document.getElementById('playTime').textContent = this.formatTime(stats.playTime);
        document.getElementById('maxCombo').textContent = stats.maxCombo;
        document.getElementById('avgScore').textContent = stats.avgScore;
        
        // 检查成就
        const achievement = this.checkAchievements(stats);
        this.displayAchievement(achievement);
        
        // 显示统计界面
        document.getElementById('gameStats').style.display = 'flex';
        document.getElementById('gameStats').classList.add('fade-in');
    }
    
    hideStats() {
        document.getElementById('gameStats').style.display = 'none';
        document.getElementById('gameStats').classList.remove('fade-in');
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    checkAchievements(stats) {
        // 获取已获得的成就
        const earnedAchievements = this.getEarnedAchievements();
        
        // 检查新成就
        for (let achievement of this.achievements) {
            if (!earnedAchievements.includes(achievement.id) && 
                achievement.condition(stats)) {
                
                // 保存新成就
                this.saveAchievement(achievement.id);
                return achievement;
            }
        }
        
        return null;
    }
    
    displayAchievement(achievement) {
        const achievementEl = document.getElementById('achievement');
        
        if (achievement) {
            achievementEl.innerHTML = `
                🏆 <strong>成就解锁!</strong><br>
                <strong>${achievement.name}</strong><br>
                ${achievement.description}
            `;
            achievementEl.classList.add('pulse');
        } else {
            // 显示随机鼓励话语
            const encouragements = [
                '继续努力，你会变得更强！',
                '每一次游戏都是进步的机会！',
                '方块世界需要你的智慧！',
                '熟能生巧，加油！',
                '下一局一定会更好！',
                '坚持就是胜利！',
                '你的反应速度在提升！',
                '策略思维正在增强！'
            ];
            
            const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
            achievementEl.innerHTML = `💪 ${randomEncouragement}`;
            achievementEl.classList.remove('pulse');
        }
    }
    
    getEarnedAchievements() {
        const saved = localStorage.getItem('tetris_achievements');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveAchievement(achievementId) {
        const earned = this.getEarnedAchievements();
        if (!earned.includes(achievementId)) {
            earned.push(achievementId);
            localStorage.setItem('tetris_achievements', JSON.stringify(earned));
        }
    }
    
    // 获取历史最佳记录
    getBestStats() {
        const saved = localStorage.getItem('tetris_best_stats');
        return saved ? JSON.parse(saved) : {
            score: 0,
            level: 0,
            lines: 0,
            maxCombo: 0
        };
    }
    
    // 保存最佳记录
    saveBestStats(stats) {
        const best = this.getBestStats();
        let updated = false;
        
        if (stats.score > best.score) {
            best.score = stats.score;
            updated = true;
        }
        
        if (stats.level > best.level) {
            best.level = stats.level;
            updated = true;
        }
        
        if (stats.lines > best.lines) {
            best.lines = stats.lines;
            updated = true;
        }
        
        if (stats.maxCombo > best.maxCombo) {
            best.maxCombo = stats.maxCombo;
            updated = true;
        }
        
        if (updated) {
            localStorage.setItem('tetris_best_stats', JSON.stringify(best));
        }
        
        return updated;
    }
    
    // 显示排行榜
    showLeaderboard() {
        const best = this.getBestStats();
        const earned = this.getEarnedAchievements();
        
        console.log('最佳记录:', best);
        console.log('已获得成就:', earned.length + '/' + this.achievements.length);
    }
}

// 高级特效系统
class GameEffects {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.effects = [];
        
        this.init();
    }
    
    init() {
        // 创建特效canvas
        this.effectsCanvas = document.createElement('canvas');
        this.effectsCanvas.width = this.game.canvas.width;
        this.effectsCanvas.height = this.game.canvas.height;
        this.effectsCanvas.style.position = 'absolute';
        this.effectsCanvas.style.top = '0';
        this.effectsCanvas.style.left = '0';
        this.effectsCanvas.style.pointerEvents = 'none';
        this.effectsCanvas.style.zIndex = '10';
        
        this.effectsCtx = this.effectsCanvas.getContext('2d');
        
        // 将特效canvas添加到游戏板容器中
        this.game.canvas.parentElement.style.position = 'relative';
        this.game.canvas.parentElement.appendChild(this.effectsCanvas);
    }
    
    // 行消除特效
    lineCleared(row) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.game.canvas.width,
                y: row * this.game.CELL_SIZE + this.game.CELL_SIZE / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: 0.02,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
    }
    
    // 方块锁定特效
    pieceLocked(piece) {
        const centerX = (piece.x + piece.matrix[0].length / 2) * this.game.CELL_SIZE;
        const centerY = (piece.y + piece.matrix.length / 2) * this.game.CELL_SIZE;
        
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.8,
                decay: 0.03,
                color: piece.color
            });
        }
    }
    
    // 更新特效
    update() {
        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // 绘制特效
    draw() {
        this.effectsCtx.clearRect(0, 0, this.effectsCanvas.width, this.effectsCanvas.height);
        
        // 绘制粒子
        for (let particle of this.particles) {
            this.effectsCtx.save();
            this.effectsCtx.globalAlpha = particle.life;
            this.effectsCtx.fillStyle = particle.color;
            this.effectsCtx.beginPath();
            this.effectsCtx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.effectsCtx.fill();
            this.effectsCtx.restore();
        }
    }
}

// 创建统计系统实例
const gameStats = new GameStats();

// 在适当的地方创建特效系统
// const gameEffects = new GameEffects(game);
