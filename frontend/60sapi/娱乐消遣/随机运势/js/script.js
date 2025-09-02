document.addEventListener('DOMContentLoaded', () => {
    const getFortuneBtn = document.getElementById('get-fortune-btn');
    const fortuneCard = document.getElementById('fortune-card');
    const fortuneContent = fortuneCard.querySelector('.fortune-content');
    const luckDescElem = document.getElementById('luck-desc');
    const luckTipElem = document.getElementById('luck-tip');
    const fortuneSummaryElem = document.getElementById('fortune-summary');
    const luckyColorElem = document.getElementById('lucky-color');
    const luckyNumberElem = document.getElementById('lucky-number');
    const loadingSpinner = fortuneCard.querySelector('.loading-spinner');
    const tarotCardContainer = document.getElementById('tarot-card');
    const tarotNameElem = document.getElementById('tarot-name');
    const tarotInterpretationElem = document.getElementById('tarot-interpretation');

    const apiBaseUrls = [
        "https://60s.api.shumengya.top",
        "https://60s-cf.viki.moe",
        "https://60s.viki.moe",
        "https://60s.b23.run",
        "https://60s.114128.xyz",
        "https://60s-cf.114128.xyz"
    ];
    const apiPath = "/v2/luck";

    const mantras = [
        "顺其自然，皆是美好。",
        "相信直觉，它知道方向。",
        "每一次呼吸都是新的开始。",
        "心怀感恩，好运自来。",
        "拥抱变化，发现惊喜。",
        "你的能量，超乎想象。",
        "保持微笑，宇宙会回应你。"
    ];

    const tarotDeck = [
        { name: "愚者", interpretation: "新的开始，无限的潜力，天真和自由。勇敢地迈出第一步。" },
        { name: "魔术师", interpretation: "创造力，意志力，显化。你拥有实现目标所需的一切资源。" },
        { name: "女祭司", interpretation: "直觉，潜意识，神秘。倾听你内心的声音，智慧在你之内。" },
        { name: "皇后", interpretation: "丰饶，母性，创造。享受生活的美好，与自然和谐相处。" },
        { name: "皇帝", interpretation: "权威，结构，控制。建立秩序和纪律，掌控你的生活。" },
        { name: "教皇", interpretation: "传统，信仰，灵性指导。寻求智慧和知识，遵循传统。" },
        { name: "恋人", interpretation: "爱，和谐，选择。做出与你内心价值观一致的决定。" },
        { name: "战车", interpretation: "胜利，决心，控制。以坚定的意志力克服障碍，勇往直前。" },
        { name: "力量", interpretation: "勇气，内在力量，同情。用温柔和耐心驯服内心的野兽。" },
        { name: "隐士", interpretation: "内省，孤独，寻求真理。花时间独处，向内寻求答案。" },
        { name: "命运之轮", interpretation: "变化，命运，转折点。生活总在变化，顺应潮流。" },
        { name: "正义", interpretation: "公平，真理，因果。为你的行为负责，寻求平衡。" },
        { name: "倒吊人", interpretation: "新的视角，顺从，牺牲。放手，从不同的角度看问题。" },
        { name: "死神", interpretation: "结束，转变，新生。一个周期的结束是另一个周期的开始。" },
        { name: "节制", interpretation: "平衡，和谐，耐心。融合对立的力量，找到中间道路。" },
        { name: "恶魔", interpretation: "束缚，物质主义，诱惑。认识到你的束缚，并寻求解放。" },
        { name: "塔", interpretation: "突变，启示，解放。旧的结构正在崩塌，为新的结构让路。" },
        { name: "星星", interpretation: "希望，灵感，平静。在黑暗之后，总有希望的曙光。" },
        { name: "月亮", interpretation: "幻觉，恐惧，潜意识。面对你的恐惧，相信你的直觉。" },
        { name: "太阳", interpretation: "成功，喜悦，活力。拥抱光明，享受生活的乐趣。" },
        { name: "审判", interpretation: "觉醒，重生，评估。一个反思和更新的时刻。" },
        { name: "世界", interpretation: "完成，整合，成就。一个旅程的成功结束，庆祝你的成就。" }
    ];

    let currentApiIndex = 0;

    const showLoading = (isLoading) => {
        if (isLoading) {
            fortuneContent.classList.remove('visible');
            loadingSpinner.classList.add('visible');
        } else {
            loadingSpinner.classList.remove('visible');
            setTimeout(() => {
                fortuneContent.classList.add('visible');
            }, 100);
        }
    };

    const fetchFortune = async () => {
        showLoading(true);
        tarotCardContainer.classList.remove('flipped'); // Reset card on new fetch
        
        try {
            const url = apiBaseUrls[currentApiIndex] + apiPath;
            const response = await fetch(url, { timeout: 5000 });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.code === 200 && data.data) {
                updateFortune(data.data);
                drawTarotCard(); // Draw a tarot card on success
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            console.error(`API error with ${apiBaseUrls[currentApiIndex]}:`, error);
            currentApiIndex = (currentApiIndex + 1) % apiBaseUrls.length;
            if (currentApiIndex !== 0) {
                fetchFortune(); // Try next API
            } else {
                displayError();
            }
        }
    };

    const updateFortune = (data) => {
        luckDescElem.textContent = data.luck_desc || '运势';
        luckTipElem.textContent = data.luck_tip || '今日运势平平，保持好心情。';

        // Generate and display additional details
        fortuneSummaryElem.textContent = mantras[Math.floor(Math.random() * mantras.length)];
        luckyColorElem.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        luckyNumberElem.textContent = Math.floor(Math.random() * 100);

        showLoading(false);
    };

    const displayError = () => {
        luckDescElem.textContent = '占卜失败';
        luckTipElem.textContent = '无法连接到星辰之力，请稍后再试。';
        fortuneSummaryElem.textContent = '---';
        luckyColorElem.style.backgroundColor = 'transparent';
        luckyNumberElem.textContent = '-';
        showLoading(false);
        tarotNameElem.textContent = '指引中断';
        tarotInterpretationElem.textContent = '星辰之力暂时无法连接。';
        tarotCardContainer.classList.add('flipped'); // Show error on card
    };

    const drawTarotCard = () => {
        const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
        tarotNameElem.textContent = card.name;
        tarotInterpretationElem.textContent = card.interpretation;
        
        // Flip the card after a short delay to allow the main content to appear
        setTimeout(() => {
            tarotCardContainer.classList.add('flipped');
        }, 500);
    };

    const createSideDecorations = () => {
        const leftContainer = document.querySelector('.left-decor');
        const rightContainer = document.querySelector('.right-decor');
        if (!leftContainer || !rightContainer) return;

        const symbols = ['✧', '✦', '☾', '✶', '✵', '✩', '✨'];
        const symbolCount = 15; // Number of symbols per side

        const createSymbols = (container) => {
            for (let i = 0; i < symbolCount; i++) {
                const symbol = document.createElement('span');
                symbol.classList.add('decor-symbol');
                symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];

                // Randomize properties for a more natural look
                symbol.style.top = `${Math.random() * 90}vh`;
                symbol.style.left = `${Math.random() * 80}%`;
                symbol.style.fontSize = `${Math.random() * 20 + 10}px`;
                symbol.style.animationDelay = `${Math.random() * 20}s`;
                symbol.style.animationDuration = `${Math.random() * 20 + 15}s`; // Duration between 15s and 35s

                container.appendChild(symbol);
            }
        };

        createSymbols(leftContainer);
        createSymbols(rightContainer);
    };

    getFortuneBtn.addEventListener('click', fetchFortune);
    tarotCardContainer.addEventListener('click', () => {
        tarotCardContainer.classList.toggle('flipped');
    });

    // Initial actions on page load
    fetchFortune();
    createSideDecorations();
});