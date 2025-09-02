document.addEventListener('DOMContentLoaded', () => {
    const literatureTextElem = document.getElementById('literature-text');
    const newLiteratureBtn = document.getElementById('new-literature-btn');
    const animationToggle = document.getElementById('animation-toggle');
    const bgContainer = document.getElementById('bg-container');
    const body = document.body;

    const apiEndpoints = [
        'https://60s.api.shumengya.top/v2/fabing',
        // Add fallback APIs here if available
    ];

    let currentApiIndex = 0;

    async function fetchLiterature() {
        literatureTextElem.textContent = '正在卖力发疯中...';
        literatureTextElem.style.opacity = '0.5';

        try {
            const response = await fetch(apiEndpoints[currentApiIndex]);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.code === 200) {
                literatureTextElem.textContent = data.data.saying;
            } else {
                throw new Error('API returned an error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            currentApiIndex = (currentApiIndex + 1) % apiEndpoints.length;
            if (currentApiIndex !== 0) {
                fetchLiterature(); // Retry with the next API
            } else {
                literatureTextElem.textContent = '疯不起来了，请稍后再试。';
            }
        } finally {
            literatureTextElem.style.opacity = '1';
        }
    }

    function createFloatingEmojis() {
        const existingEmojis = bgContainer.querySelectorAll('.floating-emoji');
        existingEmojis.forEach(e => e.remove());

        const emojis = ['🤯', '😵', '🤪', '🥴', '🤡', '👹', '👻', '💀', '💥', '🔥', '🌪️', '😵‍💫'];
        const animationNames = ['float-top-to-bottom', 'float-bottom-to-top', 'float-left-to-right', 'float-right-to-left'];
        const emojiCount = 25;

        for (let i = 0; i < emojiCount; i++) {
            const emojiEl = document.createElement('div');
            emojiEl.className = 'floating-emoji';
            emojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const animationName = animationNames[Math.floor(Math.random() * animationNames.length)];
            emojiEl.style.animationName = animationName;
            emojiEl.style.animationDuration = `${Math.random() * 10 + 15}s`; // 15-25 seconds
            emojiEl.style.animationDelay = `${Math.random() * 20}s`;
            emojiEl.style.fontSize = `${Math.random() * 20 + 20}px`;

            // Set initial position based on animation direction
            if (animationName.includes('top') || animationName.includes('bottom')) { // Vertical movement
                emojiEl.style.left = `${Math.random() * 100}vw`;
            } else { // Horizontal movement
                emojiEl.style.top = `${Math.random() * 100}vh`;
            }

            bgContainer.appendChild(emojiEl);
        }
    }

    function createFragments() {
        const existingFragments = bgContainer.querySelectorAll('.text-fragment');
        existingFragments.forEach(f => f.remove());

        const fragments = ['我', '疯', '了', '？', '！', '…', '救命', '为什么', '好烦', '啊啊啊'];
        for (let i = 0; i < 20; i++) {
            const frag = document.createElement('div');
            frag.className = 'text-fragment';
            frag.textContent = fragments[Math.floor(Math.random() * fragments.length)];
            frag.style.top = `${Math.random() * 100}%`;
            frag.style.left = `${Math.random() * 100}%`;
            frag.style.animationDelay = `${Math.random() * 15}s`;
            frag.style.fontSize = `${Math.random() * 12 + 12}px`;
            bgContainer.appendChild(frag);
        }
    }
    
    function createCracks() {
        for (let i = 0; i < 2; i++) {
            const crack = document.createElement('div');
            crack.className = 'screen-crack';
            crack.style.top = `${Math.random() * 80}%`;
            crack.style.left = `${Math.random() * 80}%`;
            crack.style.transform = `rotate(${Math.random() * 360}deg)`;
            crack.style.animationDelay = `${Math.random() * 25}s`;
            bgContainer.appendChild(crack);
        }
    }

    function createFlickerBlocks() {
        const glitchOverlay = document.getElementById('glitch-overlay');
        for (let i = 0; i < 3; i++) {
            const block = document.createElement('div');
            block.className = 'flicker-block';
            block.style.width = `${Math.random() * 100 + 50}px`;
            block.style.height = `${Math.random() * 100 + 50}px`;
            block.style.top = `${Math.random() * 90}%`;
            block.style.left = `${Math.random() * 90}%`;
            block.style.animationDuration = `${Math.random() * 2 + 2}s`;
            block.style.animationDelay = `${Math.random() * 3}s`;
            glitchOverlay.appendChild(block);
        }
    }

    function toggleAnimations() {
        if (animationToggle.checked) {
            body.classList.add('body-animated');
        } else {
            body.classList.remove('body-animated');
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (!animationToggle.checked) return;
        const x = (window.innerWidth / 2) - e.pageX;
        const y = (window.innerHeight / 2) - e.pageY;
        bgContainer.style.transform = `translateX(${x / 50}px) translateY(${y / 50}px)`;
    });

    newLiteratureBtn.addEventListener('click', fetchLiterature);
    animationToggle.addEventListener('change', toggleAnimations);

    // Initial setup
    createFloatingEmojis();
    createFragments();
    createCracks();
    createFlickerBlocks();
    toggleAnimations();
    fetchLiterature();

    window.addEventListener('resize', () => {
        createFloatingEmojis();
        createFragments();
    });
});