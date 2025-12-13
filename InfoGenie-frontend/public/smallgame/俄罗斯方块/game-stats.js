// 游戏结束排行榜展示
const gameStats = {
  showStats({ score, playTime }) {
    // 将毫秒转为 mm:ss
    const formatDuration = (ms) => {
      const totalSec = Math.max(0, Math.floor(ms / 1000));
      const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      return `${m}:${s}`;
    };

    // 构造排行榜数据（模拟），将当前成绩与 gamedata.js 合并
    const todayStr = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();

    // 当前玩家信息（可根据实际项目替换为真实用户）
    const currentEntry = {
      名称: localStorage.getItem('tetris_player_name') || '我',
      账号: localStorage.getItem('tetris_player_account') || 'guest@local',
      分数: score,
      时间: formatDuration(playTime), // 排行榜展示“游戏时长”
      isCurrent: true,
    };

    // 注意：在浏览器中，使用 const 声明的全局变量不会挂载到 window 上
    // 因此这里直接使用 playerdata，而不是 window.playerdata
    const baseData = (typeof playerdata !== 'undefined' && Array.isArray(playerdata)) ? playerdata : [];

    // 为基础数据模拟“游戏时长”（mm:ss），以满足展示需求
    const simulateDuration = (scoreVal) => {
      const sec = Math.max(30, Math.min(30 * 60, Math.round((Number(scoreVal) || 0) * 1.2)));
      return formatDuration(sec * 1000);
    };

    const merged = [...baseData.map((d) => ({
      ...d,
      // 使用已有分数推导一个模拟时长
      时间: simulateDuration(d.分数),
      isCurrent: false,
    })), currentEntry]
      .sort((a, b) => (b.分数 || 0) - (a.分数 || 0));

    // 3) 渲染排行榜（取前10）
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    const topN = merged.slice(0, 10);
    topN.forEach((item, idx) => {
      const tr = document.createElement('tr');
      if (item.isCurrent) {
        tr.classList.add('current-row');
      }
      const rankCell = document.createElement('td');
      const nameCell = document.createElement('td');
      const scoreCell = document.createElement('td');
      const timeCell = document.createElement('td');

      const rankBadge = document.createElement('span');
      rankBadge.className = 'rank-badge';
      rankBadge.textContent = String(idx + 1);
      rankCell.appendChild(rankBadge);

      nameCell.textContent = item.名称 || '未知';
      scoreCell.textContent = item.分数 || 0;
      timeCell.textContent = item.时间 || formatDuration(playTime);

      tr.appendChild(rankCell);
      tr.appendChild(nameCell);
      tr.appendChild(scoreCell);
      tr.appendChild(timeCell);
      tbody.appendChild(tr);
    });

    // 4) 展示排行榜界面
    const statsEl = document.getElementById('gameStats');
    statsEl.style.display = 'flex';

    // 5) 再玩一次按钮
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        statsEl.style.display = 'none';
        if (window.game && typeof window.game.restart === 'function') {
          window.game.restart();
        }
      };
    }
  },
};

// 暴露到全局
window.gameStats = gameStats;