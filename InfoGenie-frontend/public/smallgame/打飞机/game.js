const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreVal');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');
const overOverlay = document.getElementById('overOverlay');
const againBtn = document.getElementById('againBtn');
const finalScoreEl = document.getElementById('finalScore');

let width = 0, height = 0;
let running = false, paused = false, gameOver = false;
let player, bullets = [], enemies = [], particles = [];
let score = 0, elapsed = 0, spawnTimer = 0, fireTimer = 0;

function fitCanvas(){
  const w = canvas.clientWidth | 0;
  const h = canvas.clientHeight | 0;
  if (canvas.width !== w || canvas.height !== h){
    canvas.width = w;
    canvas.height = h;
  }
  width = canvas.width; height = canvas.height;
}

function clamp(v,min,max){ return v < min ? min : (v > max ? max : v); }
function rand(min,max){ return Math.random()*(max-min)+min; }

function initGame(){
  fitCanvas();
  score = 0;
  elapsed = 0;
  spawnTimer = 0;
  fireTimer = 0;
  bullets.length = 0;
  enemies.length = 0;
  particles.length = 0;
  gameOver = false;
  paused = false;
  player = {
    x: width/2,
    y: height*0.82,
    r: Math.max(14, Math.min(width,height)*0.02),
    speed: Math.max(350, Math.min(width,height)*0.9),
    alive: true
  };
  scoreEl.textContent = '0';
  pauseBtn.textContent = '暂停';
}

function startGame(){
  running = true;
  startOverlay.classList.add('hide');
  overOverlay.classList.add('hide');
  initGame();
  requestAnimationFrame(loop);
}

function restartGame(){
  startOverlay.classList.add('hide');
  startGame();
}

pauseBtn.addEventListener('click', ()=>{
  if (!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? '继续' : '暂停';
});
restartBtn.addEventListener('click', ()=>{ initGame(); });
startBtn.addEventListener('click', startGame);
againBtn.addEventListener('click', ()=>{ startOverlay.classList.add('hide'); startGame(); });
window.addEventListener('resize', fitCanvas);

let pointerActive = false;
canvas.addEventListener('pointerdown', (e)=>{
  pointerActive = true;
  if (!running) startGame();
  movePlayer(e);
  canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e)=>{ if (pointerActive) movePlayer(e); });
canvas.addEventListener('pointerup', ()=>{ pointerActive = false; });

function movePlayer(e){
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);
  const minY = height * 0.45;
  player.x = clamp(x, player.r, width - player.r);
  player.y = clamp(y, minY, height - player.r);
}

function spawnEnemy(){
  const d = Math.min(6, 1 + elapsed/10);
  let r, x, speed, hp, color, type;
  const roll = Math.random();

  if (roll < 0.5 - Math.min(0.2, elapsed*0.02)) { // 普通
    type = 'normal';
    r = rand(12, 18 + d*1.8);
    x = rand(r, width - r);
    speed = rand(60 + d*20, 110 + d*30);
    hp = 1; color = 'rgba(70,160,80,0.9)';
    enemies.push({x, y: -r, r, speed, hp, color, type});
  } else if (roll < 0.75) { // 快速
    type = 'fast';
    r = rand(10, 14 + d);
    x = rand(r, width - r);
    speed = rand(130 + d*35, 220 + d*40);
    hp = 1; color = 'rgba(120,200,90,0.95)';
    enemies.push({x, y: -r, r, speed, hp, color, type});
  } else if (roll < 0.92) { // 之字形
    type = 'zigzag';
    r = rand(12, 18 + d*1.5);
    x = rand(r, width - r);
    speed = rand(90 + d*20, 140 + d*25);
    hp = 1; color = 'rgba(90,180,110,0.95)';
    const vxAmp = rand(40, 80);
    const freq = rand(2, 4);
    const phase = rand(0, Math.PI*2);
    enemies.push({x, y: -r, r, speed, hp, color, type, vxAmp, freq, phase});
  } else if (roll < 0.98) { // 坦克型（耐久）
    type = 'tough';
    r = rand(20, 26 + d);
    x = rand(r, width - r);
    speed = rand(60, 100 + d*10);
    hp = 3; color = 'rgba(50,140,70,0.9)';
    enemies.push({x, y: -r, r, speed, hp, color, type});
  } else { // 分裂型
    type = 'splitter';
    r = rand(22, 28 + d);
    x = rand(r, width - r);
    speed = rand(70 + d*15, 100 + d*20);
    hp = 2; color = 'rgba(80,170,90,0.95)';
    enemies.push({x, y: -r, r, speed, hp, color, type});
  }
}

function spawnChildren(parent){
  const count = 2;
  for (let k=0; k<count; k++){
    const r = Math.max(8, parent.r*0.45);
    const x = clamp(parent.x + rand(-r, r), r, width - r);
    const speed = rand(120, 180);
    const vx = rand(-60, 60);
    enemies.push({ x, y: parent.y + 6, r, speed, hp: 1, color: 'rgba(140,220,110,0.95)', type: 'mini', vx });
  }
}
function fireBullet(){
  const br = Math.max(3, player.r*0.22);
  bullets.push({x: player.x, y: player.y - player.r - br, r: br, vy: -420});
}

function update(dt){
  if (!running || paused || gameOver) return;
  elapsed += dt;
  // difficulty & spawn interval decreases over time
  const interval = Math.max(0.16, 0.72 - elapsed*0.018);
  spawnTimer -= dt;
  if (spawnTimer <= 0){ spawnEnemy(); spawnTimer = interval; }
  // auto fire
  const fireInterval = Math.max(0.08, 0.14 - elapsed*0.002);
  fireTimer -= dt;
  if (fireTimer <= 0){ fireBullet(); fireTimer = fireInterval; }
  // bullets
  for (let i=bullets.length-1; i>=0; i--){
    const b = bullets[i];
    b.y += b.vy * dt;
    if (b.y + b.r < 0){ bullets.splice(i,1); }
  }
  // enemies
  const speedBoost = Math.min(2.2, 1 + elapsed*0.015);
  for (let i=enemies.length-1; i>=0; i--){
    const e = enemies[i];
    // 不同类型的移动方式
    if (e.type === 'zigzag'){
      e.y += e.speed * speedBoost * dt;
      e.phase += (e.freq || 3) * dt;
      e.x += Math.sin(e.phase) * (e.vxAmp || 60) * dt;
      e.x = clamp(e.x, e.r, width - e.r);
    } else if (e.type === 'mini'){
      e.y += e.speed * speedBoost * dt;
      e.x += (e.vx || 0) * dt;
      e.x = clamp(e.x, e.r, width - e.r);
    } else {
      e.y += e.speed * speedBoost * dt;
    }
    // 与玩家碰撞
    const dx = e.x - player.x, dy = e.y - player.y;
    const rr = e.r + player.r;
    if (dx*dx + dy*dy < rr*rr){ endGame(); break; }
    if (e.y - e.r > height){ enemies.splice(i,1); }
  }
  // bullet-enemy collisions
  for (let i=enemies.length-1; i>=0; i--){
    const e = enemies[i];
    for (let j=bullets.length-1; j>=0; j--){
      const b = bullets[j];
      const dx = e.x - b.x, dy = e.y - b.y;
      const rr = e.r + b.r;
      if (dx*dx + dy*dy <= rr*rr){
        bullets.splice(j,1);
        e.hp -= 1;
        addBurst(e.x, e.y, e.r);
        if (e.hp <= 0){
          if (e.type === 'splitter'){ spawnChildren(e); }
          enemies.splice(i,1);
          score += (e.type === 'tough' ? 2 : 1);
          scoreEl.textContent = score;
        }
        break;
      }
    }
  }
  // particles
  for (let i=particles.length-1; i>=0; i--){
    const p = particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i,1);
  }
}

function addBurst(x,y,r){
  for (let i=0; i<6; i++){
    const a = Math.random() * Math.PI * 2;
    const speed = rand(40, 140);
    particles.push({ x, y, vx: Math.cos(a)*speed, vy: Math.sin(a)*speed, life: rand(0.15, 0.4) });
  }
}

function draw(){
  fitCanvas();
  ctx.clearRect(0,0,width,height);
  // soft overlay for depth
  const grd = ctx.createLinearGradient(0,0,0,height);
  grd.addColorStop(0, 'rgba(255,255,255,0.0)');
  grd.addColorStop(1, 'rgba(255,255,255,0.05)');
  ctx.fillStyle = grd; ctx.fillRect(0,0,width,height);

  // player
  drawPlayer();
  // bullets
  ctx.fillStyle = 'rgba(80,180,90,0.9)';
  for (let i=0; i<bullets.length; i++){
    const b = bullets[i];
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
  }
  // enemies
  for (let i=0; i<enemies.length; i++){
    const e = enemies[i];
    ctx.fillStyle = e.color; drawEnemy(e);
  }
  // particles
  ctx.fillStyle = 'rgba(160,220,140,0.9)';
  for (let i=0; i<particles.length; i++){
    const p = particles[i];
    ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
  }
}

function drawPlayer(){
  const x = player.x, y = player.y, r = player.r;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(60,150,80,0.95)';
  ctx.strokeStyle = 'rgba(40,120,60,0.9)'; ctx.lineWidth = 2;
  // body
  ctx.beginPath();
  ctx.moveTo(0, -r*1.2);
  ctx.quadraticCurveTo(r*0.3, -r*0.4, r*0.25, r*0.3);
  ctx.lineTo(0, r*1.1);
  ctx.lineTo(-r*0.25, r*0.3);
  ctx.quadraticCurveTo(-r*0.3, -r*0.4, 0, -r*1.2);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // wings
  ctx.beginPath(); ctx.fillStyle = 'rgba(90,180,110,0.95)';
  ctx.moveTo(-r*0.9, r*0.1);
  ctx.lineTo(r*0.9, r*0.1);
  ctx.lineTo(r*0.5, r*0.4);
  ctx.lineTo(-r*0.5, r*0.4);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawEnemy(e){
  const r = e.r;
  ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.arc(e.x - r*0.3, e.y - r*0.3, r*0.4, 0, Math.PI*2); ctx.fill();
}

function endGame(){
  gameOver = true; running = false;
  finalScoreEl.textContent = score;
  overOverlay.classList.remove('hide');
}

let last = 0;
function loop(ts){
  if (!last) last = ts;
  const dt = Math.min(0.033, (ts - last) / 1000);
  last = ts;
  update(dt);
  draw();
  if (running) requestAnimationFrame(loop);
}

// 初始显示开始覆盖层
fitCanvas();