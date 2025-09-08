document.addEventListener('DOMContentLoaded', () => {
    const jokeTextElem = document.getElementById('joke-text');
    const newJokeBtn = document.getElementById('new-joke-btn');
    const snowflakeContainer = document.getElementById('snowflake-container');
    const frostOverlay = document.getElementById('frost-overlay');
    const windSound = document.getElementById('wind-sound');
    const snowSound = document.getElementById('snow-sound');
    const loader = document.getElementById('loader');
    const themeBtns = document.querySelectorAll('.theme-btn');

    const apiEndpoints = [
        'https://60s.api.shumengya.top/v2/dad-joke',
    ];
    let currentApiIndex = 0;

    async function fetchJoke() {
        jokeTextElem.classList.add('hidden');
        loader.classList.remove('hidden');
        
        try {
            const response = await fetch(apiEndpoints[currentApiIndex]);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.code === 200 && data.data.content) {
                updateJokeText(data.data.content);
                if (document.body.dataset.theme === 'winter' && Math.random() < 0.3) {
                    triggerFrostEffect();
                }
            } else {
                throw new Error('API returned invalid data');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            currentApiIndex = (currentApiIndex + 1) % apiEndpoints.length;
            if (currentApiIndex !== 0) {
                fetchJoke();
            } else {
                jokeTextElem.textContent = '冰箱坏了，暂时没有冷笑话...';
            }
        } finally {
            loader.classList.add('hidden');
            jokeTextElem.classList.remove('hidden');
        }
    }

    function updateJokeText(text) {
        jokeTextElem.textContent = '';
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                jokeTextElem.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 50);
    }

    function createSnowflakes() {
        const snowflakeCount = document.body.dataset.theme === 'dark' ? 50 : 30;
        snowflakeContainer.innerHTML = '';
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = '❄️';
            
            snowflake.style.left = `${Math.random() * 100}vw`;
            snowflake.style.fontSize = `${Math.random() * 15 + 10}px`;
            snowflake.style.opacity = Math.random() * 0.5 + 0.3;
            
            const duration = Math.random() * 10 + 8;
            const delay = Math.random() * 10;
            
            snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
            
            snowflakeContainer.appendChild(snowflake);
        }
    }

    function triggerFrostEffect() {
        frostOverlay.classList.add('is-frosted');
        windSound.play().catch(e => console.error("Audio play failed:", e));
        setTimeout(() => {
            frostOverlay.classList.remove('is-frosted');
        }, 2000);
    }

    function setTheme(theme) {
        document.body.dataset.theme = theme;
        localStorage.setItem('joke-theme', theme);
        
        themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeTarget === theme);
        });

        if (theme === 'winter') {
            snowSound.play().catch(e => console.error("Audio play failed:", e));
        }
        
        // Recreate snowflakes for theme-specific density
        createSnowflakes();
    }

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.themeTarget);
        });
    });

    newJokeBtn.addEventListener('click', fetchJoke);

    // Initial setup
    const savedTheme = localStorage.getItem('joke-theme') || 'light';
    setTheme(savedTheme);
    fetchJoke();
});