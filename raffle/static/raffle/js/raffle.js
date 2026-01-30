document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const startNumInput = document.getElementById('startNum');
    const endNumInput = document.getElementById('endNum');
    const numberGrid = document.getElementById('numberGrid');
    const statusText = document.getElementById('status');

    // QA Elements
    const qaSection = document.getElementById('qaSection');
    const controlsSection = document.getElementById('controls');
    const questionEl = document.getElementById('question');
    const answerEl = document.getElementById('answer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const qaProgress = document.getElementById('qaProgress');
    const completeQaBtn = document.getElementById('completeQaBtn');

    let currentSteps = [];
    let isDrawing = false;
    let qaData = [];
    let currentQaIndex = 0;

    // Initialize QA Session
    async function initQaSession() {
        try {
            const response = await fetch('/api/qa/');
            const data = await response.json();
            if (data.qa && data.qa.length > 0) {
                qaData = data.qa;
                qaSection.style.display = 'block';
                controlsSection.style.display = 'none';
                updateQaDisplay();
            } else {
                // If PDF empty or failed, just show raffle
                controlsSection.style.display = 'flex';
            }
        } catch (error) {
            console.error("QA Error:", error);
            controlsSection.style.display = 'flex';
        }
    }

    function updateQaDisplay() {
        const item = qaData[currentQaIndex];
        questionEl.innerText = item.question;
        answerEl.innerText = item.answer;
        qaProgress.innerText = `${currentQaIndex + 1} / ${qaData.length}`;

        prevBtn.disabled = currentQaIndex === 0;

        if (currentQaIndex === qaData.length - 1) {
            nextBtn.style.display = 'none';
            completeQaBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'inline-block';
            completeQaBtn.style.display = 'none';
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentQaIndex > 0) {
            currentQaIndex--;
            updateQaDisplay();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQaIndex < qaData.length - 1) {
            currentQaIndex++;
            updateQaDisplay();
        }
    });

    completeQaBtn.addEventListener('click', () => {
        qaSection.style.display = 'none';
        controlsSection.style.display = 'flex';
        const raffleArea = document.getElementById('raffleArea');
        if (raffleArea) raffleArea.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    initQaSession();

    startBtn.addEventListener('click', async () => {
        if (isDrawing) return;

        const start = parseInt(startNumInput.value);
        const end = parseInt(endNumInput.value);

        if (isNaN(start) || isNaN(end) || start >= end) {
            alert('Please enter a valid range.');
            return;
        }

        // Limit range for performance/visibility
        if (end - start > 500) {
            alert('Please choose a range smaller than 500 for the best experience.');
            return;
        }

        isDrawing = true;
        startBtn.disabled = true;
        numberGrid.innerHTML = '';
        statusText.innerText = 'Initializing draw...';

        try {
            const response = await fetch(`/api/generate/?start=${start}&end=${end}`);
            const data = await response.json();

            if (data.error) {
                alert(data.error);
                isDrawing = false;
                startBtn.disabled = false;
                return;
            }

            currentSteps = data.steps;
            runRaffle();
        } catch (error) {
            console.error('Error fetching raffle steps:', error);
            alert('Failed to start raffle. Check console.');
            isDrawing = false;
            startBtn.disabled = false;
        }
    });

    async function runRaffle() {
        // First step: Render all numbers
        const initialPool = currentSteps[0].pool;
        renderPool(initialPool);
        statusText.innerText = currentSteps[0].message;

        await wait(2000);

        for (let i = 1; i < currentSteps.length; i++) {
            const nextPool = currentSteps[i].pool;
            const message = currentSteps[i].message;

            // Rapid shuffle animation for 60 seconds
            const startTime = Date.now();
            const duration = 60000; // 1 minute

            while (Date.now() - startTime < duration) {
                shuffleHighlight(nextPool);
                await wait(150); // Fast shuffle speed
            }

            statusText.innerText = 'Calculating survivors...';

            // Final shuffle before transition
            for (let shuffle = 0; shuffle < 10; shuffle++) {
                shuffleHighlight(nextPool);
                await wait(150);
            }

            // Final highlight of survivors
            highlightSurvivors(nextPool);
            await wait(1500);

            statusText.innerText = 'Eliminating...';
            await eliminateOthers(nextPool);

            statusText.innerText = message;

            // Calculate a more gradual growth (e.g., 20% increase each step)
            // Starts at 50px, and grows based on steps and reduction in pool size
            const baseSize = 50;
            const growthFactor = 1.25; // 25% growth each step is more manageable
            const currentSize = Math.min(baseSize * Math.pow(growthFactor, i), 250);
            const fontSize = currentSize * 0.4;

            renderPool(nextPool, i === currentSteps.length - 1 ? 'winner' : '', currentSize, fontSize);
            await wait(3000);
        }

        // Show winner
        const winnerCard = numberGrid.querySelector('.number-card');
        if (winnerCard) {
            winnerCard.classList.add('winner');
            statusText.innerText = `🎉 WINNER IS ${winnerCard.innerText}! 🎉`;
            createConfetti();
        }

        isDrawing = false;
        startBtn.disabled = false;
    }

    function renderPool(pool, className = '', size = null, fontSize = null) {
        numberGrid.innerHTML = '';
        pool.forEach(num => {
            const card = document.createElement('div');
            card.className = `number-card ${className}`;
            card.innerText = num;
            card.dataset.number = num;

            if (size) {
                card.style.width = `${size}px`;
                card.style.height = `${size}px`;
            }
            if (fontSize) {
                card.style.fontSize = `${fontSize}px`;
            }

            numberGrid.appendChild(card);
        });
    }

    function shuffleHighlight(survivors) {
        const cards = document.querySelectorAll('.number-card');
        cards.forEach(card => {
            card.classList.remove('highlight');
            // Randomly flash some cards
            if (Math.random() > 0.7) {
                card.classList.add('highlight');
            }
        });
    }

    function highlightSurvivors(survivors) {
        const cards = document.querySelectorAll('.number-card');
        cards.forEach(card => {
            card.classList.remove('highlight');
            if (survivors.includes(parseInt(card.dataset.number))) {
                card.classList.add('highlight');
            }
        });
    }

    async function eliminateOthers(survivors) {
        const cards = document.querySelectorAll('.number-card');
        const promises = [];

        cards.forEach(card => {
            if (!survivors.includes(parseInt(card.dataset.number))) {
                card.classList.add('removing');
                // Remove from DOM after animation
                const p = new Promise(resolve => {
                    setTimeout(() => {
                        card.remove();
                        resolve();
                    }, 600);
                });
                promises.push(p);
            } else {
                card.classList.remove('highlight');
            }
        });

        await Promise.all(promises);
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function createConfetti() {
        const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    }
});

// Add dynamic confetti animation to style
const style = document.createElement('style');
style.innerHTML = `
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);
