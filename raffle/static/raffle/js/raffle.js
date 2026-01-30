document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const startNumInput = document.getElementById('startNum');
    const endNumInput = document.getElementById('endNum');
    const numberGrid = document.getElementById('numberGrid');
    const statusText = document.getElementById('status');

    let currentSteps = [];
    let currentStepIndex = 0;
    let isDrawing = false;

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
        
        await wait(1500);

        for (let i = 1; i < currentSteps.length; i++) {
            const nextPool = currentSteps[i].pool;
            const message = currentSteps[i].message;
            
            statusText.innerText = 'Choosing survivors...';
            
            // Randomly highlight some numbers for "shuffling" effect
            for (let shuffle = 0; shuffle < 5; shuffle++) {
                shuffleHighlight(nextPool);
                await wait(200);
            }

            // Final highlight of survivors
            highlightSurvivors(nextPool);
            await wait(800);

            statusText.innerText = 'Eliminating...';
            await eliminateOthers(nextPool);
            
            statusText.innerText = message;
            await wait(1000);
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

    function renderPool(pool) {
        numberGrid.innerHTML = '';
        pool.forEach(num => {
            const card = document.createElement('div');
            card.className = 'number-card';
            card.innerText = num;
            card.dataset.number = num;
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
