// 俄罗斯方块主游戏逻辑
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // 游戏配置
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;
        
        // 游戏状态
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000; // 初始下降间隔(毫秒)
        this.gameRunning = false;
        this.gamePaused = false;
        this.lastTime = 0;
        
        // 统计数据
        this.gameStartTime = 0;
        this.maxCombo = 0;
        this.currentCombo = 0;
        
        // 方块类型定义
        this.pieces = {
            I: {
                color: '#00f5ff',
                matrix: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]
            },
            O: {
                color: '#ffff00',
                matrix: [
                    [1, 1],
                    [1, 1]
                ]
            },
            T: {
                color: '#800080',
                matrix: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            },
            S: {
                color: '#00ff00',
                matrix: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ]
            },
            Z: {
                color: '#ff0000',
                matrix: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ]
            },
            J: {
                color: '#0000ff',
                matrix: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            },
            L: {
                color: '#ffa500',
                matrix: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            }
        };
        
        this.pieceTypes = Object.keys(this.pieces);
        
        this.init();
    }
    
    init() {
        this.initBoard();
        this.nextPiece = this.createPiece();
        this.spawnPiece();
        this.updateDisplay();
        this.showOverlay('游戏准备', '点击开始游戏按钮开始');
    }
    
    initBoard() {
        this.board = [];
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                this.board[row][col] = 0;
            }
        }
    }
    
    createPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        const piece = this.pieces[type];
        return {
            type: type,
            color: piece.color,
            matrix: this.copyMatrix(piece.matrix),
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.matrix[0].length / 2),
            y: 0
        };
    }
    
    copyMatrix(matrix) {
        return matrix.map(row => [...row]);
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.matrix[0].length / 2);
        this.currentPiece.y = 0;
        
        // 检查游戏结束
        if (this.collision(this.currentPiece)) {
            this.gameOver();
            return false;
        }
        
        this.drawNextPiece();
        return true;
    }
    
    collision(piece, dx = 0, dy = 0) {
        const matrix = piece.matrix;
        const x = piece.x + dx;
        const y = piece.y + dy;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] !== 0) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    rotate(piece) {
        const matrix = piece.matrix;
        const N = matrix.length;
        const rotated = [];
        
        // 创建旋转后的矩阵
        for (let i = 0; i < N; i++) {
            rotated[i] = [];
            for (let j = 0; j < N; j++) {
                rotated[i][j] = matrix[N - 1 - j][i];
            }
        }
        
        return rotated;
    }
    
    hardDrop() {
        while (!this.collision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 2; // 硬降给额外分数
        }
        this.lockPiece();
    }
    
    lockPiece() {
        const matrix = this.currentPiece.matrix;
        const x = this.currentPiece.x;
        const y = this.currentPiece.y;
        
        // 将方块锁定到游戏板上
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] !== 0) {
                    if (y + row >= 0) {
                        this.board[y + row][x + col] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // 检查并清除完整的行
        const linesCleared = this.clearLines();
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.currentCombo = linesCleared;
            this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
            
            // 计算分数 (基于消除行数和等级)
            const lineScores = [0, 40, 100, 300, 1200];
            this.score += lineScores[linesCleared] * this.level;
            
            // 升级逻辑
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
        } else {
            this.currentCombo = 0;
        }
        
        // 生成下一个方块
        this.spawnPiece();
        this.updateDisplay();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                // 移除完整的行
                this.board.splice(row, 1);
                // 在顶部添加新的空行
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                row++; // 重新检查当前行
            }
        }
        
        return linesCleared;
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropInterval) {
            if (!this.collision(this.currentPiece, 0, 1)) {
                this.currentPiece.y++;
                // 自然下降不加分
            } else {
                this.lockPiece();
            }
            this.dropTime = 0;
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制游戏板
        this.drawBoard();
        
        // 绘制当前方块
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // 绘制网格
        this.drawGrid();
    }
    
    drawBoard() {
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (this.board[row][col] !== 0) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(
                        col * this.CELL_SIZE,
                        row * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        col * this.CELL_SIZE,
                        row * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                }
            }
        }
    }
    
    drawPiece(piece, context) {
        context.fillStyle = piece.color;
        const matrix = piece.matrix;
        
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] !== 0) {
                    context.fillRect(
                        (piece.x + col) * this.CELL_SIZE,
                        (piece.y + row) * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                    context.strokeStyle = '#333';
                    context.lineWidth = 1;
                    context.strokeRect(
                        (piece.x + col) * this.CELL_SIZE,
                        (piece.y + row) * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        for (let col = 0; col <= this.BOARD_WIDTH; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.CELL_SIZE, 0);
            this.ctx.lineTo(col * this.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let row = 0; row <= this.BOARD_HEIGHT; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, row * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const size = 20;
            const matrix = this.nextPiece.matrix;
            const offsetX = (this.nextCanvas.width - matrix[0].length * size) / 2;
            const offsetY = (this.nextCanvas.height - matrix.length * size) / 2;
            
            this.nextCtx.fillStyle = this.nextPiece.color;
            
            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col] !== 0) {
                        this.nextCtx.fillRect(
                            offsetX + col * size,
                            offsetY + row * size,
                            size,
                            size
                        );
                        this.nextCtx.strokeStyle = '#333';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(
                            offsetX + col * size,
                            offsetY + row * size,
                            size,
                            size
                        );
                    }
                }
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    start() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.hideOverlay();
        this.gameLoop();
    }
    
    pause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('游戏暂停', '按空格键继续游戏');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    restart() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.maxCombo = 0;
        this.currentCombo = 0;
        
        this.init();
        this.start();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 显示游戏统计
        gameStats.showStats({
            score: this.score,
            level: this.level,
            lines: this.lines,
            playTime: Date.now() - this.gameStartTime,
            maxCombo: this.maxCombo
        });
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // 移动方法
    moveLeft() {
        if (this.gameRunning && !this.gamePaused && this.currentPiece) {
            if (!this.collision(this.currentPiece, -1, 0)) {
                this.currentPiece.x--;
            }
        }
    }
    
    moveRight() {
        if (this.gameRunning && !this.gamePaused && this.currentPiece) {
            if (!this.collision(this.currentPiece, 1, 0)) {
                this.currentPiece.x++;
            }
        }
    }
    
    moveDown() {
        if (this.gameRunning && !this.gamePaused && this.currentPiece) {
            if (!this.collision(this.currentPiece, 0, 1)) {
                this.currentPiece.y++;
                this.score += 1; // 只有主动按下键才给软降分数
            }
        }
    }
    
    rotatePiece() {
        if (this.gameRunning && !this.gamePaused && this.currentPiece) {
            const rotated = this.rotate(this.currentPiece);
            const originalMatrix = this.currentPiece.matrix;
            this.currentPiece.matrix = rotated;
            
            // 检查旋转后是否会碰撞
            if (this.collision(this.currentPiece)) {
                // 尝试wall kick
                const kicks = [
                    [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]
                ];
                
                let canRotate = false;
                for (let kick of kicks) {
                    if (!this.collision(this.currentPiece, kick[0], kick[1])) {
                        this.currentPiece.x += kick[0];
                        this.currentPiece.y += kick[1];
                        canRotate = true;
                        break;
                    }
                }
                
                if (!canRotate) {
                    this.currentPiece.matrix = originalMatrix;
                }
            }
        }
    }
}

// 创建游戏实例
const game = new TetrisGame();
