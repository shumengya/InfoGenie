// 游戏统计模块
class GameStatistics {
    constructor() {
        this.achievements = {
            firstWin: false,
            speedRunner: false, // 5分钟内达到2048
            efficient: false,   // 少于500步达到2048
            persistent: false,  // 游戏时间超过30分钟
            merger: false,      // 单局合并超过100次
            highScorer: false   // 分数超过50000
        };
        
        this.loadAchievements();
        this.initializeModal();
    }
    
    updateDisplay() {
        if (!window.game2048) return;
        
        const game = window.game2048;
        
        // 更新实时统计显示
        document.getElementById('moves-count').textContent = game.stats.moves;
        document.getElementById('game-time').textContent = this.formatTime(game.stats.gameTime);
        document.getElementById('max-tile').textContent = game.stats.maxTile;
        document.getElementById('merge-count').textContent = game.stats.mergeCount;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    showFinalStats() {
        if (!window.game2048) return;
        
        const game = window.game2048;
        const modal = document.getElementById('stats-modal');
        
        // 更新最终统计数据
        document.getElementById('final-score').textContent = game.score;
        document.getElementById('final-moves').textContent = game.stats.moves;
        document.getElementById('final-time').textContent = this.formatTime(game.stats.gameTime);
        document.getElementById('final-max-tile').textContent = game.stats.maxTile;
        document.getElementById('final-merges').textContent = game.stats.mergeCount;
        
        // 计算平均每步得分
        const avgScore = game.stats.moves > 0 ? Math.round(game.score / game.stats.moves) : 0;
        document.getElementById('avg-score').textContent = avgScore;
        
        // 检查成就
        this.checkAchievements(game);
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 添加动画效果
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }
    
    checkAchievements(game) {
        let newAchievements = [];
        
        // 首次胜利
        if (game.gameWon && !this.achievements.firstWin) {
            this.achievements.firstWin = true;
            newAchievements.push('🏆 首次胜利！达到了2048！');
        }
        
        // 速度跑者 - 5分钟内达到2048
        if (game.gameWon && game.stats.gameTime <= 300 && !this.achievements.speedRunner) {
            this.achievements.speedRunner = true;
            newAchievements.push('⚡ 速度跑者！5分钟内达到2048！');
        }
        
        // 高效玩家 - 少于500步达到2048
        if (game.gameWon && game.stats.moves < 500 && !this.achievements.efficient) {
            this.achievements.efficient = true;
            newAchievements.push('🎯 高效玩家！少于500步达到2048！');
        }
        
        // 坚持不懈 - 游戏时间超过30分钟
        if (game.stats.gameTime >= 1800 && !this.achievements.persistent) {
            this.achievements.persistent = true;
            newAchievements.push('⏰ 坚持不懈！游戏时间超过30分钟！');
        }
        
        // 合并大师 - 单局合并超过100次
        if (game.stats.mergeCount >= 100 && !this.achievements.merger) {
            this.achievements.merger = true;
            newAchievements.push('🔥 合并大师！单局合并超过100次！');
        }
        
        // 高分玩家 - 分数超过50000
        if (game.score >= 50000 && !this.achievements.highScorer) {
            this.achievements.highScorer = true;
            newAchievements.push('💎 高分玩家！分数超过50000！');
        }
        
        // 保存成就
        if (newAchievements.length > 0) {
            this.saveAchievements();
            this.showAchievementNotifications(newAchievements);
        }
    }
    
    showAchievementNotifications(achievements) {
        // 在成就区域显示新获得的成就
        const achievementSection = document.querySelector('.achievement-section');
        
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'achievement-notification';
                notification.innerHTML = `
                    <div class="achievement-popup">
                        <span class="achievement-text">${achievement}</span>
                    </div>
                `;
                
                achievementSection.appendChild(notification);
                
                // 添加样式
                const popup = notification.querySelector('.achievement-popup');
                popup.style.cssText = `
                    background: linear-gradient(45deg, #ff6b6b, #feca57);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 20px;
                    margin: 5px 0;
                    font-weight: bold;
                    text-align: center;
                    animation: achievementSlide 0.5s ease-out;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                `;
                
                // 添加动画样式
                if (!document.getElementById('achievement-styles')) {
                    const style = document.createElement('style');
                    style.id = 'achievement-styles';
                    style.textContent = `
                        @keyframes achievementSlide {
                            from {
                                opacity: 0;
                                transform: translateX(-100%);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(0);
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // 3秒后移除通知
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 3000);
            }, index * 500);
        });
    }
    
    saveAchievements() {
        localStorage.setItem('2048-achievements', JSON.stringify(this.achievements));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('2048-achievements');
        if (saved) {
            this.achievements = { ...this.achievements, ...JSON.parse(saved) };
        }
    }
    
    initializeModal() {
        const modal = document.getElementById('stats-modal');
        const closeBtn = document.getElementById('close-modal');
        const newGameBtn = document.getElementById('new-game-btn');
        const shareBtn = document.getElementById('share-btn');
        
        // 关闭模态框
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // 新游戏按钮
        newGameBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (window.game2048) {
                window.game2048.restart();
            }
        });
        
        // 分享按钮
        shareBtn.addEventListener('click', () => {
            this.shareScore();
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    shareScore() {
        if (!window.game2048) return;
        
        const game = window.game2048;
        const shareText = `我在2048游戏中获得了${game.score}分！\n` +
                         `最大数字: ${game.stats.maxTile}\n` +
                         `移动次数: ${game.stats.moves}\n` +
                         `游戏时间: ${this.formatTime(game.stats.gameTime)}\n` +
                         `来挑战一下吧！`;
        
        // 尝试使用Web Share API
        if (navigator.share) {
            navigator.share({
                title: '2048游戏成绩',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('分享失败:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }
    
    fallbackShare(text) {
        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('成绩已复制到剪贴板！');
            }).catch(() => {
                this.showShareModal(text);
            });
        } else {
            this.showShareModal(text);
        }
    }
    
    showShareModal(text) {
        // 创建分享文本显示框
        const shareModal = document.createElement('div');
        shareModal.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 90%;
                text-align: center;
            ">
                <h3>分享你的成绩</h3>
                <textarea readonly style="
                    width: 100%;
                    height: 120px;
                    margin: 10px 0;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    resize: none;
                ">${text}</textarea>
                <div>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: #4ecdc4;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 0 5px;
                    ">关闭</button>
                    <button onclick="
                        this.parentElement.previousElementSibling.select();
                        document.execCommand('copy');
                        alert('已复制到剪贴板！');
                    " style="
                        background: #ff6b6b;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 0 5px;
                    ">复制</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(shareModal);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 10000;
            font-weight: bold;
            animation: toastSlide 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // 获取游戏统计摘要
    getStatsSummary() {
        if (!window.game2048) return null;
        
        const game = window.game2048;
        return {
            score: game.score,
            bestScore: game.bestScore,
            moves: game.stats.moves,
            gameTime: game.stats.gameTime,
            maxTile: game.stats.maxTile,
            mergeCount: game.stats.mergeCount,
            achievements: this.achievements
        };
    }
    
    // 重置所有统计数据
    resetAllStats() {
        this.achievements = {
            firstWin: false,
            speedRunner: false,
            efficient: false,
            persistent: false,
            merger: false,
            highScorer: false
        };
        
        localStorage.removeItem('2048-achievements');
        localStorage.removeItem('2048-best-score');
        
        this.showToast('所有统计数据已重置！');
    }
}

// 创建全局统计实例
window.gameStats = new GameStatistics();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保统计模块正确初始化
    if (!window.gameStats) {
        window.gameStats = new GameStatistics();
    }
});