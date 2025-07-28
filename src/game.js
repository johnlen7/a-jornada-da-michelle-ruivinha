// Classe principal do jogo
class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Sistema de loading
        this.loadingScreen = new LoadingScreen(this.ctx, this.canvas);
        this.isLoading = true;
        
        this.audioManager = new AudioManager();
        this.sceneRenderer = new SceneRenderer(this.ctx, this.canvas);
        this.audioInitialized = false;
        
        // Game state
        this.gameState = {
            currentScreen: 'start', // 'start', 'map' or 'level'
            currentLevel: -1,
            questionsAnswered: [false, false, false],
            playerX: 400,
            playerY: 300,
            playerDirection: 'down',
            isMoving: false,
            canMove: false,
            animationFrame: 0,
            interactionActive: false,
            treasureGlowing: false,
            gameStarted: false,
            soundEnabled: true
        };
        
        // Questions data
        this.questions = [
            {
                title: "Primeira Lembrança ❤️",
                text: "Qual a data do nosso primeiro beijo?",
                options: ["05/08/19", "08/09/19", "10/09/19", "15/08/19"],
                correct: 1
            },
            {
                title: "Nossos Apelidos 🐰",
                text: "Quais eram nossos apelidos?",
                options: ["Gatinho e Gatinha", "Coelhinho e Cenourinha", "Docinho e Benzinho", "Amor e Paixão"],
                correct: 1
            },
            {
                title: "Pedido de Namoro 💕",
                text: "Quando foi o pedido de namoro?",
                options: ["20/10/19", "22/10/19", "25/10/19", "18/10/19"],
                correct: 1
            }
        ];
        
        // Map locations
        this.mapLocations = [
            { 
                name: "Quarto Hogwarts", 
                x: 150, 
                y: 200, 
                unlocked: true,
                color: "#8B4513",
                houseColor: "#654321"
            },
            { 
                name: "Central Perk", 
                x: 650, 
                y: 200, 
                unlocked: false,
                color: "#FF8C00",
                houseColor: "#CD853F"
            },
            { 
                name: "Caminho Forte", 
                x: 400, 
                y: 100, 
                unlocked: false,
                color: "#4682B4",
                houseColor: "#5F9EA0"
            },
            { 
                name: "Forte Copacabana", 
                x: 400, 
                y: 450, 
                unlocked: false,
                color: "#DAA520",
                houseColor: "#B8860B",
                isFort: true
            }
        ];
        
        // Level environments
        this.levels = [
            { name: "Quarto Hogwarts", color: "#2F1B69", npcX: 360, npcY: 380 }, // Na mesa central
            { name: "Central Perk", color: "#FF8C00", npcX: 400, npcY: 380 }, // No sofá central
            { name: "Caminho para o Forte", color: "#4682B4", npcX: 400, npcY: 480 }, // Na trilha
            { name: "Forte Copacabana", color: "#1e3a8a", npcX: 400, npcY: 250 } // Na torre central
        ];
        
        // Input handling
        this.keys = {};
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupMobileControls();
        this.updateLevelIndicator();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', async (e) => {
            // Ignorar inputs durante loading
            if (this.isLoading) return;
            
            this.keys[e.code] = true;
            
            // Inicializar áudio na primeira interação
            if (!this.audioInitialized) {
                await this.audioManager.initAudioAfterUserGesture();
                this.audioInitialized = true;
            }
            
            // Start game on any key press
            if (!this.gameState.gameStarted && this.gameState.currentScreen === 'start') {
                this.audioManager.resumeContext();
                this.gameState.gameStarted = true;
                this.gameState.currentScreen = 'map';
                this.gameState.canMove = true;
                this.updateLevelIndicator();
                this.audioManager.playBackgroundMusic(this.gameState.currentScreen, this.gameState.currentLevel);
                this.audioManager.playInteractSound();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // Ignorar inputs durante loading
            if (this.isLoading) return;
            
            this.keys[e.code] = false;
        });
    }

    setupMobileControls() {        // Botão de som
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.addEventListener('click', () => {
            this.gameState.soundEnabled = this.audioManager.toggleSound();
            soundToggle.textContent = this.gameState.soundEnabled ? '🔊 SOM' : '🔇 MUDO';
            soundToggle.classList.toggle('muted', !this.gameState.soundEnabled);
            
            if (this.gameState.soundEnabled) {
                this.audioManager.playInteractSound();
                // Reativar música se o jogo já começou
                if (this.gameState.gameStarted && this.gameState.currentScreen !== 'start') {
                    this.audioManager.playBackgroundMusic(this.gameState.currentScreen, this.gameState.currentLevel);
                }
            } else {
                // Garantir que todos os sons param quando desabilitado
                this.audioManager.setSoundEnabled(false);
            }
        });        // D-Pad controls
        const dPadButtons = document.querySelectorAll('.d-pad-btn[data-direction]');
        dPadButtons.forEach(btn => {
            btn.addEventListener('touchstart', async (e) => {
                e.preventDefault();
                
                // Inicializar áudio na primeira interação
                if (!this.audioInitialized) {
                    await this.audioManager.initAudioAfterUserGesture();
                    this.audioInitialized = true;
                }
                
                const direction = btn.dataset.direction;
                this.handleMobileMovement(direction, true);
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileMovement(direction, false);
            });
            
            // Mouse events for desktop testing
            btn.addEventListener('mousedown', async (e) => {
                e.preventDefault();
                
                // Inicializar áudio na primeira interação
                if (!this.audioInitialized) {
                    await this.audioManager.initAudioAfterUserGesture();
                    this.audioInitialized = true;
                }
                
                const direction = btn.dataset.direction;
                this.handleMobileMovement(direction, true);
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileMovement(direction, false);
            });
        });        // Interact button
        const interactBtn = document.getElementById('interactBtn');
        interactBtn.addEventListener('touchstart', async (e) => {
            e.preventDefault();
            
            // Inicializar áudio na primeira interação
            if (!this.audioInitialized) {
                await this.audioManager.initAudioAfterUserGesture();
                this.audioInitialized = true;
            }
            
            this.handleInteraction();
        });

        interactBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Inicializar áudio na primeira interação
            if (!this.audioInitialized) {
                await this.audioManager.initAudioAfterUserGesture();
                this.audioInitialized = true;
            }
            
            this.handleInteraction();
        });
    }

    handleMobileMovement(direction, isPressed) {
        const keyMap = {
            'up': 'ArrowUp',
            'down': 'ArrowDown',
            'left': 'ArrowLeft',
            'right': 'ArrowRight'
        };
        
        if (keyMap[direction]) {
            this.keys[keyMap[direction]] = isPressed;
        }
    }

    handleInteraction() {
        if (!this.gameState.interactionActive) {
            this.audioManager.playInteractSound();
            
            if (this.gameState.currentScreen === 'map') {
                this.checkMapInteraction();
            } else {
                this.checkLevelInteraction();
            }
        }
    }

    updatePlayer() {
        if (!this.gameState.canMove || this.gameState.interactionActive) return;
        
        let newX = this.gameState.playerX;
        let newY = this.gameState.playerY;
        let moved = false;
        
        // Handle input
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            newX -= 3;
            this.gameState.playerDirection = 'left';
            moved = true;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            newX += 3;
            this.gameState.playerDirection = 'right';
            moved = true;
        }
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            newY -= 3;
            this.gameState.playerDirection = 'up';
            moved = true;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            newY += 3;
            this.gameState.playerDirection = 'down';
            moved = true;
        }
        
        // Interaction
        if (this.keys['Space'] || this.keys['Enter']) {
            this.handleInteraction();
        }
        
        // Boundary checking
        newX = Math.max(20, Math.min(newX, this.canvas.width - 20));
        newY = Math.max(20, Math.min(newY, this.canvas.height - 20));
        
        // Update position
        if (moved) {
            this.gameState.playerX = newX;
            this.gameState.playerY = newY;
            this.gameState.isMoving = true;
            this.gameState.animationFrame++;
            
            if (this.gameState.animationFrame % 10 === 0) {
                this.audioManager.playMoveSound();
            }
        } else {
            this.gameState.isMoving = false;
        }
        
        // Check if near interactive object
        if (this.gameState.currentScreen === 'map') {
            this.checkNearMapLocation();
        } else {
            this.checkNearInteractiveObject();
        }
    }

    checkMapInteraction() {
        this.mapLocations.forEach((location, index) => {
            const distance = Math.sqrt(
                Math.pow(this.gameState.playerX - location.x, 2) + 
                Math.pow(this.gameState.playerY - location.y, 2)
            );
            
            if (distance < 60 && location.unlocked) {
                this.enterLevel(index);
            }
        });
    }

    checkNearMapLocation() {
        let nearLocation = false;
        
        this.mapLocations.forEach((location, index) => {
            const distance = Math.sqrt(
                Math.pow(this.gameState.playerX - location.x, 2) + 
                Math.pow(this.gameState.playerY - location.y, 2)
            );
            
            if (distance < 60 && location.unlocked) {
                nearLocation = true;
            }
        });
        
        const hintElement = document.getElementById('interactionHint');
        if (nearLocation) {
            hintElement.style.display = 'block';
        } else {
            hintElement.style.display = 'none';
        }
    }

    enterLevel(levelIndex) {
        this.gameState.currentScreen = 'level';
        this.gameState.currentLevel = levelIndex;
        this.gameState.playerX = 400;
        this.gameState.playerY = 500;
        this.updateLevelIndicator();
        // Trocar música imediatamente ao entrar no nível
        this.audioManager.playBackgroundMusic(this.gameState.currentScreen, this.gameState.currentLevel);
    }
    
    exitLevel() {
        this.gameState.currentScreen = 'map';
        this.gameState.currentLevel = -1;
        this.gameState.playerX = 400;
        this.gameState.playerY = 300;
        this.updateLevelIndicator();
        // Trocar música imediatamente ao sair do nível
        this.audioManager.playBackgroundMusic(this.gameState.currentScreen, this.gameState.currentLevel);
    }

    checkLevelInteraction() {
        // Check exit door
        if (this.gameState.playerY > 560 && 
            this.gameState.playerX > 370 && 
            this.gameState.playerX < 430) {
            this.exitLevel();
            return;
        }
        // Caminho do Forte: só interage se perto da barraca de churros E pressionar ESPAÇO
        if (this.gameState.currentLevel === 2) {
            const churrosX = 600; // nova posição da barraca
            const churrosY = 480; // altura da barraca
            const distance = Math.sqrt(
                Math.pow(this.gameState.playerX - churrosX, 2) + 
                Math.pow(this.gameState.playerY - churrosY, 2)
            );
            if (distance < 50 && (this.keys['Space'] || this.keys['Enter'])) {
                if (!this.gameState.questionsAnswered[2]) {
                    this.showQuestion(2);
                }
            }
            return;
        }
        // Check NPC interaction para outros níveis
        const level = this.levels[this.gameState.currentLevel];
        const distance = Math.sqrt(
            Math.pow(this.gameState.playerX - level.npcX, 2) + 
            Math.pow(this.gameState.playerY - level.npcY, 2)
        );
        if (distance < 50 && (this.keys['Space'] || this.keys['Enter'])) {
            if (this.gameState.currentLevel < 3) {
                if (!this.gameState.questionsAnswered[this.gameState.currentLevel]) {
                    this.showQuestion(this.gameState.currentLevel);
                }
            } else {
                this.showFinalQuestion();
            }
        }
    }

    checkNearInteractiveObject() {
        let nearObject = false;
        // Check exit door
        if (this.gameState.playerY > 540 && 
            this.gameState.playerX > 360 && 
            this.gameState.playerX < 440) {
            nearObject = true;
        }
        // Caminho do Forte: só mostra dica se perto da barraca de churros
        if (this.gameState.currentLevel === 2) {
            const churrosX = 600;
            const churrosY = 480;
            const distance = Math.sqrt(
                Math.pow(this.gameState.playerX - churrosX, 2) + 
                Math.pow(this.gameState.playerY - churrosY, 2)
            );
            if (distance < 50) {
                nearObject = true;
            }
            const hintElement = document.getElementById('interactionHint');
            if (nearObject) {
                hintElement.style.display = 'block';
            } else {
                hintElement.style.display = 'none';
            }
            return;
        }
        // Check NPC para outros níveis
        const level = this.levels[this.gameState.currentLevel];
        const distance = Math.sqrt(
            Math.pow(this.gameState.playerX - level.npcX, 2) + 
            Math.pow(this.gameState.playerY - level.npcY, 2)
        );
        if (distance < 60) {
            nearObject = true;
        }
        const hintElement = document.getElementById('interactionHint');
        if (nearObject) {
            hintElement.style.display = 'block';
        } else {
            hintElement.style.display = 'none';
        }
    }    showQuestion(questionIndex) {
        const question = this.questions[questionIndex];
        this.gameState.canMove = false;
        this.gameState.interactionActive = true;
        
        // Esconder hint de interação
        document.getElementById('interactionHint').style.display = 'none';
        
        document.getElementById('questionTitle').textContent = question.title;
        document.getElementById('questionText').textContent = question.text;
        
        const optionsContainer = document.getElementById('questionOptions');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.onclick = () => this.answerQuestion(questionIndex, index);
            optionsContainer.appendChild(button);
        });
        
        document.getElementById('questionResult').textContent = '';
        document.getElementById('questionDialog').style.display = 'block';
    }

    answerQuestion(questionIndex, answerIndex) {
        const question = this.questions[questionIndex];
        const resultElement = document.getElementById('questionResult');
        const buttons = document.querySelectorAll('.option-btn');
        
        if (answerIndex === question.correct) {
            resultElement.textContent = 'Correto! ❤️';
            resultElement.style.color = '#00ff00';
            buttons[answerIndex].classList.add('correct');
            this.audioManager.playCorrectSound();
            
            this.gameState.questionsAnswered[questionIndex] = true;
            
            // Unlock next location
            if (questionIndex < this.mapLocations.length - 1) {
                this.mapLocations[questionIndex + 1].unlocked = true;
            }
            
            setTimeout(() => {
                this.hideQuestion();
                this.exitLevel();
            }, 2000);
        } else {
            resultElement.textContent = 'Tenta de novo!';
            resultElement.style.color = '#ff0000';
            buttons[answerIndex].classList.add('wrong');
            this.audioManager.playWrongSound();
            
            setTimeout(() => {
                resultElement.textContent = '';
                buttons.forEach(btn => {
                    btn.classList.remove('wrong');
                });
            }, 1000);
        }
    }

    showFinalQuestion() {
        if (!this.canAccessFinalLevel()) {
            return;
        }
        
        this.gameState.canMove = false;
        this.gameState.interactionActive = true;
        
        document.getElementById('questionTitle').textContent = '💍 O Grande Momento 💍';
        document.getElementById('questionText').textContent = 'Quer casar comigo?';
        
        const optionsContainer = document.getElementById('questionOptions');
        optionsContainer.innerHTML = '';
        
        const yesButton = document.createElement('button');
        yesButton.className = 'option-btn';
        yesButton.textContent = 'Sim ❤️';
        yesButton.onclick = () => this.finalAnswer(true);
        
        const noButton = document.createElement('button');
        noButton.className = 'option-btn';
        noButton.textContent = 'Não';
        noButton.onclick = () => this.finalAnswer(false);
        
        optionsContainer.appendChild(yesButton);
        optionsContainer.appendChild(noButton);
        
        document.getElementById('questionResult').textContent = '';
        document.getElementById('questionDialog').style.display = 'block';
    }

    finalAnswer(accepted) {
        const resultElement = document.getElementById('questionResult');
        
        if (accepted) {
            resultElement.textContent = 'SIM! ❤️❤️❤️';
            resultElement.style.color = '#ff69b4';
            
            // Parar música de fundo para dar destaque aos fogos
            this.audioManager.stopBackgroundMusic();
            
            setTimeout(() => {
                this.hideQuestion();
                this.startFireworks();
                this.audioManager.playFireworksSound();
                setTimeout(() => {
                    this.showFinalMessage();
                }, 3000);
            }, 2000);
        } else {
            resultElement.textContent = 'Nan nan ni na não! Tenta de novo!';
            resultElement.style.color = '#ffa500';
            
            setTimeout(() => {
                resultElement.textContent = '';
            }, 1500);
        }
    }

    canAccessFinalLevel() {
        return this.gameState.questionsAnswered[0] && 
               this.gameState.questionsAnswered[1] && 
               this.gameState.questionsAnswered[2];
    }

    updateLevelIndicator() {
        const indicator = document.getElementById('levelIndicator');
        if (this.gameState.currentScreen === 'start') {
            indicator.textContent = '';
        } else if (this.gameState.currentScreen === 'map') {
            indicator.textContent = 'Vila Mágica do Amor ❤️';
        } else {
            indicator.textContent = this.levels[this.gameState.currentLevel].name;
        }
    }

    hideQuestion() {
        document.getElementById('questionDialog').style.display = 'none';
        document.getElementById('interactionHint').style.display = 'none';
        this.gameState.canMove = true;
        this.gameState.interactionActive = false;
    }

    updateTreasureGlow() {
        // Make treasure glow if all questions are answered
        if (this.gameState.questionsAnswered[0] && 
            this.gameState.questionsAnswered[1] && 
            this.gameState.questionsAnswered[2]) {
            this.gameState.treasureGlowing = Math.sin(Date.now() * 0.01) > 0;
        }
    }

    startFireworks() {
        const fireworksContainer = document.getElementById('fireworks');
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 200);
        }
    }

    createFirework() {
        const fireworksContainer = document.getElementById('fireworks');
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040'];
        
        for (let i = 0; i < 12; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            
            fireworksContainer.appendChild(firework);
            
            setTimeout(() => {
                firework.remove();
            }, 2000);
        }
    }

    showFinalMessage() {
        document.getElementById('finalMessage').style.display = 'block';
    }    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Tela de loading
        if (this.isLoading) {
            const loadingComplete = this.loadingScreen.update();
            this.loadingScreen.draw();
            
            if (loadingComplete) {
                this.isLoading = false;
                document.getElementById('ui').style.display = 'block';
            }
        } else if (this.gameState.currentScreen === 'start') {
            this.sceneRenderer.drawStartScreen();
        } else {
            this.updatePlayer();
            this.updateTreasureGlow();
            
            if (this.gameState.currentScreen === 'map') {
                this.sceneRenderer.drawMap(this.gameState.playerX, this.gameState.playerY, this.mapLocations);
            } else {
                const level = this.levels[this.gameState.currentLevel];
                this.ctx.fillStyle = level.color;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.sceneRenderer.drawLevelDecorations(this.gameState.currentLevel);
                this.sceneRenderer.drawNPC(this.gameState.currentLevel, level.npcX, level.npcY, this.gameState.treasureGlowing);
                this.sceneRenderer.drawExitDoor();
                this.sceneRenderer.drawPlayer(this.gameState.playerX, this.gameState.playerY);
            }
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
} else {
    window.GameManager = GameManager;
}
