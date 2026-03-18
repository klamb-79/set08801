const board = document.getElementById('game-board');
const moveDisplay = document.getElementById('moves');
const resetButton = document.getElementById('reset-btn');
const nextLevelButton = document.querySelector('.next-level');




// Zen icons/emojis
//const icons = ['🌿', '🌸', '🌊', '🏔️', '🎋', '🧘', '☀️', '☁️'];
const superCars = [ 'car1.jpg', 'car2.jpg', 'car3.jpg', 'car4.jpg', 'car5.jpg', 'car6.jpg', 'car7.jpg', 'car8.jpg', 'car9.jpg', 'car10.jpg', 'car11.jpg', 'car12.jpg', 'car13.jpg', 'car14.jpg', 'car15.jpg' ];
let cards = [...superCars, ...superCars]; // Duplicate for pairs
let flippedCards = [];
let moves = 0;
let matchedCount = 0;

function initGame() {
   //const board = document.getElementById('game-board');
    board.innerHTML = '';
    moves = 0;
    matchedCount = 0;
    moveDisplay.innerText = moves;
    
    // Shuffle the array
    cards.sort(() => Math.random() - 0.5);

    cards.forEach((ImgSrc) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = ImgSrc;
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-front"><img src="./images/${ImgSrc}" alt="Super Car"></div>
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
        if (matchedCount === bzAnimals.length) {
            setTimeout(() => alert(`Zen achieved in ${moves} moves! level complete!. move to next level.`), 500);
            nextLevelButton.style.display = 'block';
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
nextLevelButton.addEventListener('click', () => {
    window.location.href = 'index2.html'; // Redirect to the next level page
    // Here you can implement logic to load the next level, such as changing the card set or increasing difficulty.
});
initGame();