// Sistema de áudio centralizado, com MP3 quando disponível e fallback sintético.
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.musicInterval = null;
        this.soundEnabled = true;
        this.currentAudio = null;
        this.audioInitialized = false;
        this.masterVolume = 0.45;
        this.musicVolume = 0.4;
        this.effectsVolume = 0.12;

        const audioAssets = window.GameData && window.GameData.assets ? window.GameData.assets.audio : {};
        this.musicFiles = {
            hogwarts: this.createAudio(audioAssets && audioAssets.hogwarts ? audioAssets.hogwarts : './assets/audio/hogwarts.mp3'),
            centralperk: this.createAudio(audioAssets && audioAssets.centralPerk ? audioAssets.centralPerk : './assets/audio/centralperk.mp3')
        };

        this.restoreSoundPreference();
        this.initAudioContext();
    }

    createAudio(src) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = this.musicVolume;
        return audio;
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API não suportado neste navegador.');
        }
    }

    restoreSoundPreference() {
        try {
            const saved = window.localStorage.getItem('michelleGame.soundEnabled');
            if (saved !== null) this.soundEnabled = saved === 'true';
        } catch (error) {
            // localStorage pode estar indisponível em modo privado; seguir com padrão.
        }
    }

    persistSoundPreference() {
        try {
            window.localStorage.setItem('michelleGame.soundEnabled', String(this.soundEnabled));
        } catch (error) {
            // Preferência de som não é crítica.
        }
    }

    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
        return Promise.resolve();
    }

    async initAudioAfterUserGesture() {
        await this.resumeContext();
        this.audioInitialized = true;
    }

    createTone(frequency, duration, type = 'sine', volume = this.effectsVolume) {
        if (!this.audioContext || !this.soundEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        const safeVolume = Math.max(0.001, volume * this.masterVolume);
        gainNode.gain.setValueAtTime(safeVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playMoveSound() {
        this.createTone(180, 0.06, 'square', 0.04);
    }

    playInteractSound() {
        this.createTone(420, 0.16, 'sine', 0.08);
    }

    playCorrectSound() {
        if (!this.soundEnabled) return;
        this.createTone(523, 0.22, 'sine', 0.1);
        setTimeout(() => this.createTone(659, 0.22, 'sine', 0.1), 90);
        setTimeout(() => this.createTone(784, 0.30, 'sine', 0.1), 180);
    }

    playWrongSound() {
        this.createTone(180, 0.35, 'sawtooth', 0.09);
    }

    playFireworksSound() {
        if (!this.soundEnabled) return;
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                this.createTone(760 + Math.random() * 420, 0.22, 'square', 0.08);
            }, i * 160);
        }
    }

    stopBackgroundMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    async playAudioFile(audio) {
        if (!audio || !this.soundEnabled) return false;

        try {
            this.currentAudio = audio;
            audio.currentTime = 0;
            audio.volume = this.musicVolume * this.masterVolume;
            audio.loop = true;
            await audio.play();
            return true;
        } catch (error) {
            return false;
        }
    }

    playBackgroundMusic(currentScreen, currentLevel) {
        if (!this.soundEnabled) return;

        this.stopBackgroundMusic();

        if (currentScreen === 'level') {
            if (currentLevel === 0) {
                this.playAudioFile(this.musicFiles.hogwarts).then((played) => {
                    if (!played) this.playSyntheticMusic([523, 659, 784, 659, 698, 784, 880, 784, 659, 523], 900);
                });
                return;
            }

            if (currentLevel === 1) {
                this.playAudioFile(this.musicFiles.centralperk).then((played) => {
                    if (!played) this.playSyntheticMusic([523, 587, 659, 698, 659, 587, 523, 659, 698, 784], 520);
                });
                return;
            }

            if (currentLevel === 2) {
                this.playSyntheticMusic([440, 523, 659, 784, 698, 659, 523, 587, 659, 440], 620);
                return;
            }

            if (currentLevel === 3) {
                this.playSyntheticMusic([523, 659, 784, 880, 1047, 880, 784, 659, 698, 523], 980);
                return;
            }
        }

        this.playSyntheticMusic([523, 587, 659, 698, 784, 698, 659, 587, 523, 659], 720);
    }

    playSyntheticMusic(melody, tempo) {
        if (!this.audioContext || !this.soundEnabled || !Array.isArray(melody) || melody.length === 0) return;

        let noteIndex = 0;
        const playNextNote = () => {
            if (!this.soundEnabled) return;
            this.createTone(melody[noteIndex], 0.42, 'triangle', 0.045);
            noteIndex = (noteIndex + 1) % melody.length;
        };

        playNextNote();
        this.musicInterval = setInterval(playNextNote, tempo);
    }

    toggleSound() {
        this.setSoundEnabled(!this.soundEnabled);
        return this.soundEnabled;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = Boolean(enabled);
        this.persistSoundPreference();

        if (!this.soundEnabled) {
            this.stopBackgroundMusic();
        } else {
            Object.values(this.musicFiles).forEach((audio) => {
                audio.volume = this.musicVolume * this.masterVolume;
            });
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else {
    window.AudioManager = AudioManager;
}
