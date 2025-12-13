// 清新跑酷 - Endless Runner (Mobile Portrait, Touch-friendly)
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('overlay');
  const overlayRestart = document.getElementById('overlayRestart');
  const finalScoreEl = document.getElementById('finalScore');

  let dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  let running = true;
  let gameOver = false;
  let lastTime = performance.now();
  let elapsed = 0; // seconds
  let score = 0;

  const world = {
    width: 360,
    height: 640,
    groundH: 90,      // 地面高度（CSS像素）
    baseSpeed: 240,   // 初始速度（px/s）
    speed: 240,       // 当前速度（随难度提升）
    gravity: 1800,    // 重力（px/s^2）
    jumpV: -864,      // 跳跃初速度（px/s）
  };

  const player = {
    x: 72,
    y: 0,     // 通过 resetPlayer 设置
    w: 44,
    h: 54,
    vy: 0,
    grounded: false,
    color: '#2f7d5f'
  };

  const obstacles = [];
  const coins = [];
  let obstacleTimer = 0; // ms 到下一个障碍
  let coinTimer = 0;     // ms 到下一个道具

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resizeCanvas() {
    dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const cssWidth = Math.min(480, document.documentElement.clientWidth);
    const cssHeight = document.documentElement.clientHeight;

    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 使用CSS像素绘制

    world.width = cssWidth;
    world.height = cssHeight;
    world.groundH = Math.max(64, Math.floor(world.height * 0.14));

    resetPlayer();
  }

  function resetPlayer() {
    player.y = world.height - world.groundH - player.h;
    player.vy = 0;
    player.grounded = true;
  }

  function spawnObstacle() {
    const w = rand(28, 56);
    const h = rand(40, clamp(world.height * 0.28, 80, 140));
    const y = world.height - world.groundH - h;
    obstacles.push({ x: world.width + w, y, w, h, color: '#3ea573' });

    // 以一定概率在障碍上方生成一个金币
    if (Math.random() < 0.6) {
      const cx = world.width + w + rand(10, 40);
      const cy = y - rand(28, 56);
      coins.push({ x: cx, y: cy, r: 10, color: '#f6c453' });
    }
  }

  function spawnCoin() {
    const r = 10;
    const yTop = world.height * 0.35; // 道具浮在中上区域
    const y = rand(yTop, world.height - world.groundH - 80);
    coins.push({ x: world.width + 60, y, r, color: '#f6c453' });
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= r * r;
  }

  function jump() {
    if (gameOver) return;
    if (player.grounded) {
      player.vy = world.jumpV;
      player.grounded = false;
    }
  }

  function update(dt) {
    // 难度递增：速度随时间上涨，生成间隔缩短
    elapsed += dt;
    world.speed = world.baseSpeed + elapsed * 22; // 每秒加速

    obstacleTimer -= dt * 1000;
    coinTimer -= dt * 1000;

    const minInterval = clamp(1400 - elapsed * 20, 700, 1600); // 障碍间隔（更远）
    const coinInterval = clamp(1200 - elapsed * 25, 500, 1200); // 金币间隔

    if (obstacleTimer <= 0) {
      spawnObstacle();
      obstacleTimer = rand(minInterval, minInterval * 1.35);
    }
    if (coinTimer <= 0) {
      spawnCoin();
      coinTimer = rand(coinInterval * 0.6, coinInterval);
    }

    // 玩家物理
    player.vy += world.gravity * dt;
    player.y += player.vy * dt;
    const groundY = world.height - world.groundH - player.h;
    if (player.y >= groundY) {
      player.y = groundY;
      player.vy = 0;
      player.grounded = true;
    }

    // 移动障碍与金币
    const dx = world.speed * dt;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= dx;
      if (ob.x + ob.w < 0) obstacles.splice(i, 1);
    }
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.x -= dx;
      if (c.x + c.r < 0) coins.splice(i, 1);
    }

    // 碰撞检测：障碍
    for (const ob of obstacles) {
      if (rectsOverlap(player.x, player.y, player.w, player.h, ob.x, ob.y, ob.w, ob.h)) {
        endGame();
        return;
      }
    }

    // 拾取金币
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      if (circleRectOverlap(c.x, c.y, c.r, player.x, player.y, player.w, player.h)) {
        score += 100; // 金币加分
        coins.splice(i, 1);
      }
    }

    // 距离积分（随速度）
    score += Math.floor(world.speed * dt * 0.2);
    scoreEl.textContent = String(score);
  }

  function drawGround() {
    const y = world.height - world.groundH;
    // 地面阴影渐变
    const grad = ctx.createLinearGradient(0, y, 0, world.height);
    grad.addColorStop(0, 'rgba(60, 150, 110, 0.35)');
    grad.addColorStop(1, 'rgba(60, 150, 110, 0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, world.width, world.groundH);

    // 地面纹理线
    ctx.strokeStyle = 'rgba(47, 79, 63, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }

  function drawPlayer() {
    ctx.fillStyle = player.color;
    const r = 8; // 圆角
    const x = player.x, y = player.y, w = player.w, h = player.h;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();

    // 前进指示条
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x + 6, y + 10, 6, 12);
    ctx.fillRect(x + 18, y + 10, 6, 12);
  }

  function drawObstacles() {
    for (const ob of obstacles) {
      // 渐变柱体
      const g = ctx.createLinearGradient(ob.x, ob.y, ob.x, ob.y + ob.h);
      g.addColorStop(0, '#52b985');
      g.addColorStop(1, '#3ea573');
      ctx.fillStyle = g;
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      // 顶部高亮
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(ob.x, ob.y, ob.w, 4);
    }
  }

  function drawCoins() {
    for (const c of coins) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      // 外圈高光
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function draw(now) {
    // 清屏（CSS负责背景渐变，这里仅清理）
    ctx.clearRect(0, 0, world.width, world.height);

    drawGround();
    drawPlayer();
    drawObstacles();
    drawCoins();

    // 速度指示（右上角小提示）
    ctx.fillStyle = 'rgba(47,79,63,0.35)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`速度 ${Math.round(world.speed)}px/s`, world.width - 8, 18);
  }

  function endGame() {
    running = false;
    gameOver = true;
    finalScoreEl.textContent = String(score);
    overlay.hidden = false;
  }

  function resetGame() {
    running = true;
    gameOver = false;
    obstacles.length = 0;
    coins.length = 0;
    obstacleTimer = 0;
    coinTimer = rand(400, 900);
    score = 0;
    elapsed = 0;
    resetPlayer();
    overlay.hidden = true;
    lastTime = performance.now();
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000); // 限制最大步长
    lastTime = now;

    if (running) {
      update(dt);
      draw(now);
    }
    requestAnimationFrame(loop);
  }

  // 输入事件
  function onKey(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  }
  function onPointer() { jump(); }

  restartBtn.addEventListener('click', () => {
    resetGame();
  });
  overlayRestart.addEventListener('click', () => {
    resetGame();
  });

  window.addEventListener('keydown', onKey, { passive: false });
  window.addEventListener('mousedown', onPointer);
  window.addEventListener('touchstart', onPointer, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // 初始化并启动
  resizeCanvas();
  requestAnimationFrame(loop);
})();