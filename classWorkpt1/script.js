const board = document.getElementById('game-board');
const moveDisplay = document.getElementById('moves');
const resetButton = document.getElementById('reset-btn');



// Zen icons/emojis
const icons = ['🌿', '🌸', '🌊', '🏔️', '🎋', '🧘', '☀️', '☁️'];
let cards = [...icons, ...icons]; // Duplicate for pairs
let flippedCards = [];
let moves = 0;
let matchedCount = 0;

function initGame() {
    board.innerHTML = '';
    moves = 0;
    matchedCount = 0;
    moveDisplay.innerText = moves;
    
    // Shuffle the array
    cards.sort(() => Math.random() - 0.5);

    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-front">${icon}</div>
        `;
        card.addEventListener('click', flipCard);
        board.appendChild(card);

    });
    
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            moves++;
            moveDisplay.innerText = moves;
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.icon === card2.dataset.icon) {
        matchedCount++;
        flippedCards = [];
        if (matchedCount === icons.length) {
            setTimeout(() => alert(`Zen achieved in ${moves} moves!`), 500);
        }
    } else {
        // If no match, wait 1 second then flip back
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function resetGame() {
    initGame();
}
resetButton.addEventListener('click', () => {
        
        initGame(); 
    });
initGame();