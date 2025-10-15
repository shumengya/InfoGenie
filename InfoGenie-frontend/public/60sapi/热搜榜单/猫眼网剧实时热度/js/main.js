const API_ENDPOINTS = [
    "https://60s.api.shumengya.top/v2/maoyan/realtime/web"
];

const FALLBACK_ENDPOINT = "./返回接口.json";
const REFRESH_INTERVAL = 4500;
const MAX_ITEMS = 40;

const refreshButton = document.getElementById("refreshButton");
const updateTimeEl = document.getElementById("updateTime");
const seriesListEl = document.getElementById("seriesList");
const seriesCountEl = document.getElementById("seriesCount");
const topHeatEl = document.getElementById("topHeat");
const avgHeatEl = document.getElementById("avgHeat");
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

function formatGap(seconds) {
    const numeric = Number(seconds);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return "--";
    }

    if (numeric < 60) {
        return `约每 ${Math.round(numeric)} 秒`;
    }

    const minutes = Math.floor(numeric / 60);
    const remainder = Math.round(numeric % 60);
    if (remainder === 0) {
        return `约每 ${minutes} 分钟`;
    }
    return `约每 ${minutes} 分 ${remainder} 秒`;
}

function formatUpdateTime(data) {
    if (data && typeof data.updated === "string" && data.updated.trim()) {
        return data.updated.trim();
    }
    if (data && typeof data.updated_at === "number" && Number.isFinite(data.updated_at)) {
        return new Date(data.updated_at).toLocaleString("zh-CN", { hour12: false });
    }
    return new Date().toLocaleString("zh-CN", { hour12: false });
}

function renderStats(list, gapSeconds) {
    const total = Array.isArray(list) ? list.length : 0;
    seriesCountEl.textContent = total ? total.toString() : "--";

    if (total) {
        let maxHeat = 0;
        let sumHeat = 0;
        list.forEach(item => {
            const heat = Number(item?.curr_heat);
            if (Number.isFinite(heat)) {
                if (heat > maxHeat) {
                    maxHeat = heat;
                }
                sumHeat += heat;
            }
        });

        topHeatEl.textContent = maxHeat ? maxHeat.toFixed(2) : "--";
        const average = sumHeat && total ? (sumHeat / total) : 0;
        avgHeatEl.textContent = average ? average.toFixed(2) : "--";
    } else {
        topHeatEl.textContent = "--";
        avgHeatEl.textContent = "--";
    }

    refreshGapEl.textContent = formatGap(gapSeconds);
}

function createMetric(label, value) {
    return `
        <div class="metric">
            <span class="metric-label">${label}</span>
            <span class="metric-value">${safeText(value)}</span>
        </div>
    `;
}

function normalizeBarValue(list) {
    let maxValue = 0;
    if (Array.isArray(list)) {
        list.forEach(item => {
            const bar = Number(item?.bar_value ?? item?.curr_heat);
            if (Number.isFinite(bar) && bar > maxValue) {
                maxValue = bar;
            }
        });
    }
    return maxValue || 1;
}

function createSeriesItem(series, index, maxBar) {
    const article = document.createElement("article");
    article.className = "series-item";

    const rankClass = index < 3 ? ` top-${index + 1}` : "";
    const name = safeText(series?.series_name || "未命名剧集");
    const releaseInfo = safeText(series?.release_info || "--");
    const platform = safeText(series?.platform_desc || "--");
    const heatDesc = safeText(series?.curr_heat_desc || formatNumber(series?.curr_heat));

    const barValue = Number(series?.bar_value ?? series?.curr_heat);
    const ratio = Number.isFinite(barValue) && maxBar > 0 ? Math.min(100, Math.max(0, (barValue / maxBar) * 100)) : 0;

    article.innerHTML = `
        <div class="rank-pill${rankClass}">${index + 1}</div>
        <div class="series-body">
            <div class="series-head">
                <div class="series-name">${name}</div>
                <div class="series-meta">${releaseInfo} · ${platform}</div>
            </div>
            <div class="metric-grid">
                ${createMetric("实时热度", heatDesc)}
                ${createMetric("上线信息", releaseInfo)}
                ${createMetric("播出平台", platform)}
                ${createMetric("剧集ID", safeText(series?.series_id))}
            </div>
            <div class="progress-wrap">
                <div class="progress-row">
                    <div class="progress-label">
                        <span>热度走势</span>
                        <span>${heatDesc}</span>
                    </div>
                    <div class="progress-bar"><span style="width: ${ratio}%"></span></div>
                </div>
            </div>
        </div>
    `;

    return article;
}

function renderSeriesList(list) {
    seriesListEl.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-message";
        empty.textContent = "暂时没有可展示的剧集数据";
        seriesListEl.appendChild(empty);
        return;
    }

    const maxBar = normalizeBarValue(list);
    list.slice(0, MAX_ITEMS).forEach((series, index) => {
        seriesListEl.appendChild(createSeriesItem(series, index, maxBar));
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

    if (!seriesListEl.children.length) {
        seriesListEl.innerHTML = '<div class="loading">正在载入网剧热度...</div>';
    }

    try {
        const data = await retrieveData();
        if (!data) {
            throw new Error("无法获取数据");
        }

        const list = Array.isArray(data.list) ? data.list : [];
        renderSeriesList(list);
        renderStats(list, data.update_gap_second);
        updateTimeEl.textContent = `最近更新 ${formatUpdateTime(data)}`;
    } catch (error) {
        console.error("加载数据失败", error);
        seriesListEl.innerHTML = "";
        const errBox = document.createElement("div");
        errBox.className = "error-message";
        errBox.textContent = "数据获取暂时不可用，系统稍后会自动重试";
        seriesListEl.appendChild(errBox);
        updateTimeEl.textContent = "最近更新 --";
        renderStats([], 0);
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
