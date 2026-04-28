// ========== AUDIO SYSTEM ==========
let audioContext = null;
let soundEnabled = true;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playFlipSound() {
  if (!soundEnabled) return;
  initAudioContext();
  
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, now);
  oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.08);
  
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now);
  filter.Q.value = 1;
  
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

function playMatchSound() {
  if (!soundEnabled) return;
  initAudioContext();
  
  const now = audioContext.currentTime;
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(500, now);
  osc1.frequency.linearRampToValueAtTime(1000, now + 0.3);
  
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(750, now);
  osc2.frequency.linearRampToValueAtTime(1500, now + 0.3);
  
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.4);
  osc2.stop(now + 0.4);
}

function playWinSound() {
  if (!soundEnabled) return;
  initAudioContext();
  
  const now = audioContext.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50];
  
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.15;
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  });
}

// ========== DOM ELEMENTS ==========
const soundToggle = document.getElementById('soundToggle');
const gameBoard = document.getElementById('gameBoard');
const matchedCountSpan = document.getElementById('matchedCount');
const movesCountSpan = document.getElementById('movesCount');
const bestScoreSpan = document.getElementById('bestScore');
const bestScoreContainer = document.getElementById('bestScoreContainer');
const winMessageDiv = document.getElementById('winMessage');
const resetBtn = document.getElementById('resetButton');
const loadingScreen = document.getElementById('loadingScreen');
const gameWrapper = document.getElementById('gameWrapper');
const errorMessage = document.getElementById('errorMessage');

// ========== SOUND TOGGLE ==========
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    soundToggle.textContent = '🔊';
    soundToggle.classList.remove('muted');
    initAudioContext();
    setTimeout(() => playFlipSound(), 100);
  } else {
    soundToggle.textContent = '🔇';
    soundToggle.classList.add('muted');
  }
});

// ========== API CONFIGURATION ==========
const API_BASE_URL = 'https://dragonball-api.com/api/characters';
const FALLBACK_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="#FF8C00" stroke="#FFD700" stroke-width="3"/>
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="14" font-weight="bold">DB</text>
  </svg>
`);

// ========== GAME STATE ==========
let charactersData = [];
let cardsData = [];
let flippedCards = [];
let matchedPairsCount = 0;
let moveCount = 0;
let lockBoard = false;
let bestScore = localStorage.getItem('dbzMemoryBestScore') || null;

// ========== BEST SCORE FUNCTIONS ==========
function updateBestScoreDisplay() {
  if (bestScore) {
    bestScoreSpan.textContent = bestScore;
    bestScoreContainer.style.display = 'flex';
  } else {
    bestScoreContainer.style.display = 'none';
  }
}

function updateBestScore(newScore) {
  if (!bestScore || newScore < bestScore) {
    bestScore = newScore;
    localStorage.setItem('dbzMemoryBestScore', bestScore);
    bestScoreSpan.textContent = bestScore;
    bestScoreContainer.style.display = 'flex';
  }
}

// ========== CHARACTER DATA FUNCTIONS ==========
function getFallbackCharacters() {
  return [
    { id: "goku", name: "Goku", image: "https://dragonball-api.com/characters/1.jpg", icon: "☯️" },
    { id: "vegeta", name: "Vegeta", image: "https://dragonball-api.com/characters/2.jpg", icon: "👑" },
    { id: "gohan", name: "Gohan", image: "https://dragonball-api.com/characters/3.jpg", icon: "🔥" },
    { id: "piccolo", name: "Piccolo", image: "https://dragonball-api.com/characters/4.jpg", icon: "🧥" },
    { id: "frieza", name: "Frieza", image: "https://dragonball-api.com/characters/5.jpg", icon: "❄️" },
    { id: "cell", name: "Cell", image: "https://dragonball-api.com/characters/6.jpg", icon: "🟢" },
    { id: "buu", name: "Majin Buu", image: "https://dragonball-api.com/characters/7.jpg", icon: "🍬" },
    { id: "trunks", name: "Trunks", image: "https://dragonball-api.com/characters/8.jpg", icon: "🗡️" },
    { id: "krillin", name: "Krillin", image: "https://dragonball-api.com/characters/9.jpg", icon: "💪" },
    { id: "roshi", name: "Master Roshi", image: "https://dragonball-api.com/characters/10.jpg", icon: "🐢" },
    { id: "tien", name: "Tien Shinhan", image: "https://dragonball-api.com/characters/11.jpg", icon: "👁️" },
    { id: "yamcha", name: "Yamcha", image: "https://dragonball-api.com/characters/12.jpg", icon: "🐺" },
    { id: "chichi", name: "Chi-Chi", image: "https://dragonball-api.com/characters/13.jpg", icon: "👩" },
    { id: "bulma", name: "Bulma", image: "https://dragonball-api.com/characters/14.jpg", icon: "👩‍🔬" },
    { id: "videl", name: "Videl", image: "https://dragonball-api.com/characters/15.jpg", icon: "🥊" },
    { id: "goten", name: "Goten", image: "https://dragonball-api.com/characters/16.jpg", icon: "👦" },
    { id: "android17", name: "Android 17", image: "https://dragonball-api.com/characters/17.jpg", icon: "🤖" },
    { id: "android18", name: "Android 18", image: "https://dragonball-api.com/characters/18.jpg", icon: "👩‍🦳" },
    { id: "beerus", name: "Beerus", image: "https://dragonball-api.com/characters/19.jpg", icon: "🐱" },
    { id: "whis", name: "Whis", image: "https://dragonball-api.com/characters/20.jpg", icon: "👼" },
    { id: "jiren", name: "Jiren", image: "https://dragonball-api.com/characters/21.jpg", icon: "👽" },
    { id: "hit", name: "Hit", image: "https://dragonball-api.com/characters/22.jpg", icon: "⏱️" },
    { id: "zamasu", name: "Zamasu", image: "https://dragonball-api.com/characters/23.jpg", icon: "😈" },
    { id: "shenron", name: "Shenron", image: "https://dragonball-api.com/characters/24.jpg", icon: "🐉" }
  ];
}

function selectBestCharacters(characters) {
  const withImages = characters.filter(char => char.image);
  const pool = withImages.length >= 24 ? withImages : characters;
  
  const unique = [];
  const seenIds = new Set();
  
  for (const char of pool) {
    if (!seenIds.has(char.id) && unique.length < 24) {
      seenIds.add(char.id);
      unique.push({
        id: char.id.toString(),
        name: char.name,
        image: char.image || FALLBACK_IMAGE,
        icon: '🐉'
      });
    }
  }

  while (unique.length < 24) {
    const fallback = getFallbackCharacters();
    for (const fb of fallback) {
      if (unique.length >= 24) break;
      if (!unique.find(u => u.id === fb.id)) {
        unique.push(fb);
      }
    }
  }

  return unique.slice(0, 24);
}

async function fetchCharacters() {
  try {
    const allCharacters = [];
    
    for (let page = 1; page <= 5; page++) {
      const response = await fetch(`${API_BASE_URL}?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        allCharacters.push(...data.items);
      }
      
      if (allCharacters.length >= 24) {
        break;
      }
    }

    if (allCharacters.length < 24) {
      throw new Error('Not enough characters from API');
    }

    const selectedCharacters = selectBestCharacters(allCharacters.slice(0, 30));
    return selectedCharacters;

  } catch (error) {
    console.error('API fetch failed:', error);
    return getFallbackCharacters();
  }
}

// ========== GAME LOGIC ==========
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildDeck() {
  const deck = [];
  charactersData.forEach(char => {
    deck.push(char.id);
    deck.push(char.id);
  });
  return shuffleArray(deck);
}

function getCharacterById(id) {
  return charactersData.find(char => char.id === id);
}

function updateMoveDisplay() {
  movesCountSpan.textContent = moveCount;
}

function renderBoard() {
  gameBoard.innerHTML = '';
  cardsData.forEach((charId, index) => {
    const character = getCharacterById(charId);
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    card.dataset.characterId = charId;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${character.image}" 
               alt="${character.name}" 
               class="character-image"
               onerror="this.src='${FALLBACK_IMAGE}'"
               loading="lazy">
          <span class="character-name-tag">${character.name}</span>
        </div>
        <div class="card-back"></div>
      </div>
    `;

    card.addEventListener('click', () => handleCardClick(card));
    gameBoard.appendChild(card);
  });
}

function resetGame() {
  flippedCards = [];
  lockBoard = false;
  matchedPairsCount = 0;
  moveCount = 0;
  matchedCountSpan.textContent = '0';
  updateMoveDisplay();
  winMessageDiv.classList.remove('visible');
  cardsData = buildDeck();
  renderBoard();
  updateBestScoreDisplay();
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const id1 = card1.dataset.characterId;
  const id2 = card2.dataset.characterId;

  moveCount++;
  updateMoveDisplay();

  if (id1 === id2) {
    // Match found
    playMatchSound();
    
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    matchedPairsCount++;
    matchedCountSpan.textContent = matchedPairsCount;
    flippedCards = [];
    lockBoard = false;

    if (matchedPairsCount === charactersData.length) {
      setTimeout(() => {
        winMessageDiv.classList.add('visible');
        playWinSound();
      }, 300);
      updateBestScore(moveCount);
    }
  } else {
    // No match
    lockBoard = true;
    setTimeout(() => {
      if (!card1.classList.contains('matched')) {
        card1.classList.remove('flipped');
      }
      if (!card2.classList.contains('matched')) {
        card2.classList.remove('flipped');
      }
      flippedCards = [];
      lockBoard = false;
    }, 750);
  }
}

function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains('matched')) return;
  if (card.classList.contains('flipped')) return;
  if (flippedCards.includes(card)) return;

  playFlipSound();
  
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

// ========== INITIALIZATION ==========
async function initGame() {
  try {
    loadingScreen.style.display = 'flex';
    gameWrapper.classList.remove('ready');
    errorMessage.style.display = 'none';

    charactersData = await fetchCharacters();
    
    if (charactersData.length < 24) {
      throw new Error('Could not load enough characters');
    }

    cardsData = buildDeck();
    renderBoard();
    matchedPairsCount = 0;
    moveCount = 0;
    matchedCountSpan.textContent = '0';
    updateMoveDisplay();
    flippedCards = [];
    lockBoard = false;
    winMessageDiv.classList.remove('visible');
    updateBestScoreDisplay();

    loadingScreen.style.display = 'none';
    gameWrapper.classList.add('ready');

    document.addEventListener('click', initAudioContext, { once: true });

  } catch (error) {
    console.error('Game initialization error:', error);
    errorMessage.style.display = 'block';
    errorMessage.textContent = '⚠️ Using offline characters - API unavailable';
    
    charactersData = getFallbackCharacters();
    cardsData = buildDeck();
    renderBoard();
    matchedPairsCount = 0;
    moveCount = 0;
    updateMoveDisplay();
    updateBestScoreDisplay();
    
    loadingScreen.style.display = 'none';
    gameWrapper.classList.add('ready');
    
    document.addEventListener('click', initAudioContext, { once: true });
  }
}

// ========== EVENT LISTENERS ==========
resetBtn.addEventListener('click', resetGame);
window.addEventListener('resize', () => {});

// ========== START GAME ==========
initGame();