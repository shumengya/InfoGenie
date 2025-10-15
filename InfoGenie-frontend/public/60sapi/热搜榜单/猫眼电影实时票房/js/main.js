const API_ENDPOINTS = [
    "https://60s.api.shumengya.top/v2/maoyan/realtime/movie"
];

const FALLBACK_ENDPOINT = "./返回接口.json";
const REFRESH_INTERVAL = 5000;
const MAX_MOVIES_TO_RENDER = 40;

const updateTimeEl = document.getElementById("updateTime");
const refreshButton = document.getElementById("refreshButton");
const summaryTitleEl = document.getElementById("summaryTitle");
const totalBoxOfficeEl = document.getElementById("totalBoxOffice");
const totalBoxOfficeUnitEl = document.getElementById("totalBoxOfficeUnit");
const combinedBoxOfficeEl = document.getElementById("combinedBoxOffice");
const combinedBoxOfficeUnitEl = document.getElementById("combinedBoxOfficeUnit");
const showCountEl = document.getElementById("showCount");
const viewCountEl = document.getElementById("viewCount");
const movieListEl = document.getElementById("movieList");

let autoRefreshTimer = null;
let isLoading = false;

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

function safeText(value) {
    if (value === undefined || value === null || value === "") {
        return "--";
    }
    return escapeHtml(value);
}

function parseRate(rateText) {
    if (!rateText || typeof rateText !== "string") {
        return { text: "--", ratio: 0 };
    }

    const trimmed = rateText.trim();
    const numeric = parseFloat(trimmed.replace(/[^0-9.]/g, ""));
    let ratio = Number.isFinite(numeric) ? Math.max(0, Math.min(numeric, 100)) : 0;

    if (trimmed.startsWith("<")) {
        ratio = Math.max(3, ratio);
    }

    return { text: escapeHtml(trimmed), ratio };
}

function formatUpdateTime(data) {
    if (data && typeof data.updated === "string" && data.updated.trim().length > 0) {
        return data.updated.trim();
    }

    if (data && typeof data.updated_at === "number" && !Number.isNaN(data.updated_at)) {
        return new Date(data.updated_at).toLocaleString("zh-CN", {
            hour12: false
        });
    }

    return new Date().toLocaleString("zh-CN", { hour12: false });
}

function renderSummary(data) {
    summaryTitleEl.textContent = data?.title ? data.title : "实时大盘";
    totalBoxOfficeEl.textContent = data?.split_box_office ? data.split_box_office : "--";
    totalBoxOfficeUnitEl.textContent = data?.split_box_office_unit ? data.split_box_office_unit : "";
    combinedBoxOfficeEl.textContent = data?.box_office ? data.box_office : "--";
    combinedBoxOfficeUnitEl.textContent = data?.box_office_unit ? data.box_office_unit : "";
    showCountEl.textContent = data?.show_count_desc ? data.show_count_desc : "--";
    viewCountEl.textContent = data?.view_count_desc ? data.view_count_desc : "--";
}

function createStat(label, value) {
    return `
        <div class="stat">
            <span class="stat-label">${label}</span>
            <span class="stat-value">${safeText(value)}</span>
        </div>
    `;
}

function createMovieItem(movie, index) {
    const item = document.createElement("article");
    item.className = "movie-item";

    const topClass = index < 3 ? ` top-${index + 1}` : "";
    const name = safeText(movie?.movie_name || "未命名影片");
    const releaseInfo = movie?.release_info ? `<div class="release-info">${safeText(movie.release_info)}</div>` : "";

    const boxOfficeDesc = movie?.box_office_desc || (movie?.box_office ? `${movie.box_office}${movie.box_office_unit || ""}` : "--");
    const splitBoxOfficeDesc = movie?.split_box_office_desc || (movie?.split_box_office ? `${movie.split_box_office}${movie.split_box_office_unit || ""}` : "--");
    const totalBoxOfficeDesc = movie?.sum_box_desc ?? "--";
    const totalSplitBoxOfficeDesc = movie?.sum_split_box_desc ?? "--";

    let showCountText = "--";
    if (movie?.show_count !== undefined && movie.show_count !== null && movie.show_count !== "") {
        const numericShowCount = Number(movie.show_count);
        showCountText = Number.isFinite(numericShowCount)
            ? `${numericShowCount.toLocaleString("zh-CN")} 场`
            : movie.show_count;
    }

    const avgShowView = movie?.avg_show_view ?? "--";
    const avgSeatView = movie?.avg_seat_view ?? "--";

    const boxRate = parseRate(movie?.box_office_rate);
    const showRate = parseRate(movie?.show_count_rate);

    item.innerHTML = `
        <div class="movie-rank${topClass}">${index + 1}</div>
        <div class="movie-body">
            <div class="movie-heading">
                <div>
                    <div class="movie-title">${name}</div>
                    ${releaseInfo}
                </div>
            </div>
            <div class="movie-stats">
                ${createStat("单日综合票房", boxOfficeDesc)}
                ${createStat("单日分账票房", splitBoxOfficeDesc)}
                ${createStat("累计综合票房", totalBoxOfficeDesc)}
                ${createStat("累计分账票房", totalSplitBoxOfficeDesc)}
                ${createStat("排片场次", showCountText)}
                ${createStat("场均人次", avgShowView)}
                ${createStat("上座率", avgSeatView)}
            </div>
            <div class="progress-metrics">
                <div class="progress-group">
                    <div class="progress-label">
                        <span>综合票房占比</span>
                        <span>${boxRate.text}</span>
                    </div>
                    <div class="progress-bar"><span></span></div>
                </div>
                <div class="progress-group">
                    <div class="progress-label">
                        <span>排片占比</span>
                        <span>${showRate.text}</span>
                    </div>
                    <div class="progress-bar"><span></span></div>
                </div>
            </div>
        </div>
    `;

    const progressBars = item.querySelectorAll(".progress-bar span");
    if (progressBars[0]) {
        progressBars[0].style.width = `${boxRate.ratio}%`;
    }
    if (progressBars[1]) {
        progressBars[1].style.width = `${showRate.ratio}%`;
    }

    return item;
}

function renderMovieList(list) {
    movieListEl.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "error-message";
        empty.textContent = "暂时没有可展示的实时票房数据";
        movieListEl.appendChild(empty);
        return;
    }

    const sliced = list.slice(0, MAX_MOVIES_TO_RENDER);
    sliced.forEach((movie, index) => {
        movieListEl.appendChild(createMovieItem(movie, index));
    });
}

async function requestJson(url) {
    const response = await fetch(url, {
        cache: "no-store"
    });

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
    } catch (error) {
        console.warn("本地示例数据读取失败", error);
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

    if (!movieListEl.children.length) {
        movieListEl.innerHTML = '<div class="loading">正在加载实时票房...</div>';
    }

    try {
        const data = await retrieveData();
        if (!data) {
            throw new Error("无法获取数据");
        }

        renderSummary(data);
        renderMovieList(Array.isArray(data.list) ? data.list : []);
        updateTimeEl.textContent = `最近更新 ${formatUpdateTime(data)}`;
    } catch (error) {
        console.error("加载数据失败", error);
        movieListEl.innerHTML = "";
        const err = document.createElement("div");
        err.className = "error-message";
        err.textContent = "数据获取暂时遇到问题，系统会稍后自动重试";
        movieListEl.appendChild(err);
        updateTimeEl.textContent = "最近更新 --";
        renderSummary(null);
    } finally {
        if (isManual) {
            refreshButton.disabled = false;
            refreshButton.textContent = "手动刷新";
        }
        isLoading = false;
    }
}

function startAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
    autoRefreshTimer = setInterval(() => {
        loadData(false);
    }, REFRESH_INTERVAL);
}

refreshButton.addEventListener("click", () => {
    loadData(true);
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
            autoRefreshTimer = null;
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
