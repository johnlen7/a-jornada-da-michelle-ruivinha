// Sistema de áudio usando Web Audio API e arquivos MP3
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.musicInterval = null;
        this.soundEnabled = true;
        this.currentAudio = null;
        this.musicFiles = {
            hogwarts: new Audio('./assets/audio/hogwarts.mp3'),
            centralperk: new Audio('./assets/audio/centralperk.mp3')
        };
        this.audioInitialized = false;
        this.initAudioContext();
        this.setupMusicFiles();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API não suportado');
        }
    }
    
    setupMusicFiles() {
        // Configurar arquivos de música
        Object.values(this.musicFiles).forEach(audio => {
            audio.loop = true;
            audio.volume = 0.4; // Volume um pouco mais alto
            audio.preload = 'auto';
            
            // Remover crossOrigin para arquivos locais
            // audio.crossOrigin = 'anonymous';
        });
        
        // Event listeners para debug
        this.musicFiles.hogwarts.addEventListener('canplaythrough', () => {
            console.log('✅ Hogwarts MP3 ready to play');
        });
        this.musicFiles.centralperk.addEventListener('canplaythrough', () => {
            console.log('✅ Central Perk MP3 ready to play');
        });
        
        this.musicFiles.hogwarts.addEventListener('loadstart', () => {
            console.log('🔄 Iniciando carregamento Hogwarts MP3');
        });
        this.musicFiles.centralperk.addEventListener('loadstart', () => {
            console.log('🔄 Iniciando carregamento Central Perk MP3');
        });
        
        // Listeners de load success
        this.musicFiles.hogwarts.addEventListener('loadeddata', () => {
            console.log('📱 Dados do Hogwarts MP3 carregados');
        });
        this.musicFiles.centralperk.addEventListener('loadeddata', () => {
            console.log('📱 Dados do Central Perk MP3 carregados');
        });
        
        // Lidar com erros
        this.musicFiles.hogwarts.addEventListener('error', (e) => {
            console.log('❌ Erro ao carregar Hogwarts MP3:', e);
            console.log('❌ Arquivo não encontrado ou inacessível: assets/audio/hogwarts.mp3');
        });
        this.musicFiles.centralperk.addEventListener('error', (e) => {
            console.log('❌ Erro ao carregar Central Perk MP3:', e);
            console.log('❌ Arquivo não encontrado ou inacessível: assets/audio/centralperk.mp3');
        });
        
        // Testar se arquivos existem
        console.log('🎵 Testando arquivos MP3:');
        console.log('📁 Hogwarts:', this.musicFiles.hogwarts.src);
        console.log('📁 Central Perk:', this.musicFiles.centralperk.src);
        
        // Tentar carregar imediatamente
        setTimeout(() => {
            this.musicFiles.hogwarts.load();
            this.musicFiles.centralperk.load();
        }, 100);
    }

    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext || !this.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playMoveSound() {
        if (this.soundEnabled) this.createTone(200, 0.1, 'square');
    }

    playInteractSound() {
        if (this.soundEnabled) this.createTone(400, 0.2, 'sine');
    }

    playCorrectSound() {
        if (!this.soundEnabled) return;
        this.createTone(523, 0.3, 'sine'); // C5
        setTimeout(() => this.createTone(659, 0.3, 'sine'), 100); // E5
        setTimeout(() => this.createTone(784, 0.4, 'sine'), 200); // G5
    }

    playWrongSound() {
        if (this.soundEnabled) this.createTone(200, 0.5, 'sawtooth');
    }

    playFireworksSound() {
        if (!this.soundEnabled) return;
        for(let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createTone(800 + Math.random() * 400, 0.3, 'square');
            }, i * 200);
        }
    }

    stopBackgroundMusic() {
        // Parar música sintética
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        
        // Parar música MP3
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }    playBackgroundMusic(currentScreen, currentLevel) {
        if (!this.soundEnabled) {
            console.log('🔇 Som desabilitado, não tocando música');
            return;
        }
        
        console.log(`🎵 Tentando tocar música para screen: ${currentScreen}, level: ${currentLevel}`);
        
        // Parar música anterior sempre
        this.stopBackgroundMusic();
        
        let melody, tempo, audioFile;
        
        // Selecionar melodia baseada no local atual
        if (currentScreen === 'level') {
            switch(currentLevel) {
                case 0: // Hogwarts - Usar arquivo MP3
                    console.log('🏰 LEVEL 0 - Selecionando música de Hogwarts');
                    audioFile = this.musicFiles.hogwarts;
                    console.log('🎶 Arquivo selecionado:', audioFile ? audioFile.src : 'UNDEFINED');
                    
                    // Forçar reprodução imediata sem aguardar carregamento completo
                    if (audioFile) {
                        this.forcePlayMP3(audioFile, 'Hogwarts');
                        return; // Sair da função, não usar fallback
                    }
                    break;
                case 1: // Central Perk - Usar arquivo MP3
                    console.log('☕ LEVEL 1 - Selecionando música de Central Perk');
                    audioFile = this.musicFiles.centralperk;
                    console.log('🎶 Arquivo selecionado:', audioFile ? audioFile.src : 'UNDEFINED');
                    
                    // Forçar reprodução imediata sem aguardar carregamento completo
                    if (audioFile) {
                        this.forcePlayMP3(audioFile, 'Central Perk');
                        return; // Sair da função, não usar fallback
                    }
                    break;
                case 2: // Caminho para o Forte - Tema aventura épica (sintético)
                    console.log('⚔️ LEVEL 2 - Tocando música do Forte');
                    melody = [440, 523, 659, 784, 698, 659, 523, 587, 659, 440];
                    tempo = 600;
                    break;
                case 3: // Forte - Tema romântico e épico (sintético)
                    console.log('🏰 LEVEL 3 - Tocando música do Forte Final');
                    melody = [523, 659, 784, 880, 1047, 880, 784, 659, 698, 523];
                    tempo = 1000;
                    break;
                default:
                    console.log(`🎵 LEVEL ${currentLevel} - Tocando música padrão`);
                    melody = [523, 587, 659, 698, 784, 698, 659, 587];
                    tempo = 600;
            }
        } else {
            // Música do mapa principal - tema de vila mágica (sintético)
            console.log(`🗺️ SCREEN ${currentScreen} - Tocando música do mapa principal`);
            melody = [523, 587, 659, 698, 784, 698, 659, 587, 523, 659];
            tempo = 700;
        }            // Tocar música sintética se não há arquivo ou se é outro nível
        if (melody && tempo) {
            this.playSyntheticMusic(melody, tempo, currentScreen);
        }
    }

    forcePlayMP3(audioFile, musicName) {
        console.log(`🚀 FORÇA REPRODUÇÃO: ${musicName} - ${audioFile.src}`);
        
        this.currentAudio = audioFile;
        audioFile.currentTime = 0;
        audioFile.volume = 0.5;
        audioFile.muted = false;
        audioFile.loop = true;
        
        // Múltiplas tentativas de reprodução
        const attemptPlay = (attempt = 1) => {
            console.log(`🎯 Tentativa ${attempt} de reproduzir ${musicName}`);
            
            const playPromise = audioFile.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`✅ ${musicName} TOCANDO COM SUCESSO na tentativa ${attempt}!`);
                    })
                    .catch(error => {
                        console.log(`❌ Tentativa ${attempt} falhou:`, error.name, error.message);
                        
                        if (attempt < 3) {
                            // Aguardar um pouco e tentar novamente
                            setTimeout(() => attemptPlay(attempt + 1), 500);
                        } else {
                            console.log(`💥 Todas as tentativas falharam para ${musicName}, usando fallback`);
                            this.playFallbackMusicForLevel(musicName);
                        }
                    });
            } else {
                console.log(`❌ Play() não retornou Promise para ${musicName}`);
                if (attempt < 3) {
                    setTimeout(() => attemptPlay(attempt + 1), 300);
                } else {
                    this.playFallbackMusicForLevel(musicName);
                }
            }
        };
        
        // Iniciar primeira tentativa
        attemptPlay();
    }

    playFallbackMusicForLevel(musicName) {
        console.log(`🔄 Reproduzindo fallback sintético para ${musicName}`);
        
        let melody, tempo;
        
        if (musicName === 'Hogwarts') {
            melody = [523, 659, 784, 659, 698, 784, 880, 784, 659, 523];
            tempo = 900;
        } else if (musicName === 'Central Perk') {
            melody = [523, 587, 659, 698, 659, 587, 523, 659, 698, 784];
            tempo = 500;
        } else {
            return;
        }
        
        this.playSyntheticMusic(melody, tempo, 'level');
    }tryPlayAudio(audioFile, currentLevel) {
        console.log(`🎶 Tentando tocar: ${audioFile.src}`);
        
        // Forçar configurações
        audioFile.volume = 0.5;
        audioFile.muted = false;
        audioFile.currentTime = 0;
        
        const playPromise = audioFile.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(`✅ Música ${audioFile.src} iniciada com sucesso!`);
                })
                .catch(e => {
                    console.log('❌ Erro ao tocar música:', e.name, e.message);
                    
                    if (e.name === 'NotAllowedError') {
                        console.log('🚫 Autoplay bloqueado. Tentando método alternativo...');
                        
                        // Método alternativo: aguardar próxima interação
                        const tryAgainOnInteraction = () => {
                            document.addEventListener('click', () => {
                                console.log('🖱️ Click detectado, tentando tocar novamente...');
                                const retryPromise = audioFile.play();
                                if (retryPromise) {
                                    retryPromise.then(() => {
                                        console.log(`✅ Música ${audioFile.src} tocando após click!`);
                                    }).catch(() => {
                                        console.log('❌ Ainda não consegue tocar, usando fallback');
                                        this.playFallbackMusic(currentLevel);
                                    });
                                }
                            }, { once: true });
                        };
                        
                        tryAgainOnInteraction();
                        
                    } else if (e.name === 'NotSupportedError') {
                        console.log('🚫 Formato de áudio não suportado.');
                        this.playFallbackMusic(currentLevel);
                    } else {
                        console.log('🔄 Tentando fallback para música sintética');
                        this.playFallbackMusic(currentLevel);
                    }
                });
        } else {
            console.log('❌ Play() não retornou uma Promise');
            this.playFallbackMusic(currentLevel);
        }
    }

    playFallbackMusic(currentLevel) {
        let melody, tempo;
        
        switch(currentLevel) {
            case 0: // Hogwarts fallback
                melody = [523, 659, 784, 659, 698, 784, 880, 784, 659, 523];
                tempo = 900;
                break;
            case 1: // Central Perk fallback
                melody = [523, 587, 659, 698, 659, 587, 523, 659, 698, 784];
                tempo = 500;
                break;
            default:
                return;
        }
        
        this.playSyntheticMusic(melody, tempo, 'level');
    }

    playSyntheticMusic(melody, tempo, currentScreen) {
        if (!this.audioContext) return;
        
        let noteIndex = 0;
        
        const playNextNote = () => {
            if (this.soundEnabled && currentScreen !== 'start') {
                this.createTone(melody[noteIndex], 0.5, 'triangle');
                noteIndex = (noteIndex + 1) % melody.length;
            }
        };
        
        // Tocar primeira nota imediatamente
        playNextNote();
        
        // Configurar intervalo para próximas notas
        this.musicInterval = setInterval(playNextNote, tempo);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled) {
            this.stopBackgroundMusic();
        }
        return this.soundEnabled;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopBackgroundMusic();
        } else {
            // Ajustar volume dos arquivos MP3
            Object.values(this.musicFiles).forEach(audio => {
                audio.volume = 0.3;
            });
        }    }
      resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }    // Método para inicializar áudio após primeira interação
    async initAudioAfterUserGesture() {
        try {
            console.log('🎯 Inicializando sistema de áudio após gesto do usuário...');
            
            // Reactivar contexto de áudio
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('🔊 Contexto de áudio reativado');
            }
            
            // Método mais agressivo de desbloqueio
            const forceUnlockAudio = async (audio, name) => {
                return new Promise((resolve) => {
                    // Resetar completamente o áudio
                    audio.load();
                    audio.volume = 0.01; // Volume muito baixo
                    audio.currentTime = 0;
                    audio.muted = false;
                    
                    const unlockAttempt = audio.play();
                    if (unlockAttempt) {
                        unlockAttempt.then(() => {
                            console.log(`🔓 ${name} - Primeiro play bem-sucedido (silencioso)`);
                            
                            // Parar imediatamente e resetar
                            setTimeout(() => {
                                audio.pause();
                                audio.currentTime = 0;
                                audio.volume = 0.5; // Volume normal
                                console.log(`✅ ${name} - Áudio desbloqueado e pronto!`);
                                resolve();
                            }, 100);
                        }).catch((error) => {
                            console.log(`⚠️ ${name} - Erro no desbloqueio:`, error.message);
                            resolve(); // Continuar mesmo com erro
                        });
                    } else {
                        console.log(`⚠️ ${name} - Play não retornou Promise`);
                        resolve();
                    }
                });
            };
            
            // Tentar desbloquear ambos os arquivos
            await Promise.all([
                forceUnlockAudio(this.musicFiles.hogwarts, 'Hogwarts'),
                forceUnlockAudio(this.musicFiles.centralperk, 'Central Perk')
            ]);
            
            this.audioInitialized = true;
            console.log('🎵 Sistema de áudio completamente inicializado e desbloqueado!');
            
        } catch (error) {
            console.log('❌ Erro ao inicializar áudio:', error);
        }
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else {
    window.AudioManager = AudioManager;
}
