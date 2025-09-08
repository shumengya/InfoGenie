document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const body = document.body;
    const jokeTextElem = document.getElementById('joke-text');
    const newJokeBtn = document.getElementById('new-joke-btn');
    const loadingContainer = document.querySelector('.loading-container');
    const animationContainer = document.getElementById('animation-container');
    const jokeCard = document.getElementById('joke-card');

    // API
    const apiBaseUrls = ["https://60s.api.shumengya.top"];
    const apiPath = "/v2/duanzi";
    let currentApiIndex = 0;

    // --- Core Functions ---
    const showLoading = (isLoading) => {
        loadingContainer.classList.toggle('visible', isLoading);
        if (isLoading) jokeTextElem.classList.remove('visible');
    };

    const displayJoke = (joke) => {
        jokeTextElem.textContent = joke;
        showLoading(false);
        setTimeout(() => jokeTextElem.classList.add('visible'), 50);
    };

    const fetchJoke = async () => {
        showLoading(true);
        try {
            const url = apiBaseUrls[currentApiIndex] + apiPath;
            const response = await fetch(url, { timeout: 5000 });
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.code === 200 && data.data && data.data.duanzi) {
                displayJoke(data.data.duanzi);
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            console.error(`API error with ${apiBaseUrls[currentApiIndex]}:`, error);
            currentApiIndex = (currentApiIndex + 1) % apiBaseUrls.length;
            if (currentApiIndex !== 0) {
                fetchJoke(); // Try next API
            } else {
                displayJoke('段子菌迷路了！点击‘再来一个’让它重新找路～');
            }
        }
    };

    // --- Theme Switcher ---
    const themeSwitcher = document.querySelector('.theme-switcher');
    themeSwitcher.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-icon')) {
            const theme = e.target.dataset.theme;
            body.className = theme; // Set body class to the selected theme
            
            // Update active icon
            themeSwitcher.querySelectorAll('.theme-icon').forEach(icon => icon.classList.remove('active'));
            e.target.classList.add('active');
            
            alert(`主题已切换！部分主题（如表情包、复古电视）将在后续阶段实现。`);
        }
    });
    // Set initial active theme icon
    themeSwitcher.querySelector(`[data-theme="${body.className}"]`).classList.add('active');


    // --- Feedback Buttons & Animations ---
    const btnLol = document.getElementById('btn-lol');
    const btnCold = document.getElementById('btn-cold');
    const btnSeen = document.getElementById('btn-seen');
    const btnAbsurd = document.getElementById('btn-absurd');
    const soundLol = document.getElementById('sound-lol');
    const soundCold = document.getElementById('sound-cold');

    btnLol.addEventListener('click', () => {
        soundLol.play();
        createParticles(20, 'confetti');
    });

    btnCold.addEventListener('click', () => {
        soundCold.play();
        createParticles(15, 'snowflake');
    });

    btnSeen.addEventListener('click', () => {
        displayJoke("原来你也听过！那再给你换个新鲜的～");
        setTimeout(fetchJoke, 1500);
    });

    btnAbsurd.addEventListener('click', () => {
        jokeCard.classList.add('absurd');
        setTimeout(() => jokeCard.classList.remove('absurd'), 1000);
    });

    function createParticles(count, type) {
        animationContainer.innerHTML = ''; // Clear previous
        const colors = ['#ffca28', '#ff7043', '#29b6f6', '#66bb6a'];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add(type);
            if (type === 'confetti') {
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            } else {
                particle.textContent = '❄️';
            }
            particle.style.left = `${Math.random() * 100}vw`;
            const duration = Math.random() * 3 + 2; // 2-5 seconds
            const delay = Math.random() * -duration; // Start at different times
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            animationContainer.appendChild(particle);
        }
    }

    // --- Event Listeners ---
    newJokeBtn.addEventListener('click', fetchJoke);

    // --- Initial Load ---
    fetchJoke();
});