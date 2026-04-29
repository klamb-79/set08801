function createParticles() {
      const container = document.getElementById('particles');
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        container.appendChild(particle);
      }
    }

    // Display best score if exists
    function displayBestScore() {
      const bestScore = localStorage.getItem('dbzMemoryBestScore');
      const bestScoreDisplay = document.getElementById('homeBestScore');
      
      if (bestScore) {
        bestScoreDisplay.innerHTML = `
          <div class="best-score-badge">
            <span>🏆 Best Score: ${bestScore} moves</span>
          </div>
        `;
        bestScoreDisplay.style.display = 'block';
      }
    }

    // Navigate to game
    function startGame() {
      // Add transition effect
      document.querySelector('.home-container').style.opacity = '0';
      document.querySelector('.home-container').style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        window.location.href = 'game.html';
      }, 500);
    }

    // Initialize home page
    window.addEventListener('load', () => {
      createParticles();
      displayBestScore();
      
      // Add entrance animation
      setTimeout(() => {
        document.querySelector('.home-container').style.opacity = '1';
        document.querySelector('.home-container').style.transform = 'scale(1)';
      }, 100);
    });