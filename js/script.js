class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.newGameBtn = document.getElementById('new-game');
        this.resumeGameBtn = document.getElementById('resume-game');
        this.attemptsDisplay = document.getElementById('attempts');
        this.timerDisplay = document.getElementById('timer');
        this.pairsFoundDisplay = document.getElementById('pairs-found');
        this.bestTimeDisplay = document.getElementById('best-time');
        this.bestAttemptsDisplay = document.getElementById('best-attempts');
        this.gameMessage = document.getElementById('game-message');
        
        this.gameState = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            attempts: 0,
            startTime: null,
            gameTime: 0,
            isGameActive: false,
            level: 4
        };
        
        this.animals = [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
            '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
            '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂',
            '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀',
            '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆'
        ];
        
        this.timerInterval = null;
        this.db = null;
        this.init();
    }
    
    async init() {
        await this.initDB();
        this.loadRecords();
        this.setupEventListeners();
        this.checkForSavedGame();
        this.initializeDifficulty();
    }
    
    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.resumeGameBtn.addEventListener('click', () => this.resumeGame());
        
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => this.selectDifficulty(button));
        });
    }
    
    selectDifficulty(button) {
        if (this.gameState.isGameActive) {
            this.showMessage('Termina la partida actual antes de cambiar de dificultad', 'error');
            return;
        }
        
        
        this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
        
        
        button.classList.add('active');
        
        
        this.gameState.level = parseInt(button.dataset.level);
        
        this.showMessage(`Dificultad seleccionada: ${button.textContent}`, 'success');
    }
    
    initializeDifficulty() {
        
        const defaultButton = document.querySelector('[data-level="4"]');
        if (defaultButton) {
            defaultButton.classList.add('active');
        }
    }
    
    
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MemoryGameDB', 1);
            
            request.onerror = () => {
                console.error('Error abriendo IndexedDB:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB inicializada correctamente');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                
                if (!db.objectStoreNames.contains('games')) {
                    const gameStore = db.createObjectStore('games', { keyPath: 'id' });
                    gameStore.createIndex('isActive', 'isGameActive', { unique: false });
                }
                
                
                if (!db.objectStoreNames.contains('records')) {
                    const recordStore = db.createObjectStore('records', { keyPath: 'key' });
                }
            };
        });
    }
    
    startNewGame() {
        
        if (!this.gameState.level) {
            this.showMessage('Por favor selecciona una dificultad primero', 'error');
            return;
        }
        
        this.gameState = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            attempts: 0,
            startTime: null,
            gameTime: 0,
            isGameActive: true,
            level: this.gameState.level
        };
        
        this.generateCards();
        this.renderBoard();
        this.startTimer();
        this.updateDisplay();
        this.hideMessage();
        this.resumeGameBtn.disabled = true;
        this.difficultyButtons.forEach(btn => btn.disabled = true);
        this.newGameBtn.textContent = 'Reiniciar';
        
        this.showMessage('¡Nueva partida iniciada! Encuentra todos los pares.', 'success');
    }
    
    async resumeGame() {
        const savedGame = await this.loadGame();
        if (!savedGame) {
            this.showMessage('No hay partida guardada', 'error');
            return;
        }
        
        this.gameState = savedGame;
        
        
        this.gameState.cards.forEach(card => {
            if (!card.isMatched) {
                card.isFlipped = false;
            }
        });
        
        
        this.gameState.flippedCards = [];
        
        this.renderBoard();
        this.resumeTimer(); 
        this.updateDisplay();
        this.hideMessage();
        this.resumeGameBtn.disabled = true;
        this.difficultyButtons.forEach(btn => btn.disabled = true);
        this.newGameBtn.textContent = 'Reiniciar';
        
        this.showMessage('Partida retomada. Continúa donde la dejaste.', 'success');
    }
    
    generateCards() {
        const totalCards = this.gameState.level * this.gameState.level;
        const pairsNeeded = totalCards / 2;
        
        
        const cardAnimals = [];
        for (let i = 0; i < pairsNeeded; i++) {
            const animal = this.animals[i % this.animals.length];
            cardAnimals.push(animal, animal); 
        }
        
        
        this.gameState.cards = this.shuffleArray(cardAnimals).map((animal, index) => ({
            id: index,
            animal: animal,
            isFlipped: false,
            isMatched: false
        }));
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.gameState.level}, 1fr)`;
        
        
        this.gameBoard.className = 'game-board';
        if (this.gameState.level === 4) {
            this.gameBoard.classList.add('level-4');
        } else if (this.gameState.level === 6) {
            this.gameBoard.classList.add('level-6');
        } else if (this.gameState.level === 10) {
            this.gameBoard.classList.add('level-10');
        }
        
        this.gameState.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            
            if (card.isFlipped) {
                cardElement.classList.add('flipped');
                cardElement.innerHTML = `<span>${card.animal}</span>`;
            } else {
                cardElement.innerHTML = '<span>?</span>';
            }
            
            if (card.isMatched) {
                cardElement.classList.add('matched');
            }
            
            cardElement.addEventListener('click', () => this.handleCardClick(card.id));
            this.gameBoard.appendChild(cardElement);
        });
    }
    
    async handleCardClick(cardId) {
        if (!this.gameState.isGameActive) return;
        
        const card = this.gameState.cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return;
        
        
        if (this.gameState.flippedCards.length >= 2) return;
        
        this.flipCard(cardId);
        this.gameState.flippedCards.push(cardId);
        
        if (this.gameState.flippedCards.length === 2) {
            this.gameState.attempts++;
            this.updateDisplay();
            await this.saveGame();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }
    
    flipCard(cardId) {
        const card = this.gameState.cards.find(c => c.id === cardId);
        if (!card) return;
        
        card.isFlipped = true;
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        cardElement.classList.add('flipped', 'flipping');
        cardElement.innerHTML = `<span>${card.animal}</span>`;
        
        setTimeout(() => {
            cardElement.classList.remove('flipping');
        }, 600);
    }
    
    async checkForMatch() {
        const [card1Id, card2Id] = this.gameState.flippedCards;
        const card1 = this.gameState.cards.find(c => c.id === card1Id);
        const card2 = this.gameState.cards.find(c => c.id === card2Id);
        
        if (card1.animal === card2.animal) {
            
            card1.isMatched = true;
            card2.isMatched = true;
            this.gameState.matchedPairs++;
            
            const card1Element = document.querySelector(`[data-card-id="${card1Id}"]`);
            const card2Element = document.querySelector(`[data-card-id="${card2Id}"]`);
            
            card1Element.classList.add('matched', 'matching');
            card2Element.classList.add('matched', 'matching');
            
            setTimeout(() => {
                card1Element.classList.remove('matching');
                card2Element.classList.remove('matching');
            }, 600);
            
            this.updateDisplay();
            
            
            if (this.gameState.matchedPairs === this.gameState.cards.length / 2) {
                this.endGame();
            }
        } else {
            
            setTimeout(() => {
                this.flipCardBack(card1Id);
                this.flipCardBack(card2Id);
            }, 1000);
        }
        
        this.gameState.flippedCards = [];
        await this.saveGame();
    }
    
    flipCardBack(cardId) {
        const card = this.gameState.cards.find(c => c.id === cardId);
        if (!card) return;
        
        card.isFlipped = false;
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        cardElement.classList.remove('flipped', 'flipping');
        cardElement.innerHTML = '<span>?</span>';
        
        setTimeout(() => {
            cardElement.classList.remove('flipping');
        }, 600);
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.gameState.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.gameState.gameTime = Math.floor((Date.now() - this.gameState.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }
    
    resumeTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        
        this.gameState.startTime = Date.now() - (this.gameState.gameTime * 1000);
        this.timerInterval = setInterval(() => {
            this.gameState.gameTime = Math.floor((Date.now() - this.gameState.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.gameState.gameTime / 60);
        const seconds = this.gameState.gameTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    async endGame() {
        this.gameState.isGameActive = false;
        clearInterval(this.timerInterval);
        
        const totalPairs = this.gameState.cards.length / 2;
        const timeFormatted = this.timerDisplay.textContent;
        
        this.showMessage(
            `¡Felicidades! Completaste el juego en ${timeFormatted} con ${this.gameState.attempts} intentos.`,
            'success'
        );
        
        await this.updateRecords();
        await this.resetGameControls();
    }
    
    async updateRecords() {
        const currentTime = this.gameState.gameTime;
        const currentAttempts = this.gameState.attempts;
        
        let bestTime = await this.getRecord('bestTime');
        let bestAttempts = await this.getRecord('bestAttempts');
        
        let newRecord = false;
        
        if (!bestTime || currentTime < bestTime) {
            bestTime = currentTime;
            await this.setRecord('bestTime', bestTime);
            newRecord = true;
        }
        
        if (!bestAttempts || currentAttempts < bestAttempts) {
            bestAttempts = currentAttempts;
            await this.setRecord('bestAttempts', bestAttempts);
            newRecord = true;
        }
        
        if (newRecord) {
            setTimeout(() => {
                this.showMessage('¡Nuevo récord! 🏆', 'success');
            }, 2000);
        }
        
        await this.loadRecords();
    }
    
    updateDisplay() {
        this.attemptsDisplay.textContent = this.gameState.attempts;
        this.pairsFoundDisplay.textContent = `${this.gameState.matchedPairs}/${this.gameState.cards.length / 2}`;
    }
    
    async resetGameControls() {
        this.newGameBtn.textContent = 'Nueva Partida';
        this.resumeGameBtn.disabled = true;
        this.difficultyButtons.forEach(btn => btn.disabled = false);
        await this.clearSavedGame();
    }
    
    showMessage(message, type = '') {
        this.gameMessage.textContent = message;
        this.gameMessage.className = `game-message ${type}`;
    }
    
    hideMessage() {
        this.gameMessage.textContent = '';
        this.gameMessage.className = 'game-message';
    }
    
    
    async saveGame() {
        if (this.gameState.isGameActive && this.db) {
            try {
                const transaction = this.db.transaction(['games'], 'readwrite');
                const store = transaction.objectStore('games');
                
                const gameData = {
                    id: 'current_game',
                    ...this.gameState,
                    timestamp: Date.now()
                };
                
                await store.put(gameData);
                console.log('Partida guardada en IndexedDB');
            } catch (error) {
                console.error('Error guardando partida:', error);
            }
        }
    }
    
    loadGame() {
        if (!this.db) return Promise.resolve(null);
        
        try {
            const transaction = this.db.transaction(['games'], 'readonly');
            const store = transaction.objectStore('games');
            const request = store.get('current_game');
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    if (request.result) {
                        const { id, timestamp, ...gameState } = request.result;
                        resolve(gameState);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => {
                    console.error('Error cargando partida:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error en loadGame:', error);
            return Promise.resolve(null);
        }
    }
    
    async clearSavedGame() {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['games'], 'readwrite');
            const store = transaction.objectStore('games');
            await store.delete('current_game');
            console.log('Partida guardada eliminada de IndexedDB');
        } catch (error) {
            console.error('Error eliminando partida guardada:', error);
        }
    }
    
    async checkForSavedGame() {
        const savedGame = await this.loadGame();
        if (savedGame && savedGame.isGameActive) {
            this.resumeGameBtn.disabled = false;
            this.showMessage('Hay una partida guardada. Puedes retomarla.', 'success');
        }
    }
    
    
    async setRecord(key, value) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['records'], 'readwrite');
            const store = transaction.objectStore('records');
            
            const recordData = {
                key: key,
                value: value,
                timestamp: Date.now()
            };
            
            await store.put(recordData);
            console.log(`Record ${key} guardado en IndexedDB:`, value);
        } catch (error) {
            console.error('Error guardando record:', error);
        }
    }
    
    async getRecord(key) {
        if (!this.db) return null;
        
        try {
            const transaction = this.db.transaction(['records'], 'readonly');
            const store = transaction.objectStore('records');
            const request = store.get(key);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result.value);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => {
                    console.error('Error cargando record:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error en getRecord:', error);
            return null;
        }
    }
    
    async loadRecords() {
        const bestTime = await this.getRecord('bestTime');
        const bestAttempts = await this.getRecord('bestAttempts');
        
        this.bestTimeDisplay.textContent = bestTime ? 
            `${Math.floor(bestTime / 60).toString().padStart(2, '0')}:${(bestTime % 60).toString().padStart(2, '0')}` : 
            '--:--';
        
        this.bestAttemptsDisplay.textContent = bestAttempts ? bestAttempts.toString() : '--';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
