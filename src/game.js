// ============================================================================
// GameManager — motor principal do jogo.
// Uma única classe gerencia: tela inicial, seleção de temporada, mapa, fases
// de pergunta, a fase de obstáculos (runner) e os finais de cada temporada.
// ============================================================================
(function registerGameManager(window, document) {
    const INTERACTION_COOLDOWN_MS = 250;
    const PLAYER_SPEED = 3.2;
    const INTERACT_RADIUS = 70;
    const MAP_ENTER_RADIUS = 62;

    const MAP_BOUNDS = { minX: 24, maxX: 776, minY: 24, maxY: 580 };

    // Limite aplicado a uma fase que não declara `bounds` no arquivo de
    // conteúdo — mantém a personagem dentro da área visível da cena.
    const DEFAULT_LEVEL_BOUNDS = { minX: 24, maxX: 776, minY: 24, maxY: 580 };

    class GameManager {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.ctx.imageSmoothingEnabled = false;

            this.loadingScreen = new LoadingScreen(this.ctx, this.canvas);
            this.isLoading = true;

            this.audioManager = new AudioManager();
            this.sceneRenderer = new SceneRenderer(this.ctx, this.canvas);
            this.audioInitialized = false;

            this.gameState = {
                screen: 'start', // start | season | map | level | runner
                started: false,
                currentLevel: -1,
                playerX: 400,
                playerY: 300,
                playerDirection: 'down',
                isMoving: false,
                canMove: false,
                interactionActive: false
            };

            this.season = null;
            this.runner = null;
            this.keys = {};
            this.lastInteractionAt = 0;

            // Estado do diálogo/janela modal atualmente aberto (pergunta, momento
            // final, epílogo, desfechos do runner) — usado para conter o foco por
            // Tab e decidir se ESC fecha ou não.
            this.activeModal = null;
            this.modalDismissible = true;
            this.modalOnDismiss = null;
            this.modalPreviousFocus = null;

            this.dom = {
                ui: document.getElementById('ui'),
                soundToggle: document.getElementById('soundToggle'),
                levelIndicator: document.getElementById('levelIndicator'),
                startGameBtn: document.getElementById('startGameBtn'),
                interactionHint: document.getElementById('interactionHint'),
                questionDialog: document.getElementById('questionDialog'),
                questionTitle: document.getElementById('questionTitle'),
                questionText: document.getElementById('questionText'),
                questionOptions: document.getElementById('questionOptions'),
                questionResult: document.getElementById('questionResult'),
                finalMessage: document.getElementById('finalMessage'),
                finalTitle: document.getElementById('finalTitle'),
                finalText: document.getElementById('finalText'),
                finalActions: document.getElementById('finalActions'),
                seasonSelect: document.getElementById('seasonSelect'),
                season1Btn: document.getElementById('season1Btn'),
                season2Btn: document.getElementById('season2Btn'),
                fireworks: document.getElementById('fireworks'),
                runnerExitBtn: document.getElementById('runnerExitBtn')
            };

            // Problemas de conteúdo (questionId ou scene não encontrados) já
            // avisados, para não repetir o mesmo aviso a cada quadro.
            this.warnedContentIssues = new Set();

            const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
            this.hintText = coarse ? 'Toque em AÇÃO para interagir' : 'Pressione ESPAÇO para interagir';
            this.dom.interactionHint.textContent = this.hintText;

            this.setupCanvas();
            this.setupInput();
            this.gameLoop();

            // Utilitário de console: apaga o progresso das duas temporadas
            window.resetMichelleProgress = function resetMichelleProgress() {
                ['s1', 's2'].forEach((id) => {
                    const data = GameManager.seasonData(id);
                    if (data) window.localStorage.removeItem(data.storageKey);
                });
                window.location.reload();
            };
        }

        // --------------------------------------------------------------------
        // Configuração das temporadas
        // --------------------------------------------------------------------
        // O motor não conhece nenhuma temporada em particular — só clona o
        // conteúdo declarado em src/data/*.js. Acrescentar uma temporada nova
        // é: escrever um arquivo de conteúdo no mesmo formato e citar o id
        // aqui.
        static seasonData(id) {
            const source = id === 's1' ? window.GameData : id === 's2' ? window.Season2Data : null;
            if (!source) return null;
            return JSON.parse(JSON.stringify(source));
        }

        configureSeason(id) {
            const data = GameManager.seasonData(id);
            if (!data) return;

            this.season = data;
            this.seasonId = id;
            this.gameState.questionsAnswered = data.questions.map(() => false);
            this.gameState.runnerDone = false;
            this.gameState.finalAccepted = false;

            this.validateSeasonContent(id, data);
            this.loadProgress();
            this.markNextLocation();
        }

        // Confere a consistência do conteúdo declarado e avisa no console —
        // sem impedir o resto do jogo de funcionar. Cada problema aponta a
        // temporada, a fase e o campo envolvido, para ser fácil de corrigir
        // em src/data/*.js.
        validateSeasonContent(id, data) {
            const warn = (message) => console.warn(`[A Jornada de Michelle] Temporada "${id}": ${message}`);

            if (data.levels.length !== data.mapLocations.length) {
                warn(
                    `${data.levels.length} fase(s) declaradas em "levels", mas ${data.mapLocations.length} ` +
                    'ponto(s) em "mapLocations" — as duas listas precisam ter o mesmo tamanho, na mesma ordem.'
                );
            }

            data.levels.forEach((level) => {
                if (level.kind === 'question' && !data.questions.some((q) => q.id === level.questionId)) {
                    warn(`fase "${level.name}" aponta para a pergunta "${level.questionId}", que não existe em "questions".`);
                }
                if ((level.kind === 'question' || level.kind === 'final') && (level.interactX == null || level.interactY == null)) {
                    warn(`fase "${level.name}" (tipo "${level.kind}") não declara interactX/interactY.`);
                }
                if (level.kind !== 'runner' && level.scene && !SceneRenderer.SCENES[level.scene]) {
                    warn(`fase "${level.name}" declara scene "${level.scene}", que não está registrada em SceneRenderer.SCENES.`);
                }
                if (level.kind !== 'runner' && !level.scene) {
                    warn(`fase "${level.name}" (tipo "${level.kind}") não declara "scene" — nada será desenhado dentro dela.`);
                }
            });

            if (data.levels.some((l) => l.kind === 'runner') && !data.runner) {
                warn('há uma fase do tipo "runner" em "levels", mas a temporada não declara configuração em "runner".');
            }
        }

        markNextLocation() {
            if (!this.season) return;
            this.season.mapLocations.forEach((loc) => {
                loc.isNext = false;
            });
            for (let i = 0; i < this.season.levels.length; i++) {
                const done = this.isLevelComplete(i);
                if (!done) {
                    if (this.season.mapLocations[i] && this.season.mapLocations[i].unlocked) {
                        this.season.mapLocations[i].isNext = true;
                    }
                    return;
                }
            }
        }

        isLevelComplete(index) {
            const level = this.season.levels[index];
            if (!level) return false;
            if (level.kind === 'question') {
                const resolved = this.resolveLevelQuestion(level);
                return Boolean(resolved) && this.gameState.questionsAnswered[resolved.index];
            }
            if (level.kind === 'runner') return this.gameState.runnerDone;
            if (level.kind === 'final') return this.gameState.finalAccepted;
            return false;
        }

        // Liga uma fase do tipo pergunta ao seu conteúdo. Devolve `null` (em vez
        // de deixar circular um índice -1) quando o `questionId` declarado na
        // fase não existe em `season.questions` — conteúdo mal configurado não
        // pode travar a fase em silêncio, então avisa uma única vez no console.
        resolveLevelQuestion(level) {
            if (!level || level.kind !== 'question') return null;
            const index = this.season.questions.findIndex((q) => q.id === level.questionId);
            if (index < 0) {
                this.warnMissingQuestion(level);
                return null;
            }
            return { index, question: this.season.questions[index] };
        }

        warnMissingQuestion(level) {
            const key = `${this.seasonId}:${level.id}`;
            if (this.warnedContentIssues.has(key)) return;
            this.warnedContentIssues.add(key);
            console.warn(
                `[A Jornada de Michelle] A fase "${level.name}" (temporada "${this.seasonId}") ` +
                `aponta para a pergunta "${level.questionId}", que não existe em season.questions. ` +
                'A fase fica sem interação até o questionId ser corrigido no arquivo de conteúdo.'
            );
        }

        // Mesma ideia de warnMissingQuestion, para quando `level.scene` não
        // está registrada em SceneRenderer.SCENES — a fase fica sem desenho,
        // mas a saída pela porta e a navegação continuam funcionando.
        warnMissingScene(level) {
            const key = `${this.seasonId}:${level.id}:scene`;
            if (this.warnedContentIssues.has(key)) return;
            this.warnedContentIssues.add(key);
            console.warn(
                `[A Jornada de Michelle] A fase "${level.name}" (temporada "${this.seasonId}") ` +
                `declara scene "${level.scene}", que não está registrada em SceneRenderer.SCENES.`
            );
        }

        unlockAfter(index) {
            const next = this.season.mapLocations[index + 1];
            if (next) next.unlocked = true;
            this.markNextLocation();
        }

        // --------------------------------------------------------------------
        // Persistência (por temporada)
        // --------------------------------------------------------------------
        saveProgress() {
            if (!this.season) return;
            try {
                window.localStorage.setItem(this.season.storageKey, JSON.stringify({
                    version: this.season.version || '1.0.0',
                    questionsAnswered: this.gameState.questionsAnswered,
                    unlockedLocations: this.season.mapLocations.map((l) => Boolean(l.unlocked)),
                    runnerDone: Boolean(this.gameState.runnerDone),
                    finalAccepted: Boolean(this.gameState.finalAccepted),
                    updatedAt: new Date().toISOString()
                }));
            } catch (error) {
                console.warn('Não foi possível salvar o progresso:', error);
            }
        }

        loadProgress() {
            if (!this.season) return;
            try {
                const raw = window.localStorage.getItem(this.season.storageKey);
                if (!raw) return;
                const progress = JSON.parse(raw);

                // Progresso de uma versão de conteúdo diferente pode não bater
                // posição a posição com as fases/perguntas atuais — melhor
                // recomeçar a temporada do que aplicar progresso torto.
                if (progress.version !== this.season.version) {
                    console.warn(
                        `[A Jornada de Michelle] Progresso salvo da temporada "${this.seasonId}" está na ` +
                        `versão "${progress.version}", mas o conteúdo atual é a versão "${this.season.version}". ` +
                        'Descartando o progresso salvo e recomeçando esta temporada do início.'
                    );
                    return;
                }

                if (Array.isArray(progress.questionsAnswered)) {
                    this.gameState.questionsAnswered = this.gameState.questionsAnswered
                        .map((_, i) => Boolean(progress.questionsAnswered[i]));
                }
                if (Array.isArray(progress.unlockedLocations)) {
                    this.season.mapLocations.forEach((loc, i) => {
                        loc.unlocked = i === 0 || Boolean(progress.unlockedLocations[i]);
                    });
                }
                this.gameState.runnerDone = Boolean(progress.runnerDone);
                this.gameState.finalAccepted = Boolean(progress.finalAccepted);
            } catch (error) {
                console.warn('Não foi possível carregar o progresso salvo:', error);
            }
        }

        seasonCompleted(id) {
            try {
                const data = GameManager.seasonData(id);
                const raw = window.localStorage.getItem(data.storageKey);
                if (!raw) return false;
                const progress = JSON.parse(raw);
                if (progress.version !== data.version) return false;
                return Boolean(progress.finalAccepted);
            } catch {
                return false;
            }
        }

        // --------------------------------------------------------------------
        // Entrada (teclado + toque, sem disparos duplicados)
        // --------------------------------------------------------------------
        setupCanvas() {
            this.canvas.width = 800;
            this.canvas.height = 600;
        }

        async initAudioAfterGesture() {
            if (this.audioInitialized) return;
            try {
                await this.audioManager.initAudioAfterUserGesture();
                this.audioInitialized = true;
            } catch (error) {
                console.warn('Não foi possível inicializar o áudio:', error);
            }
        }

        setupInput() {
            document.addEventListener('keydown', async (event) => {
                if (this.isLoading) return;
                this.keys[event.code] = true;
                await this.initAudioAfterGesture();

                // Com um diálogo aberto, Tab fica contido nele e ESC decide por
                // precedência (fecha se for dispensável). As teclas de
                // movimento/interação do jogo não competem com os controles do
                // diálogo nem com a ativação nativa de botão por Espaço/Enter.
                if (this.activeModal) {
                    if (event.code === 'Tab') {
                        this.trapModalFocus(event);
                    } else if (event.code === 'Escape' && this.modalDismissible) {
                        event.preventDefault();
                        this.dismissActiveModal();
                    }
                    return;
                }

                if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                    event.preventDefault();
                }

                if (!this.gameState.started && this.gameState.screen === 'start') {
                    this.toSeasonSelect();
                    return;
                }

                if (event.code === 'Escape' && this.gameState.screen === 'runner') {
                    this.quitRunner();
                    return;
                }

                if (event.code === 'Space' || event.code === 'Enter') {
                    this.handleInteraction();
                }
            });

            document.addEventListener('keyup', (event) => {
                this.keys[event.code] = false;
            });

            // Botões fixos
            this.dom.soundToggle.addEventListener('click', () => {
                const enabled = this.audioManager.toggleSound();
                this.dom.soundToggle.textContent = enabled ? '🔊 SOM' : '🔇 MUDO';
                this.dom.soundToggle.classList.toggle('muted', !enabled);
                if (enabled) this.playMusicForCurrentScreen();
            });

            this.dom.startGameBtn.addEventListener('click', async () => {
                await this.initAudioAfterGesture();
                if (this.gameState.screen === 'start') this.toSeasonSelect();
            });

            this.canvas.addEventListener('pointerdown', async () => {
                await this.initAudioAfterGesture();
                if (!this.isLoading && this.gameState.screen === 'start') this.toSeasonSelect();
            });

            // Seleção de temporada
            this.dom.season1Btn.addEventListener('click', () => this.selectSeason('s1'));
            this.dom.season2Btn.addEventListener('click', () => this.selectSeason('s2'));

            // D-pad (pointer events cobrem toque e mouse, sem duplicar)
            document.querySelectorAll('.d-pad-btn[data-direction]').forEach((button) => {
                const direction = button.dataset.direction;
                const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

                const press = async (event) => {
                    event.preventDefault();
                    await this.initAudioAfterGesture();
                    if (this.gameState.screen === 'start') {
                        this.toSeasonSelect();
                        return;
                    }
                    this.keys[keyMap[direction]] = true;
                    button.classList.add('active');
                };
                const release = (event) => {
                    if (event) event.preventDefault();
                    this.keys[keyMap[direction]] = false;
                    button.classList.remove('active');
                };

                button.addEventListener('pointerdown', press);
                button.addEventListener('pointerup', release);
                button.addEventListener('pointerleave', release);
                button.addEventListener('pointercancel', release);
            });

            const interactBtn = document.getElementById('interactBtn');
            interactBtn.addEventListener('pointerdown', async (event) => {
                event.preventDefault();
                await this.initAudioAfterGesture();
                if (this.gameState.screen === 'start') {
                    this.toSeasonSelect();
                    return;
                }
                this.handleInteraction();
                interactBtn.classList.add('active');
            });
            ['pointerup', 'pointerleave', 'pointercancel'].forEach((type) => {
                interactBtn.addEventListener(type, () => interactBtn.classList.remove('active'));
            });

            // Botão de sair da fase de obstáculos — único caminho de saída por
            // toque, deliberadamente longe do D-pad e do botão AÇÃO para não
            // ser acionado sem querer.
            if (this.dom.runnerExitBtn) {
                this.dom.runnerExitBtn.addEventListener('click', () => this.confirmQuitRunner());
            }
        }

        // --------------------------------------------------------------------
        // Fluxo de telas
        // --------------------------------------------------------------------
        toSeasonSelect() {
            this.gameState.started = true;
            this.gameState.screen = 'season';
            this.gameState.canMove = false;
            this.dom.startGameBtn.classList.add('is-hidden');
            this.dom.seasonSelect.style.display = 'flex';

            const s1Done = this.seasonCompleted('s1');
            const s2Done = this.seasonCompleted('s2');
            this.dom.season1Btn.querySelector('em').textContent = s1Done ? '✅ Concluída' : '✨ Jogar';
            this.dom.season2Btn.querySelector('em').textContent = s2Done ? '✅ Concluída' : '✨ Jogar';
            this.updateLevelIndicator();
        }

        selectSeason(id) {
            this.configureSeason(id);
            this.dom.seasonSelect.style.display = 'none';
            this.gameState.screen = 'map';
            this.gameState.currentLevel = -1;
            this.gameState.playerX = 400;
            this.gameState.playerY = 385;
            this.gameState.canMove = true;
            this.updateLevelIndicator();
            this.audioManager.playInteractSound();
            this.audioManager.playBackgroundMusic(this.season.mapMusic);
        }

        backToSeasonSelect() {
            if (this.activeModal === this.dom.finalMessage) this.closeModal();
            this.dom.finalMessage.style.display = 'none';
            this.dom.ui.classList.remove('runner-mode');
            this.gameState.screen = 'season';
            this.gameState.canMove = false;
            this.toSeasonSelect();
        }

        enterLevel(index) {
            const level = this.season.levels[index];
            this.gameState.currentLevel = index;

            if (level.kind === 'runner') {
                this.startRunner();
                return;
            }

            this.gameState.screen = 'level';
            this.gameState.playerX = 400;
            this.gameState.playerY = level.spawnY || 520;
            this.gameState.playerDirection = 'up';
            this.updateLevelIndicator();
            this.audioManager.playBackgroundMusic(level.music);
        }

        exitLevel() {
            this.gameState.screen = 'map';
            this.gameState.currentLevel = -1;
            this.gameState.playerX = 400;
            this.gameState.playerY = 385;
            this.dom.ui.classList.remove('runner-mode');
            this.updateLevelIndicator();
            this.audioManager.playBackgroundMusic(this.season.mapMusic);
        }

        playMusicForCurrentScreen() {
            const screen = this.gameState.screen;
            if (screen === 'map') this.audioManager.playBackgroundMusic(this.season.mapMusic);
            else if (screen === 'level' || screen === 'runner') {
                this.audioManager.playBackgroundMusic(this.season.levels[this.gameState.currentLevel].music);
            }
        }

        // --------------------------------------------------------------------
        // Interações
        // --------------------------------------------------------------------
        handleInteraction() {
            const now = Date.now();
            if (now - this.lastInteractionAt < INTERACTION_COOLDOWN_MS) return;
            this.lastInteractionAt = now;

            if (this.gameState.interactionActive || this.gameState.screen === 'runner') return;

            if (this.gameState.screen === 'map') {
                const index = this.nearestMapLocation();
                if (index >= 0) {
                    this.audioManager.playInteractSound();
                    this.enterLevel(index);
                }
                return;
            }

            if (this.gameState.screen === 'level') {
                const level = this.season.levels[this.gameState.currentLevel];

                if (this.isAtExitDoor()) {
                    this.exitLevel();
                    return;
                }

                if (!this.isNearInteractPoint(level)) return;

                this.audioManager.playInteractSound();
                if (level.kind === 'question') {
                    const resolved = this.resolveLevelQuestion(level);
                    if (resolved && !this.gameState.questionsAnswered[resolved.index]) {
                        this.showQuestion(resolved.index);
                    }
                } else if (level.kind === 'final' && !this.gameState.finalAccepted) {
                    this.showFinale();
                }
            }
        }

        nearestMapLocation() {
            let found = -1;
            this.season.mapLocations.forEach((loc, index) => {
                const distance = Math.hypot(this.gameState.playerX - loc.x, this.gameState.playerY - loc.y);
                if (distance < MAP_ENTER_RADIUS && loc.unlocked) found = index;
            });
            return found;
        }

        isAtExitDoor() {
            const zone = SceneRenderer.EXIT_ZONE;
            return this.gameState.playerX > zone.x - 10 &&
                this.gameState.playerX < zone.x + zone.w + 10 &&
                this.gameState.playerY > zone.y - 8;
        }

        isNearInteractPoint(level) {
            const distance = Math.hypot(
                this.gameState.playerX - level.interactX,
                this.gameState.playerY - level.interactY
            );
            return distance < INTERACT_RADIUS;
        }

        // --------------------------------------------------------------------
        // Diálogos (perguntas, final, runner)
        // --------------------------------------------------------------------
        showDialog(title, text, options, resultText = '', { dismissible = true } = {}) {
            this.gameState.canMove = false;
            this.gameState.interactionActive = true;
            this.dom.interactionHint.style.display = 'none';
            this.dom.questionTitle.textContent = title;
            this.dom.questionText.textContent = text;
            this.dom.questionResult.textContent = resultText;
            this.dom.questionOptions.innerHTML = '';

            options.forEach((option) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option.label;
                button.addEventListener('click', option.onPick);
                this.dom.questionOptions.appendChild(button);
            });

            this.dom.questionDialog.style.display = 'block';
            this.openModal(this.dom.questionDialog, {
                dismissible,
                onDismiss: dismissible ? () => this.hideDialog() : null
            });
        }

        hideDialog() {
            this.dom.questionDialog.style.display = 'none';
            this.dom.interactionHint.style.display = 'none';
            this.gameState.canMove = true;
            this.gameState.interactionActive = false;
            if (this.activeModal === this.dom.questionDialog) {
                this.closeModal();
            }
        }

        // ---- Foco e contenção para qualquer janela modal do jogo ----------

        // Elementos que podem receber foco por Tab dentro de um contêiner.
        getModalFocusables(container) {
            return Array.from(
                container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ).filter((el) => !el.disabled && el.offsetParent !== null);
        }

        // Guarda o foco anterior, registra o contêiner como modal ativo e move
        // o foco para dentro dele. `dismissible` decide se ESC fecha sozinho;
        // `onDismiss` é chamado quando isso acontece.
        openModal(container, { dismissible = true, onDismiss = null } = {}) {
            this.activeModal = container;
            this.modalDismissible = dismissible;
            this.modalOnDismiss = onDismiss;
            this.modalPreviousFocus = document.activeElement;

            const focusables = this.getModalFocusables(container);
            const target = focusables[0] || container;
            // Um quadro de espera: o conteúdo (título, texto, botões) acabou de
            // ser montado, e o navegador precisa reconhecer os elementos antes
            // de conseguir focá-los.
            requestAnimationFrame(() => target.focus());
        }

        // Fecha o modal atual e devolve o foco a quem o tinha antes de abrir.
        closeModal() {
            const previous = this.modalPreviousFocus;
            this.activeModal = null;
            this.modalDismissible = true;
            this.modalOnDismiss = null;
            this.modalPreviousFocus = null;
            if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
                previous.focus();
            }
        }

        // ESC num modal dispensável: fecha e roda o efeito colateral registrado.
        dismissActiveModal() {
            const onDismiss = this.modalOnDismiss;
            this.closeModal();
            if (onDismiss) onDismiss();
        }

        // Tab/Shift+Tab só circulam entre os controles do modal ativo.
        trapModalFocus(event) {
            if (!this.activeModal) return;
            const focusables = this.getModalFocusables(this.activeModal);
            if (!focusables.length) return;

            event.preventDefault();
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const current = document.activeElement;
            const currentIndex = focusables.indexOf(current);

            let nextIndex;
            if (event.shiftKey) {
                nextIndex = current === first || currentIndex < 0 ? focusables.length - 1 : currentIndex - 1;
            } else {
                nextIndex = current === last || currentIndex < 0 ? 0 : currentIndex + 1;
            }
            focusables[nextIndex].focus();
        }

        showQuestion(qIndex) {
            const question = this.season.questions[qIndex];
            this.showDialog(
                question.title,
                question.text,
                question.options.map((label, optIndex) => ({
                    label,
                    onPick: () => this.answerQuestion(qIndex, optIndex)
                }))
            );
            this.currentQuestionIndex = qIndex;
        }

        answerQuestion(qIndex, optIndex) {
            const question = this.season.questions[qIndex];
            const buttons = this.dom.questionOptions.querySelectorAll('.option-btn');

            if (optIndex === question.correct) {
                this.dom.questionResult.textContent = 'Correto! ❤️';
                this.dom.questionResult.style.color = '#00ff88';
                buttons[optIndex].classList.add('correct');
                this.audioManager.playCorrectSound();

                this.gameState.questionsAnswered[qIndex] = true;
                const levelIndex = this.season.levels.findIndex((l) => l.questionId === question.id);
                if (levelIndex >= 0) this.unlockAfter(levelIndex);
                this.saveProgress();

                setTimeout(() => {
                    this.hideDialog();
                    this.exitLevel();
                }, 1800);
            } else {
                this.dom.questionResult.textContent = 'Tenta de novo!';
                this.dom.questionResult.style.color = '#ff6b6b';
                buttons[optIndex].classList.add('wrong');
                this.audioManager.playWrongSound();

                setTimeout(() => {
                    this.dom.questionResult.textContent = '';
                    buttons.forEach((btn) => btn.classList.remove('wrong'));
                }, 900);
            }
        }

        showFinale() {
            const finale = this.season.finale;
            this.showDialog(
                finale.title,
                finale.text,
                finale.options.map((label, optIndex) => ({
                    label,
                    onPick: () => this.answerFinale(optIndex)
                }))
            );
        }

        answerFinale(optIndex) {
            const finale = this.season.finale;
            const accepted = finale.acceptIndex === null || optIndex === finale.acceptIndex;

            if (!accepted) {
                this.dom.questionResult.textContent = finale.rejectText;
                this.dom.questionResult.style.color = '#ffa500';
                this.audioManager.playWrongSound();
                setTimeout(() => {
                    this.dom.questionResult.textContent = '';
                }, 1500);
                return;
            }

            this.dom.questionResult.textContent = finale.acceptedText;
            this.dom.questionResult.style.color = '#ff69b4';
            this.gameState.finalAccepted = true;
            this.saveProgress();
            this.audioManager.stopBackgroundMusic();
            this.audioManager.playCorrectSound();

            setTimeout(() => {
                this.hideDialog();
                this.startFireworks();
                this.audioManager.playFireworksSound();
                this.audioManager.playBackgroundMusic('finale');
                setTimeout(() => this.showEpilogue(), 2600);
            }, 1600);
        }

        showEpilogue() {
            const finale = this.season.finale;
            this.dom.finalTitle.textContent = finale.epilogueTitle;
            this.dom.finalText.innerHTML = finale.epilogueLines.join('<br>');
            this.dom.finalActions.innerHTML = '';

            if (finale.nextSeason) {
                const nextBtn = document.createElement('button');
                nextBtn.className = 'option-btn';
                nextBtn.textContent = finale.nextSeasonLabel;
                nextBtn.addEventListener('click', () => {
                    if (this.activeModal === this.dom.finalMessage) this.closeModal();
                    this.dom.finalMessage.style.display = 'none';
                    this.selectSeason(finale.nextSeason);
                });
                this.dom.finalActions.appendChild(nextBtn);
            }

            const menuBtn = document.createElement('button');
            menuBtn.className = 'option-btn secondary';
            menuBtn.textContent = '🏠 Voltar ao início';
            menuBtn.addEventListener('click', () => this.backToSeasonSelect());
            this.dom.finalActions.appendChild(menuBtn);

            this.dom.finalMessage.style.display = 'block';
            // Epílogo exige uma escolha (próxima temporada ou voltar ao início);
            // ESC não fecha sozinho.
            this.openModal(this.dom.finalMessage, { dismissible: false });
        }

        startFireworks() {
            const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040', '#FFD700'];
            for (let burst = 0; burst < 16; burst++) {
                setTimeout(() => {
                    for (let i = 0; i < 12; i++) {
                        const firework = document.createElement('div');
                        firework.className = 'firework';
                        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        firework.style.left = `${Math.random() * 100}%`;
                        firework.style.top = `${Math.random() * 100}%`;
                        this.dom.fireworks.appendChild(firework);
                        setTimeout(() => firework.remove(), 2000);
                    }
                }, burst * 220);
            }
        }

        // --------------------------------------------------------------------
        // RUNNER — fase de obstáculos "Caminho do Altar"
        // --------------------------------------------------------------------
        startRunner() {
            const config = this.season.runner;
            this.runner = {
                title: config.title,
                intro: config.intro,
                goal: config.goalDistance,
                distance: 0,
                speed: config.startSpeed,
                scrollX: 0,
                spawnTimer: 0,
                spawnEvery: config.spawnEveryMs,
                minSpawnEvery: config.minSpawnEveryMs,
                obstacles: [],
                items: [],
                lives: config.lives,
                maxLives: config.lives,
                score: 0,
                playerX: 110,
                playerY: 410,
                invulnerableMs: config.invulnerableMs,
                invulnerableUntil: 0,
                lastFrameAt: 0,
                finished: false
            };
            this.gameState.screen = 'runner';
            this.gameState.playerDirection = 'right';
            this.dom.ui.classList.add('runner-mode');
            this.updateLevelIndicator();
            this.audioManager.playBackgroundMusic(this.season.levels[this.gameState.currentLevel].music);
        }

        quitRunner() {
            this.runner = null;
            this.exitLevel();
        }

        // Acionado pelo botão de sair na tela (ou por toque). Confirma antes de
        // abandonar a corrida, para um toque sem querer não jogar fora o
        // progresso da tentativa atual. ESC continua saindo direto — é um gesto
        // deliberado que só existe em teclado físico.
        confirmQuitRunner() {
            if (this.gameState.screen !== 'runner' || this.gameState.interactionActive) return;

            this.showDialog(
                'Sair da corrida? 🚪',
                'Você volta ao mapa e pode tentar de novo quando quiser.',
                [
                    { label: 'Sim, sair 🗺️', onPick: () => { this.hideDialog(); this.quitRunner(); } },
                    { label: 'Continuar correndo 💪', onPick: () => this.hideDialog() }
                ]
            );
        }

        winRunner() {
            this.runner.finished = true;
            this.gameState.runnerDone = true;
            const levelIndex = this.season.levels.findIndex((l) => l.kind === 'runner');
            if (levelIndex >= 0) this.unlockAfter(levelIndex);
            this.saveProgress();
            this.audioManager.playRunnerWinSound();

            // Desfecho da corrida: exige uma escolha para prosseguir, ESC não fecha.
            this.showDialog('🎉 Caminho vencido! 🎉', 'A Michelle chegou ao altar inteira! O grande momento te espera...', [
                {
                    label: 'Continuar ❤️',
                    onPick: () => {
                        this.hideDialog();
                        this.runner = null;
                        this.exitLevel();
                    }
                }
            ], '', { dismissible: false });
        }

        failRunner() {
            this.audioManager.playHitSound();
            // Desfecho da corrida: exige uma escolha para prosseguir, ESC não fecha.
            this.showDialog('Ops! 🕊️💥', 'Os preparativos derrubaram a Michelle no meio do caminho!', [
                {
                    label: 'Tentar de novo 💪',
                    onPick: () => {
                        this.hideDialog();
                        this.startRunner();
                    }
                },
                {
                    label: 'Voltar ao mapa 🗺️',
                    onPick: () => {
                        this.hideDialog();
                        this.runner = null;
                        this.exitLevel();
                    }
                }
            ], '', { dismissible: false });
        }

        updateRunner(t, dt) {
            const run = this.runner;
            if (!run || run.finished || this.gameState.interactionActive) return;

            const progress = Math.min(run.distance / run.goal, 1);
            const config = this.season.runner;
            run.speed = config.startSpeed + (config.maxSpeed - config.startSpeed) * progress;
            run.spawnEvery = config.spawnEveryMs - (config.spawnEveryMs - config.minSpawnEveryMs) * progress;

            const step = run.speed * (dt / 16.7);
            run.scrollX += step;
            run.distance += run.speed * 0.055 * (dt / 16.7);

            // Movimento da jogadora
            const move = 4.4 * (dt / 16.7);
            if (this.keys['ArrowUp'] || this.keys['KeyW']) run.playerY -= move;
            if (this.keys['ArrowDown'] || this.keys['KeyS']) run.playerY += move;
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) run.playerX -= move;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) run.playerX += move;
            run.playerX = Math.max(60, Math.min(run.playerX, 330));
            run.playerY = Math.max(290, Math.min(run.playerY, 520));

            // Spawn de obstáculos e itens
            run.spawnTimer += dt;
            if (run.spawnTimer >= run.spawnEvery) {
                run.spawnTimer = 0;
                this.spawnRunnerObstacle(run);
                if (Math.random() < 0.42) this.spawnRunnerItem(run);
            }

            // Atualizar posições
            run.obstacles.forEach((obs) => { obs.x -= step * obs.speedFactor; });
            run.items.forEach((item) => { item.x -= step; });
            run.obstacles = run.obstacles.filter((obs) => obs.x > -60);
            run.items = run.items.filter((item) => item.x > -40 && !item.collected);

            // Colisões
            const px = run.playerX;
            const py = run.playerY;
            run.obstacles.forEach((obs) => {
                if (obs.hit || t < run.invulnerableUntil) return;
                const overlapX = Math.abs(obs.x - px) < (obs.w * 0.36 + 12);
                const overlapY = Math.abs(obs.y - py) < (obs.h * 0.36 + 20);
                if (overlapX && overlapY) {
                    obs.hit = true;
                    run.lives -= 1;
                    run.invulnerableUntil = t + run.invulnerableMs;
                    this.audioManager.playHitSound();
                    if (run.lives <= 0) {
                        run.finished = true;
                        this.failRunner();
                    }
                }
            });

            run.items.forEach((item) => {
                if (item.collected) return;
                const overlapX = Math.abs(item.x - px) < (item.w / 2 + 14);
                const overlapY = Math.abs(item.y - py) < (item.h / 2 + 24);
                if (overlapX && overlapY) {
                    item.collected = true;
                    run.score += item.type === 'ring' ? 50 : 10;
                    this.audioManager.playCollectSound();
                }
            });

            if (run.distance >= run.goal && !run.finished) {
                this.winRunner();
            }
        }

        spawnRunnerObstacle(run) {
            const roll = Math.random();
            let type;
            if (roll < 0.3) type = 'giftBox';
            else if (roll < 0.6) type = 'cakeObstacle';
            else if (roll < 0.8) type = 'pigeon';
            else type = 'bouquet';

            const sizes = { giftBox: 38, cakeObstacle: 44, pigeon: 44, bouquet: 32 };
            const size = sizes[type];
            let y;
            if (type === 'pigeon') y = 275 + Math.random() * 60;
            else y = 310 + Math.random() * 205;

            run.obstacles.push({
                type,
                x: 840,
                y,
                w: size,
                h: type === 'pigeon' ? 32 : size,
                speedFactor: type === 'bouquet' ? 1.55 : 1,
                hit: false
            });
        }

        spawnRunnerItem(run) {
            const type = Math.random() < 0.14 ? 'ring' : 'heart';
            run.items.push({
                type,
                x: 850,
                y: 300 + Math.random() * 210,
                w: 30,
                h: 28,
                collected: false
            });
        }

        // --------------------------------------------------------------------
        // Atualização por frame
        // --------------------------------------------------------------------
        updatePlayer() {
            if (!this.gameState.canMove || this.gameState.interactionActive) return;

            const state = this.gameState;
            let newX = state.playerX;
            let newY = state.playerY;
            let moved = false;

            if (this.keys['ArrowLeft'] || this.keys['KeyA']) { newX -= PLAYER_SPEED; state.playerDirection = 'left'; moved = true; }
            if (this.keys['ArrowRight'] || this.keys['KeyD']) { newX += PLAYER_SPEED; state.playerDirection = 'right'; moved = true; }
            if (this.keys['ArrowUp'] || this.keys['KeyW']) { newY -= PLAYER_SPEED; state.playerDirection = 'up'; moved = true; }
            if (this.keys['ArrowDown'] || this.keys['KeyS']) { newY += PLAYER_SPEED; state.playerDirection = 'down'; moved = true; }

            const bounds = state.screen === 'map'
                ? MAP_BOUNDS
                : (this.season.levels[state.currentLevel].bounds || DEFAULT_LEVEL_BOUNDS);
            if (bounds) {
                newX = Math.max(bounds.minX, Math.min(newX, bounds.maxX));
                newY = Math.max(bounds.minY, Math.min(newY, bounds.maxY));
            }

            if (moved) {
                state.playerX = newX;
                state.playerY = newY;
                if (!state.isMoving) this.audioManager.playMoveSound();
                state.isMoving = true;
            } else {
                state.isMoving = false;
            }

            // Na fase, atravessar a porta sai direto
            if (state.screen === 'level' && this.isAtExitDoor()) {
                this.exitLevel();
                return;
            }

            this.updateHint();
        }

        updateHint() {
            const state = this.gameState;
            let show = false;

            if (state.screen === 'map') {
                show = this.nearestMapLocation() >= 0;
            } else if (state.screen === 'level') {
                const level = this.season.levels[state.currentLevel];
                if (level.kind === 'question') {
                    const resolved = this.resolveLevelQuestion(level);
                    show = Boolean(resolved) && !this.gameState.questionsAnswered[resolved.index] && this.isNearInteractPoint(level);
                } else if (level.kind === 'final') {
                    show = !this.gameState.finalAccepted && this.isNearInteractPoint(level);
                }
            }

            this.dom.interactionHint.style.display = show ? 'block' : 'none';
        }

        updateLevelIndicator() {
            const screen = this.gameState.screen;
            if (screen === 'start') this.dom.levelIndicator.textContent = '';
            else if (screen === 'season') this.dom.levelIndicator.textContent = 'Escolha a temporada 💕';
            else if (screen === 'map') this.dom.levelIndicator.textContent = this.season.mapName;
            else if (screen === 'runner') this.dom.levelIndicator.textContent = `${this.runner.title} 🏃‍♀️`;
            else this.dom.levelIndicator.textContent = this.season.levels[this.gameState.currentLevel].name;
        }

        // --------------------------------------------------------------------
        // Loop principal
        // --------------------------------------------------------------------
        gameLoop() {
            const t = Date.now();
            const dt = this.lastFrameTime ? Math.min(t - this.lastFrameTime, 50) : 16.7;
            this.lastFrameTime = t;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.isLoading) {
                if (this.loadingScreen.update()) {
                    this.isLoading = false;
                    this.dom.ui.style.display = 'block';
                    this.updateLevelIndicator();
                }
                this.loadingScreen.draw();
            } else {
                const state = this.gameState;
                const renderer = this.sceneRenderer;

                if (state.screen === 'start') {
                    renderer.drawStartScreen(t);
                } else if (state.screen === 'season') {
                    renderer.drawSeasonBackdrop(t);
                } else if (state.screen === 'map') {
                    this.updatePlayer();
                    renderer.drawMap(
                        this.season.theme,
                        this.season.mapLocations,
                        state.playerX, state.playerY,
                        state.playerDirection, state.isMoving, t
                    );
                } else if (state.screen === 'level') {
                    this.updatePlayer();
                    // updatePlayer pode ter saído da fase (porta de saída)
                    if (state.screen === 'level') this.drawCurrentLevel(t);
                } else if (state.screen === 'runner') {
                    this.updateRunner(t, dt);
                    if (this.runner) renderer.drawRunner(this.runner, t);
                }
            }

            requestAnimationFrame(() => this.gameLoop());
        }

        drawCurrentLevel(t) {
            const renderer = this.sceneRenderer;
            const index = this.gameState.currentLevel;
            const level = this.season.levels[index];
            const interact = { x: level.interactX, y: level.interactY };

            const drawScene = SceneRenderer.SCENES[level.scene];
            if (drawScene) {
                drawScene(renderer, t, interact);
            } else {
                this.warnMissingScene(level);
            }

            renderer.drawExitDoor();

            // Marcador de interação quando ainda há objetivo pendente
            if (!this.isLevelComplete(index) && level.kind !== 'runner') {
                renderer.drawMarker(level.interactX, level.interactY, t, level.kind === 'final' ? '💍' : '!');
            }

            renderer.drawPlayer(
                this.gameState.playerX,
                this.gameState.playerY,
                this.gameState.playerDirection,
                this.gameState.isMoving,
                t
            );
        }
    }

    window.GameManager = GameManager;
})(window, document);
