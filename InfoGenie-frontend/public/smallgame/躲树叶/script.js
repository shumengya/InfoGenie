(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hudScoreEl = document.getElementById('score');
  const pauseBtn = document.getElementById('pauseBtn');
  const startOverlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');
  const restartBtn = document.getElementById('restartBtn');
  const rotateOverlay = document.getElementById('rotateOverlay');

  let width = 0, height = 0, DPR = 1;
  let running = false, paused = false;
  let lastTime = 0, timeElapsed = 0, score = 0, spawnTimer = 0;

  const player = { x: 0, y: 0, r: 18, vx: 0, targetX: null };
  const obstacles = [];
  let pointerActive = false;

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function rand(min, max){ return Math.random()*(max-min)+min; }

  function updateOrientationOverlay(){
    const landscape = window.innerWidth > window.innerHeight;
    rotateOverlay.style.display = landscape ? 'flex' : 'none';
  }

  function resize(){
    updateOrientationOverlay();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!running){
      player.x = width * 0.5;
      player.y = height - Math.max(80, height * 0.12);
    } else {
      player.y = height - Math.max(80, height * 0.12);
      player.x = clamp(player.x, player.r + 8, width - player.r - 8);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function drawBackground(){
    // 轻微的顶部高光，让画面更通透
    const g = ctx.createLinearGradient(0,0,0,height);
    g.addColorStop(0,'rgba(255,255,255,0.10)');
    g.addColorStop(1,'rgba(255,255,255,0.00)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);
  }

  function drawPlayer(){
    ctx.save();
    ctx.translate(player.x, player.y);
    const r = player.r;
    const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.2, 0, 0, r);
    grad.addColorStop(0, '#5fca7e');
    grad.addColorStop(1, '#3a9e5a');
    ctx.fillStyle = grad;
    // 圆形带小叶柄的简化“叶子”角色
    ctx.beginPath();
    ctx.arc(0,0,r,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(58,158,90,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r*0.9);
    ctx.quadraticCurveTo(r*0.2, -r*1.3, r*0.5, -r*1.0);
    ctx.stroke();
    ctx.restore();
  }

  function spawnObstacle(){
    const difficulty = 1 + timeElapsed * 0.08; // 随时间慢慢提升
    const r = rand(10, 22);
    const x = rand(r+8, width - r - 8);
    const speed = rand(90, 140) * (0.9 + difficulty * 0.5);
    const rot = rand(-Math.PI*0.5, Math.PI*0.5);
    obstacles.push({ x, y: -r - 20, r, speed, rot, swayPhase: Math.random()*Math.PI*2, swayAmp: rand(6,12) });
  }

  function drawObstacle(o){
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot);
    const r = o.r;
    ctx.beginPath();
    ctx.ellipse(0, 0, r*0.9, r*0.6, 0, 0, Math.PI*2);
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, '#d8f7c2');
    grad.addColorStop(0.5, '#b9ef9f');
    grad.addColorStop(1, '#9edf77');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,150,90,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r*0.5, 0);
    ctx.quadraticCurveTo(0, -r*0.3, r*0.5, 0);
    ctx.stroke();
    ctx.restore();
  }

  function update(dt){
    const difficulty = 1 + timeElapsed * 0.08;
    const spawnInterval = Math.max(0.12, 0.9 / difficulty);
    spawnTimer -= dt;
    if (spawnTimer <= 0){
      spawnObstacle();
      spawnTimer = spawnInterval;
    }

    // 障碍移动 + 轻微左右摆动
    for (let i = 0; i < obstacles.length; i++){
      const o = obstacles[i];
      o.y += o.speed * dt;
      o.x += Math.sin(o.swayPhase + timeElapsed * 1.6) * (o.swayAmp * dt);
    }

    // 清除离开屏幕的障碍
    for (let i = obstacles.length - 1; i >= 0; i--){
      const o = obstacles[i];
      if (o.y > height + o.r + 60){
        obstacles.splice(i, 1);
      }
    }

    // 键盘轻推（桌面端备用）
    if (player.targetX != null){
      const dir = player.targetX - player.x;
      player.vx = clamp(dir, -500, 500);
      player.x += player.vx * dt;
      if (Math.abs(dir) < 2){
        player.targetX = null;
        player.vx = 0;
      }
    }

    // 限制玩家范围
    player.x = clamp(player.x, player.r + 8, width - player.r - 8);

    // 碰撞检测（近似圆形）
    for (const o of obstacles){
      const dx = o.x - player.x;
      const dy = o.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < player.r + o.r * 0.65){
        endGame();
        return;
      }
    }

    // 计分：按生存时间累计
    score += dt * 10; // 每秒约10分
    hudScoreEl.textContent = Math.floor(score);
  }

  function render(){
    ctx.clearRect(0,0,width,height);
    drawBackground();
    for (const o of obstacles) drawObstacle(o);
    drawPlayer();
  }

  function loop(t){
    if (!running){ return; }
    if (paused){
      lastTime = t;
      requestAnimationFrame(loop);
      return;
    }
    if (!lastTime) lastTime = t;
    const dt = Math.min(0.033, (t - lastTime)/1000);
    lastTime = t;
    timeElapsed += dt;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function startGame(){
    obstacles.length = 0;
    score = 0;
    timeElapsed = 0;
    spawnTimer = 0;
    running = true;
    paused = false;
    lastTime = 0;
    startOverlay.classList.remove('show');
    gameOverOverlay.classList.remove('show');
    resize();
    requestAnimationFrame(loop);
  }

  function endGame(){
    running = false;
    paused = false;
    finalScoreEl.textContent = Math.floor(score);
    gameOverOverlay.classList.add('show');
  }

  function pointerToCanvasX(e){
    const rect = canvas.getBoundingClientRect();
    return clamp(e.clientX - rect.left, 0, rect.width);
  }

  // 触控与指针事件：按住并左右拖动
  canvas.addEventListener('pointerdown', e => {
    pointerActive = true;
    player.targetX = null;
    player.x = pointerToCanvasX(e);
  });
  canvas.addEventListener('pointermove', e => {
    if (!pointerActive) return;
    player.x = pointerToCanvasX(e);
  });
  canvas.addEventListener('pointerup', () => { pointerActive = false; });
  canvas.addEventListener('pointercancel', () => { pointerActive = false; });

  // 轻点屏幕：向左/右轻推一段距离
  canvas.addEventListener('click', e => {
    const x = pointerToCanvasX(e);
    const center = width / 2;
    const dir = x < center ? -1 : 1;
    player.targetX = clamp(player.x + dir * Math.max(50, width * 0.12), player.r + 8, width - player.r - 8);
  });

  // 键盘备用控制（桌面端）
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a'){
      player.targetX = clamp(player.x - Math.max(50, width * 0.12), player.r + 8, width - player.r - 8);
    } else if (e.key === 'ArrowRight' || e.key === 'd'){
      player.targetX = clamp(player.x + Math.max(50, width * 0.12), player.r + 8, width - player.r - 8);
    } else if (e.key === ' ') {
      togglePause();
    } else if (e.key === 'Enter' && !running){
      startGame();
    }
  });

  // 按钮
  pauseBtn.addEventListener('click', togglePause);
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  function togglePause(){
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '▶' : 'Ⅱ';
  }

  // 避免滚动与系统手势干扰
  ['touchstart','touchmove','touchend'].forEach(type => {
    window.addEventListener(type, e => { if (pointerActive) e.preventDefault(); }, { passive: false });
  });
})();