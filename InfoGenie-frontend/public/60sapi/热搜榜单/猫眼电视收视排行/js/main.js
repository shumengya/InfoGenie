const API_ENDPOINTS = [
    "https://60s.api.shumengya.top/v2/maoyan/realtime/tv"
];

const FALLBACK_ENDPOINT = "./返回接口.json";
const REFRESH_INTERVAL = 4000;
const MAX_ITEMS = 40;

const refreshButton = document.getElementById("refreshButton");
const updateTimeEl = document.getElementById("updateTime");
const programmeListEl = document.getElementById("programmeList");
const programmeCountEl = document.getElementById("programmeCount");
const topMarketRateEl = document.getElementById("topMarketRate");
const topAttentionRateEl = document.getElementById("topAttentionRate");
const refreshGapEl = document.getElementById("refreshGap");

let isLoading = false;
let autoTimer = null;

function escapeHtml(value) {
    if (value === undefined || value === null) {
        return "";
    }
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeText(value, fallback = "--") {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    return escapeHtml(value);
}

function formatNumber(value, fractionDigits = 2) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return "--";
    }
    return numeric.toFixed(fractionDigits);
}

function formatGapText(seconds) {
    const numeric = Number(seconds);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return "--";
    }
    if (numeric < 60) {
        return `约每 ${Math.round(numeric)} 秒`;
    }
    const minutes = Math.floor(numeric / 60);
    const remaining = Math.round(numeric % 60);
    if (remaining === 0) {
        return `约每 ${minutes} 分钟`;
    }
    return `约每 ${minutes} 分 ${remaining} 秒`;
}

function parseRate(value) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
        return {
            text: numeric.toFixed(4).replace(/0+$/, "").replace(/\.$/, ""),
            ratio: Math.max(0, Math.min(numeric, 100))
        };
    }
    return { text: "--", ratio: 0 };
}

function formatUpdateTime(data) {
    if (data && typeof data.updated === "string" && data.updated.trim().length > 0) {
        return data.updated.trim();
    }
    if (data && typeof data.updated_at === "number" && Number.isFinite(data.updated_at)) {
        return new Date(data.updated_at).toLocaleString("zh-CN", { hour12: false });
    }
    return new Date().toLocaleString("zh-CN", { hour12: false });
}

function renderInsights(list, gapSecond) {
    const total = Array.isArray(list) ? list.length : 0;
    programmeCountEl.textContent = total ? total.toString() : "--";

    if (total) {
        const topMarket = list.reduce((max, item) => {
            const value = Number(item?.market_rate);
            return value > max ? value : max;
        }, 0);
        const topAttention = list.reduce((max, item) => {
            const value = Number(item?.attention_rate);
            return value > max ? value : max;
        }, 0);

        topMarketRateEl.textContent = topMarket ? topMarket.toFixed(2) : "--";
        topAttentionRateEl.textContent = topAttention ? topAttention.toFixed(2) : "--";
    } else {
        topMarketRateEl.textContent = "--";
        topAttentionRateEl.textContent = "--";
    }

    refreshGapEl.textContent = formatGapText(gapSecond);
}

function createMetric(label, value) {
    return `
        <div class="metric">
            <span class="metric-label">${label}</span>
            <span class="metric-value">${safeText(value)}</span>
        </div>
    `;
}

function createProgrammeItem(programme, index) {
    const article = document.createElement("article");
    article.className = "programme-item";

    const topClass = index < 3 ? ` top-${index + 1}` : "";
    const name = safeText(programme?.programme_name || "未命名节目");
    const channel = safeText(programme?.channel_name || "--");

    const market = parseRate(programme?.market_rate);
    const attention = parseRate(programme?.attention_rate);
    const marketDesc = safeText(programme?.market_rate_desc || formatNumber(programme?.market_rate));
    const attentionDesc = safeText(programme?.attention_rate_desc || formatNumber(programme?.attention_rate));

    article.innerHTML = `
        <div class="rank-badge${topClass}">${index + 1}</div>
        <div class="programme-body">
            <div class="programme-head">
                <div class="programme-name">${name}</div>
                <div class="channel-name">${channel}</div>
            </div>
            <div class="metric-grid">
                ${createMetric("市场占有率", marketDesc)}
                ${createMetric("关注指数", attentionDesc)}
                ${createMetric("排序位置", `第 ${index + 1} 名`)}
                ${createMetric("排名趋势", programme?.rank_trend ? safeText(programme.rank_trend) : "--")}
            </div>
            <div class="progress-trend">
                <div class="progress-row market">
                    <div class="progress-label">
                        <span>市场份额</span>
                        <span>${market.text === "--" ? "--" : `${market.text}%`}</span>
                    </div>
                    <div class="progress-bar"><span style="width: ${market.ratio}%"></span></div>
                </div>
                <div class="progress-row attention">
                    <div class="progress-label">
                        <span>关注份额</span>
                        <span>${attention.text === "--" ? "--" : `${attention.text}%`}</span>
                    </div>
                    <div class="progress-bar"><span style="width: ${attention.ratio}%"></span></div>
                </div>
            </div>
        </div>
    `;

    return article;
}

function renderProgrammeList(list) {
    programmeListEl.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-message";
        empty.textContent = "暂时没有可展示的节目数据";
        programmeListEl.appendChild(empty);
        return;
    }

    list.slice(0, MAX_ITEMS).forEach((item, index) => {
        programmeListEl.appendChild(createProgrammeItem(item, index));
    });
}

async function requestJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
    }
    return response.json();
}

async function retrieveData() {
    for (const endpoint of API_ENDPOINTS) {
        try {
            const result = await requestJson(endpoint);
            if (result?.code === 200 && result?.data) {
                return result.data;
            }
        } catch (error) {
            console.warn("主接口请求失败", error);
        }
    }

    try {
        const fallbackResult = await requestJson(FALLBACK_ENDPOINT);
        if (fallbackResult?.data) {
            return fallbackResult.data;
        }
    } catch (fallbackError) {
        console.warn("本地示例数据读取失败", fallbackError);
    }

    return null;
}

async function loadData(isManual = false) {
    if (isLoading) {
        return;
    }

    isLoading = true;

    if (isManual) {
        refreshButton.disabled = true;
        refreshButton.textContent = "刷新中...";
    }

    if (!programmeListEl.children.length) {
        programmeListEl.innerHTML = '<div class="loading">正在载入电视收视排行...</div>';
    }

    try {
        const data = await retrieveData();
        if (!data) {
            throw new Error("无法获取数据");
        }

        renderProgrammeList(Array.isArray(data.list) ? data.list : []);
        renderInsights(data.list, data.update_gap_second);
        updateTimeEl.textContent = `最近更新 ${formatUpdateTime(data)}`;
    } catch (error) {
        console.error("加载数据失败", error);
        programmeListEl.innerHTML = '';
        const errorBox = document.createElement("div");
        errorBox.className = "error-message";
        errorBox.textContent = "数据获取暂时不可用，系统稍后会自动重试";
        programmeListEl.appendChild(errorBox);
        updateTimeEl.textContent = "最近更新 --";
        renderInsights([], 0);
    } finally {
        if (isManual) {
            refreshButton.disabled = false;
            refreshButton.textContent = "手动刷新";
        }
        isLoading = false;
    }
}

function startAutoRefresh() {
    if (autoTimer) {
        clearInterval(autoTimer);
    }
    autoTimer = setInterval(() => {
        loadData(false);
    }, REFRESH_INTERVAL);
}

refreshButton.addEventListener("click", () => {
    loadData(true);
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    } else {
        startAutoRefresh();
        loadData(false);
    }
});

function init() {
    loadData(false);
    startAutoRefresh();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
