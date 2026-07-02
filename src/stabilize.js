// Camada de estabilização: normaliza início, input, progresso e mapa.
// Esta camada é carregada antes de criar o GameManager em src/main.js.
(function stabilizeMichelleGame(window, document) {
    const DATA = window.GameData || {};
    const STORAGE_KEY = DATA.storageKey || 'michelleGameProgress.v1';
    const INTERACTION_COOLDOWN_MS = 250;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getImagePath(key) {
        return DATA.assets && DATA.assets.images ? DATA.assets.images[key] : null;
    }

    function createImage(src) {
        const image = new Image();
        image.src = src;
        return image;
    }

    function updateStartButton(game) {
        const button = document.getElementById('startGameBtn');
        if (!button || !game || !game.gameState) return;
        button.classList.toggle('is-hidden', game.gameState.gameStarted || game.gameState.currentScreen !== 'start');
    }

    function applyGameData(game) {
        if (!game || !DATA.mapLocations || !DATA.levels || !DATA.questions) return;

        game.mapLocations = clone(DATA.mapLocations);
        game.levels = clone(DATA.levels);
        game.questions = clone(DATA.questions);

        if (!Array.isArray(game.gameState.questionsAnswered) || game.gameState.questionsAnswered.length !== game.questions.length) {
            game.gameState.questionsAnswered = game.questions.map(() => false);
        }

        if (typeof game.updateLevelIndicator === 'function') {
            game.updateLevelIndicator();
        }
    }

    function saveProgress(game) {
        if (!game || !game.gameState) return;

        try {
            const progress = {
                version: DATA.version || '1.0.0',
                questionsAnswered: game.gameState.questionsAnswered,
                unlockedLocations: game.mapLocations.map((location) => Boolean(location.unlocked)),
                finalAccepted: Boolean(game.gameState.finalAccepted),
                updatedAt: new Date().toISOString()
            };

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (error) {
            console.warn('Não foi possível salvar o progresso:', error);
        }
    }

    function loadProgress(game) {
        if (!game || !game.gameState) return;

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const progress = JSON.parse(raw);
            if (Array.isArray(progress.questionsAnswered)) {
                game.gameState.questionsAnswered = game.gameState.questionsAnswered.map((_, index) => Boolean(progress.questionsAnswered[index]));
            }

            if (Array.isArray(progress.unlockedLocations)) {
                game.mapLocations.forEach((location, index) => {
                    location.unlocked = index === 0 || Boolean(progress.unlockedLocations[index]);
                });
            } else {
                game.mapLocations.forEach((location, index) => {
                    location.unlocked = index === 0 || Boolean(game.gameState.questionsAnswered[index - 1]);
                });
            }

            game.gameState.finalAccepted = Boolean(progress.finalAccepted);
            if (typeof game.updateLevelIndicator === 'function') {
                game.updateLevelIndicator();
            }
        } catch (error) {
            console.warn('Não foi possível carregar o progresso salvo:', error);
        }
    }

    function patchGameManager() {
        if (!window.GameManager || window.GameManager.__stabilized) return;

        const proto = window.GameManager.prototype;
        const originalAnswerQuestion = proto.answerQuestion;
        const originalFinalAnswer = proto.finalAnswer;
        const originalGameLoop = proto.gameLoop;

        proto.initializeAudioAfterGesture = async function initializeAudioAfterGesture() {
            if (this.audioInitialized || !this.audioManager) return;

            try {
                if (typeof this.audioManager.initAudioAfterUserGesture === 'function') {
                    await this.audioManager.initAudioAfterUserGesture();
                }
                this.audioInitialized = true;
            } catch (error) {
                console.warn('Não foi possível inicializar o áudio:', error);
            }
        };

        proto.start = function start() {
            if (this.gameState.gameStarted) return true;

            if (this.isLoading) {
                this.pendingStart = true;
                return false;
            }

            if (this.audioManager && typeof this.audioManager.resumeContext === 'function') {
                this.audioManager.resumeContext();
            }

            this.gameState.gameStarted = true;
            this.gameState.currentScreen = 'map';
            this.gameState.canMove = true;
            this.pendingStart = false;

            if (typeof this.updateLevelIndicator === 'function') {
                this.updateLevelIndicator();
            }

            if (this.audioManager && typeof this.audioManager.playBackgroundMusic === 'function') {
                this.audioManager.playBackgroundMusic(this.gameState.currentScreen, this.gameState.currentLevel);
                this.audioManager.playInteractSound();
            }

            updateStartButton(this);
            saveProgress(this);
            return true;
        };

        proto.setupEventListeners = function setupEventListeners() {
            document.addEventListener('keydown', async (event) => {
                if (this.isLoading) return;

                this.keys[event.code] = true;
                await this.initializeAudioAfterGesture();

                if (!this.gameState.gameStarted && this.gameState.currentScreen === 'start') {
                    this.start();
                    event.preventDefault();
                    return;
                }

                if (event.code === 'Space' || event.code === 'Enter') {
                    event.preventDefault();
                }
            });

            document.addEventListener('keyup', (event) => {
                if (this.isLoading) return;
                this.keys[event.code] = false;
            });
        };

        proto.setupMobileControls = function setupMobileControls() {
            const soundToggle = document.getElementById('soundToggle');
            const startButton = document.getElementById('startGameBtn');
            const interactButton = document.getElementById('interactBtn');
            const canvas = document.getElementById('gameCanvas');
            const directionButtons = document.querySelectorAll('.d-pad-btn[data-direction]');

            if (soundToggle && !soundToggle.dataset.bound) {
                soundToggle.dataset.bound = 'true';
                soundToggle.addEventListener('click', () => {
                    this.gameState.soundEnabled = this.audioManager.toggleSound();
                    soundToggle.textContent = this.gameState.soundEnabled ? '🔊 SOM' : '🔇 MUDO';
                    soundToggle.classList.toggle('muted', !this.gameState.soundEnabled);

                    if (this.gameState.soundEnabled && this.gameState.gameStarted && this.gameState.currentScreen !== 'start') {
                        this.audioManager.playBackgroundMusic(this.gameState.currentScreen, this.gameState.currentLevel);
                    }
                });
            }

            if (startButton && !startButton.dataset.bound) {
                startButton.dataset.bound = 'true';
                startButton.addEventListener('click', async (event) => {
                    event.preventDefault();
                    await this.initializeAudioAfterGesture();
                    this.start();
                });
            }

            directionButtons.forEach((button) => {
                if (button.dataset.bound) return;
                button.dataset.bound = 'true';

                const direction = button.dataset.direction;
                const press = async (event) => {
                    event.preventDefault();
                    await this.initializeAudioAfterGesture();
                    if (!this.gameState.gameStarted && this.gameState.currentScreen === 'start') {
                        this.start();
                    }
                    this.handleMobileMovement(direction, true);
                    button.classList.add('active');
                };

                const release = (event) => {
                    if (event) event.preventDefault();
                    this.handleMobileMovement(direction, false);
                    button.classList.remove('active');
                };

                button.addEventListener('pointerdown', press);
                button.addEventListener('pointerup', release);
                button.addEventListener('pointerleave', release);
                button.addEventListener('pointercancel', release);
            });

            if (interactButton && !interactButton.dataset.bound) {
                interactButton.dataset.bound = 'true';
                interactButton.addEventListener('pointerdown', async (event) => {
                    event.preventDefault();
                    await this.initializeAudioAfterGesture();
                    if (!this.gameState.gameStarted && this.gameState.currentScreen === 'start') {
                        this.start();
                    } else {
                        this.handleInteraction();
                    }
                    interactButton.classList.add('active');
                });

                interactButton.addEventListener('pointerup', () => interactButton.classList.remove('active'));
                interactButton.addEventListener('pointerleave', () => interactButton.classList.remove('active'));
            }

            if (canvas && !canvas.dataset.startBound) {
                canvas.dataset.startBound = 'true';
                canvas.addEventListener('pointerdown', async () => {
                    if (!this.isLoading && !this.gameState.gameStarted && this.gameState.currentScreen === 'start') {
                        await this.initializeAudioAfterGesture();
                        this.start();
                    }
                });
            }
        };

        proto.handleInteraction = function handleInteraction() {
            const now = Date.now();
            if (this.lastInteractionAt && now - this.lastInteractionAt < INTERACTION_COOLDOWN_MS) return;
            this.lastInteractionAt = now;

            if (!this.gameState.gameStarted && this.gameState.currentScreen === 'start') {
                this.start();
                return;
            }

            if (this.gameState.interactionActive) return;

            if (this.audioManager && typeof this.audioManager.playInteractSound === 'function') {
                this.audioManager.playInteractSound();
            }

            if (this.gameState.currentScreen === 'map') {
                this.checkMapInteraction();
            } else {
                this.checkLevelInteraction();
            }
        };

        proto.answerQuestion = function answerQuestion(questionIndex, answerIndex) {
            originalAnswerQuestion.call(this, questionIndex, answerIndex);
            saveProgress(this);
        };

        proto.finalAnswer = function finalAnswer(accepted) {
            if (accepted) {
                this.gameState.finalAccepted = true;
            }
            originalFinalAnswer.call(this, accepted);
            saveProgress(this);
        };

        proto.gameLoop = function gameLoop() {
            originalGameLoop.call(this);

            if (!this.isLoading && this.pendingStart && !this.gameState.gameStarted) {
                this.start();
            }

            updateStartButton(this);
        };

        proto.saveProgress = function saveProgressPublic() {
            saveProgress(this);
        };

        proto.loadProgress = function loadProgressPublic() {
            loadProgress(this);
        };

        window.GameManager.__stabilized = true;
    }

    function patchSceneRenderer() {
        if (!window.SceneRenderer || window.SceneRenderer.__stabilized) return;

        const proto = window.SceneRenderer.prototype;

        proto.ensureMapHouseImages = function ensureMapHouseImages() {
            const assetMap = {
                hogwarts: 'hogwartsHouse',
                centralperk: 'centralPerk',
                caminhoforte: 'fortePath',
                fortecopacabana: 'forte'
            };

            if (!this.mapHouseImages) this.mapHouseImages = {};

            Object.entries(assetMap).forEach(([imageKey, assetKey]) => {
                const path = getImagePath(assetKey);
                if (!path) return;

                if (!this.mapHouseImages[imageKey] || !this.mapHouseImages[imageKey].src.includes(path)) {
                    this.mapHouseImages[imageKey] = createImage(path);
                }
            });
        };

        proto.drawMap = function drawMap(playerX, playerY, mapLocations) {
            const ctx = this.ctx;
            const canvas = this.canvas;
            this.ensureMapHouseImages();

            const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
            sky.addColorStop(0, '#87CEEB');
            sky.addColorStop(1, '#B0E0E6');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

            ctx.fillStyle = '#8B7D6B';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height * 0.42);
            ctx.lineTo(160, canvas.height * 0.22);
            ctx.lineTo(360, canvas.height * 0.34);
            ctx.lineTo(590, canvas.height * 0.18);
            ctx.lineTo(canvas.width, canvas.height * 0.28);
            ctx.lineTo(canvas.width, canvas.height * 0.6);
            ctx.lineTo(0, canvas.height * 0.6);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#32CD32';
            ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 8]);
            ctx.beginPath();
            ctx.moveTo(mapLocations[0].x + 55, mapLocations[0].y + 5);
            ctx.lineTo(mapLocations[1].x - 55, mapLocations[1].y + 5);
            ctx.lineTo(mapLocations[2].x, mapLocations[2].y + 55);
            ctx.lineTo(mapLocations[3].x, mapLocations[3].y - 55);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(65, 105, 225, 0.75)';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 + 110, 70, 0, Math.PI * 2);
            ctx.fill();

            const treePositions = [[100, 470], [700, 470], [70, 120], [730, 120], [320, 420], [500, 420]];
            treePositions.forEach(([x, y]) => this.drawMagicalTree(x, y));

            mapLocations.forEach((location, index) => this.drawMapLocation(location, index));
            this.drawPlayer(playerX, playerY);
        };

        proto.drawMapLocation = function drawMapLocation(location, index) {
            const ctx = this.ctx;
            const imageByIndex = ['hogwarts', 'centralperk', 'caminhoforte', 'fortecopacabana'];
            const image = this.mapHouseImages ? this.mapHouseImages[imageByIndex[index]] : null;
            const x = location.x;
            const y = location.y;
            const unlocked = Boolean(location.unlocked);
            const width = location.isFort ? 96 : 76;
            const height = location.isFort ? 96 : 76;

            ctx.save();
            ctx.globalAlpha = unlocked ? 1 : 0.42;

            if (image && image.complete && image.naturalWidth) {
                ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
            } else {
                ctx.fillStyle = unlocked ? location.houseColor : '#404040';
                ctx.fillRect(x - width / 2, y - height / 3, width, height / 2);
                ctx.fillStyle = unlocked ? '#8B0000' : '#2F2F2F';
                ctx.beginPath();
                ctx.moveTo(x - width / 2 - 6, y - height / 3);
                ctx.lineTo(x, y - height / 2 - 18);
                ctx.lineTo(x + width / 2 + 6, y - height / 3);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();

            ctx.fillStyle = unlocked ? '#FFFFFF' : '#A9A9A9';
            ctx.font = '12px "Pixelify Sans", Arial';
            ctx.textAlign = 'center';
            ctx.fillText(location.name, x, y + 48);

            if (!unlocked) {
                ctx.font = '20px Arial';
                ctx.fillStyle = '#FF4757';
                ctx.fillText('🔒', x, y - 56);
            }
        };

        window.SceneRenderer.__stabilized = true;
    }

    function apply(game) {
        patchGameManager();
        patchSceneRenderer();
        applyGameData(game);
        loadProgress(game);
        updateStartButton(game);

        window.resetMichelleProgress = function resetMichelleProgress() {
            window.localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        };
    }

    patchGameManager();
    patchSceneRenderer();

    window.MichelleGameStabilizer = {
        apply,
        saveProgress,
        loadProgress,
        patchGameManager,
        patchSceneRenderer
    };
})(window, document);
