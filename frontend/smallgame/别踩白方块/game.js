var c = document.getElementById("piano");
var context = c.getContext("2d");
var b = document.getElementById("background");
var context_back = b.getContext("2d");
var a = document.getElementById("score_bar");
var context_score = a.getContext("2d");
 

var numOfTiles = 5;
var myScore = 0;
var eachState = [false,false,false,false,false];
var myTiles = [];

var intervalTmp;
var geneTmp;
var gameSpeed = 1; // 游戏速度倍数，初始为1倍
var baseInterval = 5; // 基础更新间隔（毫秒）
var baseGenerateInterval = 600; // 基础生成间隔（毫秒）

paintWindow(); 
paintScoreBar();

// 添加全局鼠标和触摸事件监听
c.addEventListener('click', function(e) {
    handleClick(e);
});

c.addEventListener('touchstart', function(e) {
    e.preventDefault();
    handleTouch(e);
});

document.getElementById('start_btn').addEventListener('click',function(e){
    var content = document.getElementById('start_btn');
    if(content.innerHTML == "开始游戏" || content.innerHTML == "继续游戏"){
        startGame();
    }
    else{
        pauseGame();
    }
});

// 重新开始按钮事件
document.getElementById('restart-btn').addEventListener('click', function(){
    restartGame();
});

function startGame(){
    var content = document.getElementById('start_btn');
    updateGameSpeed();
    document.getElementById('music').play();
    content.innerHTML = "暂停游戏";
    content.className = "game-btn pause-btn";
}

// 更新游戏速度
function updateGameSpeed() {
    // 清除现有定时器
    if (intervalTmp) clearInterval(intervalTmp);
    if (geneTmp) clearInterval(geneTmp);
    
    // 保持正常1倍速度，不加速
    gameSpeed = 1;
    
    // 设置新的定时器，优化性能
    intervalTmp = setInterval(upDate, Math.max(baseInterval / gameSpeed, 3));
    geneTmp = setInterval(geneBlock, Math.max(baseGenerateInterval / gameSpeed, 200));
}

function pauseGame(){
    var content = document.getElementById('start_btn');
    document.getElementById('music').pause();
    window.clearInterval(intervalTmp);
    window.clearInterval(geneTmp);
    content.innerHTML = "继续游戏";
    content.className = "game-btn start-btn";
}

function gameOver(){
    document.getElementById('music').pause();
    window.clearInterval(intervalTmp);
    window.clearInterval(geneTmp);
    
    // 显示最终得分和达到的最高速度
    document.getElementById('final-score-value').innerHTML = myScore;
    document.getElementById('final-speed-value').innerHTML = gameSpeed.toFixed(1);
    
    // 显示游戏结束弹窗
    document.getElementById('game-over-modal').style.display = 'flex';
}

function restartGame(){
    // 重置游戏状态
    myScore = 0;
    gameSpeed = 1; // 重置游戏速度
    eachState = [false,false,false,false,false];
    myTiles = [];
    
    // 清空画布
    context.clearRect(0,0,300,600);
    context_back.clearRect(0,0,300,600);
    context_score.clearRect(0,0,300,60);
    
    // 重新绘制背景
    paintWindow();
    paintScoreBar();
    
    // 隐藏弹窗
    document.getElementById('game-over-modal').style.display = 'none';
    
    // 重置按钮状态
    var content = document.getElementById('start_btn');
    content.innerHTML = "开始游戏";
    content.className = "game-btn start-btn";
}
function paintScoreBar(){
    // 清空画布
    context_score.clearRect(0,0,300,60);
    
    // 绘制黑色背景
    context_score.fillStyle = "#333";
    context_score.fillRect(0,0,300,60);
    
    // 更新HTML显示
    document.getElementById('score-value').textContent = myScore;
    document.getElementById('speed-value').textContent = gameSpeed.toFixed(1);
}
function geneBlock(){
    var myRand = Math.floor(Math.random()*numOfTiles);
    var i;
    var flag = true;
    for( i = 0; i < numOfTiles; ++i){
        if(!eachState[i]){
            flag = false;
        }
    }
    if(flag)return;//if mytiles array didn't have false element, then return

    while(eachState[myRand])
        myRand = Math.floor(Math.random()*numOfTiles);
    myTiles[myRand] = new Block(myRand);
     
}
function paintWindow(){
    // 清空背景
    context_back.clearRect(0,0,300,600);
    
    // 绘制白色背景
    context_back.fillStyle = "white";
    context_back.fillRect(0,0,300,600);

    // 绘制分隔线
    context_back.strokeStyle = "#ddd";
    context_back.lineWidth = 2;
    
    // 垂直分隔线
    context_back.beginPath();
    context_back.moveTo(75,0);
    context_back.lineTo(75,600);
    context_back.stroke();

    context_back.beginPath();
    context_back.moveTo(150,0);
    context_back.lineTo(150,600);
    context_back.stroke();

    context_back.beginPath();
    context_back.moveTo(225,0);
    context_back.lineTo(225,600);
    context_back.stroke();

    // 可点击区域警戒线
    context_back.strokeStyle = "#ff4444";
    context_back.lineWidth = 3;
    context_back.beginPath();
    context_back.moveTo(0,250);
    context_back.lineTo(300,250);
    context_back.stroke();

    // 底部失败线
    context_back.strokeStyle = "#ff4444";
    context_back.lineWidth = 3;
    context_back.beginPath();
    context_back.moveTo(0,470);
    context_back.lineTo(300,470);
    context_back.stroke();
}
function Block(index){
    if(!eachState[index])
        eachState[index] = true;

    this.index = index;
    this.appearPos = Math.floor(Math.random()*4);
   
    this.width = 75;
    this.height = 120;
    this.color = "black";
    switch(this.appearPos){
        case 0:
            this.x = 0;
            this.y = -120;
            break;
        case 1:
            this.x = 75;
            this.y = -120;
            break;
        case 2:
            this.x = 150;
            this.y = -120;
            break;
        case 3:
            this.x = 225;
            this.y = -120;
            break;
    }
    context.fillStyle = this.color;
    context.fillRect(this.x,this.y,this.width,this.height);
    this.live = true;

    window.addEventListener('keydown',function(e){
        myTiles[index].keyCode = e.keyCode;
    });
    window.addEventListener('keyup',function(e){
        myTiles[index].keyCode = false;
    });
}
function move(index){
    if(myTiles[index].live){
        myTiles[index].y += Math.ceil(gameSpeed);
        // 绘制逻辑已移到upDate函数中，避免重复绘制
    }
}
function afterRight(index){
    myScore++;
    // 清除方块（在upDate中统一处理绘制）
    myTiles[index].live = false;
    eachState[index] = false;
    
    // 立即更新得分显示
    paintScoreBar();
    
    // 每次得分都更新游戏速度，实现平滑渐进加速
    updateGameSpeed();
}
// 处理鼠标点击事件
function handleClick(e) {
    var rect = c.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    
    checkHit(x, y);
}

// 处理触摸事件
function handleTouch(e) {
    var rect = c.getBoundingClientRect();
    var touch = e.touches[0];
    var x = touch.clientX - rect.left;
    var y = touch.clientY - rect.top;
    
    checkHit(x, y);
}

// 检查点击/触摸是否命中方块
function checkHit(x, y) {
    // 检查是否点击到黑色方块
    for (var i = 0; i < numOfTiles; i++) {
        if (eachState[i] && myTiles[i].live) {
            // 检查点击位置是否在方块范围内
            if (x >= myTiles[i].x && x <= myTiles[i].x + 75 &&
                y >= myTiles[i].y && y <= myTiles[i].y + 120) {
                // 检查方块是否在可点击区域（提高到130像素以上）
                if (myTiles[i].y + 120 > 130) {
                    afterRight(i);
                    return true;
                }
            }
        }
    }
    
    // 如果没有点击到任何黑色方块，且点击位置在游戏区域内，则游戏结束
    if (y > 130 && y < 600) {
        gameOver();
        return false;
    }
    
    return false;
}

function upDate(){//check keyCode whether correct
    var i;
    
    // 清空整个游戏区域，避免重叠
    context.clearRect(0, 0, 300, 600);
    
    // 移动并重绘所有活跃的方块
    for(i = 0; i < numOfTiles; ++i){
        if(eachState[i]){
            myTiles[i].y += Math.ceil(gameSpeed); // 使用整数移动，避免模糊
            context.fillStyle = "black";
            context.fillRect(myTiles[i].x, myTiles[i].y, 75, 120);
        }
    }
    for(i = 0; i < numOfTiles; ++i){
        if( eachState[i] ){
            if(myTiles[i].y < 470 && myTiles[i].y >350){
                switch(myTiles[i].keyCode){
                    case 65: //A
                        if(myTiles[i].x == 0)
                            afterRight(i);
                        break;
                    case 83: //S
                        if(myTiles[i].x == 75)
                            afterRight(i);
                        break;
                    case 68: //D
                        if(myTiles[i].x == 150)
                            afterRight(i);
                        break;
                    case 70: //F
                        if(myTiles[i].x == 225)
                            afterRight(i);
                        break;       
                }
            }
            if(myTiles[i].y > 470){
                // 方块到达底部，游戏结束
                myTiles[i].live = false;
                eachState[i] = false;
                gameOver();
                return; // 立即退出，避免继续处理
            }
        }
        else{//not alive

        }
    }
}
 