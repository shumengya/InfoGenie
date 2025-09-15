// 经典扫雷（手机竖屏适配 + 无尽模式 + 键盘操作）
// 模块：状态、生成、交互、键盘、统计

class RNG {
  constructor(seed = Date.now()) { this.seed = seed >>> 0; }
  next() { // xorshift32
    let x = this.seed;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.seed = x >>> 0; return this.seed / 0xffffffff;
  }
  range(min, max){ return Math.floor(this.next() * (max - min + 1)) + min; }
}

const GameConfig = {
  start: { rows: 10, cols: 8, mineRatio: 0.12 }, // 竖屏优先：更多行
  levelStep(cfg){
    // 难度递增：逐步增加行列与雷密度，控制在移动端也能点击
    const next = { ...cfg };
    if (next.rows < 16) next.rows++;
    if (next.cols < 12) next.cols += (next.rows % 2 === 0 ? 1 : 0);
    next.mineRatio = Math.min(0.24, +(next.mineRatio + 0.02).toFixed(2));
    return next;
  }
}

const State = {
  level: 1,
  rows: 0,
  cols: 0,
  mineCount: 0,
  revealed: 0,
  flags: 0,
  grid: [], // { mine, r, c, around, revealed, flag }
  timer: 0,
  timerId: null,
  startTs: 0,
  rng: new RNG(),
  stats: { opened:0, flagged:0, mistakes:0, time:0 }
};

function el(sel){ return document.querySelector(sel); }
function make(tag, cls){ const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function updateMinesHud(){ el('#mines').textContent = String(Math.max(0, State.mineCount - State.flags)); }

function startTimer(){
  State.startTs = Date.now();
  const timerEl = el('#timer');
  clearInterval(State.timerId);
  State.timerId = setInterval(() => {
    State.timer = Math.floor((Date.now() - State.startTs)/1000);
    const m = String(Math.floor(State.timer/60)).padStart(2,'0');
    const s = String(State.timer%60).padStart(2,'0');
    timerEl.textContent = `${m}:${s}`;
  }, 250);
}
function stopTimer(){ clearInterval(State.timerId); State.timerId = null; }

function setupBoard(cfg){
  State.rows = cfg.rows; State.cols = cfg.cols;
  const total = cfg.rows * cfg.cols;
  State.mineCount = Math.max(1, Math.floor(total * cfg.mineRatio));
  State.revealed = 0; State.flags = 0; State.grid = [];
  State.stats = { opened:0, flagged:0, mistakes:0, time:0 };

  // 更新HUD
  el('#level').textContent = String(State.level);
  updateMinesHud();

  const board = el('#board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${State.cols}, 1fr)`;

  // 生成空格子
  for(let r=0;r<State.rows;r++){
    State.grid[r] = [];
    for(let c=0;c<State.cols;c++){
      const cell = { mine:false, r, c, around:0, revealed:false, flag:false, el: null };
      const div = make('button','cell');
      div.type = 'button';
      div.setAttribute('role','gridcell');
      div.setAttribute('aria-label', `r${r} c${c}`);
      div.addEventListener('contextmenu', e=> e.preventDefault());
      // 触摸长按
      let pressTimer = null; let longPressed=false;
      div.addEventListener('touchstart', e => {
        longPressed=false;
        pressTimer = setTimeout(()=>{ longPressed=true; toggleFlag(cell); }, 420);
      }, {passive:true});
      div.addEventListener('touchend', e => { if(pressTimer){ clearTimeout(pressTimer); if(!longPressed) openCell(cell); } });
      // 鼠标
      div.addEventListener('mousedown', e => {
        if(e.button===2){ toggleFlag(cell); }
        else if(e.button===0){ if(cell.revealed && cell.around>0) chord(cell); else openCell(cell); }
      });
      cell.el = div;
      State.grid[r][c] = cell;
      board.appendChild(div);
    }
  }

  // 随机埋雷
  let placed=0;
  const setMine = (r,c)=>{ if(!State.grid[r][c].mine){ State.grid[r][c].mine=true; placed++; } };
  while(placed < State.mineCount){ setMine(State.rng.range(0,State.rows-1), State.rng.range(0,State.cols-1)); }
  recomputeArounds();
  // 启动计时
  startTimer();
}

function visitNeighbors(r,c, cb){
  for(let dr=-1; dr<=1; dr++){
    for(let dc=-1; dc<=1; dc++){
      if(dr===0 && dc===0) continue;
      const nr=r+dr, nc=c+dc;
      if(nr>=0 && nr<State.rows && nc>=0 && nc<State.cols) cb(nr,nc);
    }
  }
}
function countFlagsAround(r,c){ let n=0; visitNeighbors(r,c,(nr,nc)=>{ if(State.grid[nr][nc].flag) n++; }); return n; }
function chord(cell){
  if(!cell.revealed || cell.around<=0) return;
  const flagged = countFlagsAround(cell.r, cell.c);
  if(flagged === cell.around){
    visitNeighbors(cell.r, cell.c, (nr,nc)=>{
      const ncell = State.grid[nr][nc];
      if(!ncell.revealed && !ncell.flag){ openCell(ncell); }
    });
  }
}
function recomputeArounds(){
  for(let r=0;r<State.rows;r++){
    for(let c=0;c<State.cols;c++){
      if(State.grid[r][c].mine){ State.grid[r][c].around = 0; continue; }
      let n=0; visitNeighbors(r,c,(nr,nc)=>{ if(State.grid[nr][nc].mine) n++; });
      State.grid[r][c].around = n;
    }
  }
}
function safeFirstClick(badCell){
  // 移除当前雷并将其放到其他非雷位置
  badCell.mine = false;
  while(true){
    const r = State.rng.range(0, State.rows-1);
    const c = State.rng.range(0, State.cols-1);
    const target = State.grid[r][c];
    if(target!==badCell && !target.mine){ target.mine = true; break; }
  }
  recomputeArounds();
}

function openCell(cell){
  if(cell.revealed || cell.flag) return;
  // 首次点击必定安全：若第一次就点到雷，则移动该雷并重算数字
  if(State.revealed===0 && cell.mine){
    safeFirstClick(cell);
  }
  cell.revealed = true; State.revealed++; State.stats.opened++;
  cell.el.classList.add('revealed');
  if(cell.mine){
    cell.el.classList.add('mine');
    endGame(false);
    return;
  }
  if(cell.around>0){ cell.el.dataset.n = cell.around; cell.el.textContent = cell.around; }
  else{
    // flood fill
    visitNeighbors(cell.r, cell.c, (nr,nc)=>{
      const ncell = State.grid[nr][nc];
      if(!ncell.revealed && !ncell.mine) openCell(ncell);
    });
  }
  checkWin();
}

function toggleFlag(cell){
  if(cell.revealed) return;
  cell.flag = !cell.flag;
  State.flags += cell.flag ? 1 : -1;
  State.stats.flagged += cell.flag ? 1 : 0;
  cell.el.classList.toggle('flag', cell.flag);
  updateMinesHud();
}

function checkWin(){
  const totalSafe = State.rows*State.cols - State.mineCount;
  if(State.revealed >= totalSafe){
    // 通关 -> 进入下一关
    showToast(`第 ${State.level} 关完成！`);
    stopTimer();
    setTimeout(()=>{
      State.level++;
      const nextCfg = GameConfig.levelStep({ rows: State.rows, cols: State.cols, mineRatio: State.mineCount/(State.rows*State.cols) });
      setupBoard(nextCfg);
    }, 600);
  }
}

function showToast(msg){
  const t = el('#toast-level');
  t.textContent = msg; t.style.display='block';
  t.animate([
    { transform:'translate(-50%, 20px)', opacity:0 },
    { transform:'translate(-50%, 0)', opacity:1, offset:.2 },
    { transform:'translate(-50%, 0)', opacity:1, offset:.8 },
    { transform:'translate(-50%, 10px)', opacity:0 }
  ], { duration:1200, easing:'ease' }).onfinish = ()=> t.style.display='none';
}

function endGame(win){
  stopTimer();
  // 展示所有雷
  for(let r=0;r<State.rows;r++){
    for(let c=0;c<State.cols;c++){
      const cell = State.grid[r][c];
      if(cell.mine){ cell.el.classList.add('revealed','mine'); }
    }
  }
  State.stats.time = State.timer;
  const statsHtml = `
    <div class="stats">
      <div class="card"><div class="k">关卡</div><div class="v">${State.level}</div></div>
      <div class="card"><div class="k">总用时</div><div class="v">${formatTime(State.timer)}</div></div>
      <div class="card"><div class="k">开格</div><div class="v">${State.stats.opened}</div></div>
      <div class="card"><div class="k">插旗</div><div class="v">${State.stats.flagged}</div></div>
    </div>
    <p style="color:#94a3b8;margin:6px 0 10px">再接再厉，挑战更高难度！</p>
  `;
  el('#stats').innerHTML = statsHtml;
  el('#modal-overlay').style.display = 'grid';
}

function formatTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }

function bindUI(){
  el('#btn-restart').addEventListener('click', ()=> restart());
  el('#btn-retry').addEventListener('click', ()=> restart());
  el('#btn-close').addEventListener('click', ()=>{ el('#modal-overlay').style.display='none'; });
}

function restart(){
  el('#modal-overlay').style.display='none';
  State.level = 1; setupBoard(GameConfig.start);
}

// 键盘操作（电脑端）
let kb = { r:0, c:0 };
function bindKeyboard(){
  document.addEventListener('keydown', (e)=>{
    const key = e.key.toLowerCase();
    if(['arrowup','w'].includes(key)) move(-1,0);
    else if(['arrowdown','s'].includes(key)) move(1,0);
    else if(['arrowleft','a'].includes(key)) move(0,-1);
    else if(['arrowright','d'].includes(key)) move(0,1);
    else if(key==='f'){ toggleFlag(State.grid[kb.r][kb.c]); highlightFocus(); }
    else if(key===' ' || key==='enter'){ openCell(State.grid[kb.r][kb.c]); highlightFocus(); }
  });
}
function move(dr,dc){ kb.r = clamp(kb.r+dr,0,State.rows-1); kb.c = clamp(kb.c+dc,0,State.cols-1); highlightFocus(); }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function highlightFocus(){
  // 简单高亮当前聚焦格
  for(let r=0;r<State.rows;r++){
    for(let c=0;c<State.cols;c++){
      const el = State.grid[r][c].el;
      el.style.outline = (r===kb.r && c===kb.c) ? '2px solid rgba(96,165,250,.9)' : 'none';
    }
  }
}

// 初始化
bindUI(); bindKeyboard();
setupBoard(GameConfig.start);
highlightFocus();