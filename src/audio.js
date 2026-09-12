// Sistema de áudio centralizado, com MP3 quando disponível e fallback sintético.
//
// Cada faixa em arquivo (hogwarts, centralperk) nasce com preload="none": nada é
// baixado até a cena que a usa começar. Ao entrar na cena, a melodia sintética
// equivalente começa a tocar na hora, e o arquivo é buscado em paralelo — se
// chegar a tempo, assume o lugar da síntese; se falhar ou demorar, a síntese
// continua e ninguém percebe a diferença.
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.musicInterval = null;
        this.soundEnabled = true;
        this.currentAudio = null;
        this.currentMusicKey = null;
        this.audioInitialized = false;
        this.masterVolume = 0.45;
        this.musicVolume = 0.4;
        this.effectsVolume = 0.12;

        const audioAssets = window.GameData && window.GameData.assets ? window.GameData.assets.audio : {};
        // Uma única instância por faixa em todo o jogo — nada mais cria Audio() em paralelo.
        this.musicFiles = {
            hogwarts: this.createAudio(audioAssets && audioAssets.hogwarts ? audioAssets.hogwarts : './assets/audio/hogwarts.mp3'),
            centralperk: this.createAudio(audioAssets && audioAssets.centralPerk ? audioAssets.centralPerk : './assets/audio/centralperk.mp3')
        };

        this.restoreSoundPreference();
        this.initAudioContext();
        this.setupVisibilityHandling();
    }

    createAudio(src) {
        const audio = new Audio(src);
        audio.loop = true;
        // Nada é buscado até alguém chamar .play() nele — carregamento sob demanda.
        audio.preload = 'none';
        audio.volume = this.musicVolume;
        return audio;
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
            console.warn('Web Audio API não suportado neste navegador.');
        }
    }

    // Pausa tudo quando a aba fica oculta e retoma a cena atual ao voltar,
    // respeitando a preferência de som. Evita que a trilha sintética continue
    // sendo agendada (setInterval) e que o MP3 continue tocando fora de vista.
    setupVisibilityHandling() {
        if (typeof document === 'undefined') return;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseForBackground();
            } else {
                this.resumeFromBackground();
            }
        });
    }

    pauseForBackground() {
        this.wasPlayingKey = this.currentMusicKey;
        this.stopBackgroundMusic();
    }

    resumeFromBackground() {
        const key = this.wasPlayingKey;
        this.wasPlayingKey = null;
        if (key && this.soundEnabled) {
            this.resumeContext();
            this.playBackgroundMusic(key);
        }
    }

    restoreSoundPreference() {
        try {
            const saved = window.localStorage.getItem('michelleGame.soundEnabled');
            if (saved !== null) this.soundEnabled = saved === 'true';
        } catch {
            // localStorage pode estar indisponível em modo privado; seguir com padrão.
        }
    }

    persistSoundPreference() {
        try {
            window.localStorage.setItem('michelleGame.soundEnabled', String(this.soundEnabled));
        } catch {
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

    // Para só a melodia sintética (o setInterval de notas), sem tocar no arquivo.
    stopSyntheticMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    // Para só o arquivo em reprodução, sem tocar na melodia sintética.
    stopFileTrack() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    stopBackgroundMusic() {
        this.stopSyntheticMusic();
        this.stopFileTrack();
    }

    // Tenta tocar o arquivo em paralelo à síntese já em andamento. Se conseguir,
    // assume o lugar dela; se falhar (rede, bloqueio, arquivo ausente), a síntese
    // que já está tocando segue como está — o jogador nunca ouve silêncio.
    async tryPlayFileTrack(key) {
        const audio = this.musicFiles[key];
        if (!audio || !this.soundEnabled) return;

        try {
            audio.currentTime = 0;
            audio.volume = this.musicVolume * this.masterVolume;
            audio.loop = true;
            await audio.play();

            // A cena pode ter mudado enquanto o arquivo carregava — não assume
            // o lugar de uma melodia que já não é a que deveria estar tocando.
            if (this.currentMusicKey !== key || !this.soundEnabled) {
                audio.pause();
                return;
            }

            this.stopSyntheticMusic();
            this.currentAudio = audio;
        } catch {
            // Fica com a melodia sintética, sem barulho de erro para o jogador.
        }
    }

    // Toca a música de uma cena pela sua chave ('s1-map', 'hogwarts', etc).
    // Chaves com arquivo correspondente em `musicFiles` tocam a síntese na hora
    // e trocam pelo arquivo assim que (e se) ele estiver pronto.
    playBackgroundMusic(key) {
        if (!this.soundEnabled) return;

        this.stopBackgroundMusic();
        this.currentMusicKey = key;

        const melody = MELODIES[key] || MELODIES['s1-map'];
        const tempo = TEMPOS[key] || 700;
        this.playSyntheticMusic(melody, tempo);

        if (this.musicFiles[key]) {
            this.tryPlayFileTrack(key);
        }
    }

    // Efeitos da fase de obstáculos
    playCollectSound() {
        this.createTone(880, 0.1, 'sine', 0.07);
        setTimeout(() => this.createTone(1319, 0.12, 'sine', 0.06), 60);
    }

    playHitSound() {
        this.createTone(140, 0.3, 'sawtooth', 0.1);
        setTimeout(() => this.createTone(98, 0.25, 'sawtooth', 0.08), 90);
    }

    playRunnerWinSound() {
        if (!this.soundEnabled) return;
        [523, 659, 784, 1047].forEach((note, i) => {
            setTimeout(() => this.createTone(note, 0.25, 'triangle', 0.09), i * 120);
        });
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

// Melodias sintéticas por cena, incluindo o par que serve de fallback para as
// duas faixas em arquivo (hogwarts, centralperk).
const MELODIES = {
    hogwarts: [523, 659, 784, 659, 698, 784, 880, 784, 659, 523],
    centralperk: [523, 587, 659, 698, 659, 587, 523, 659, 698, 784],
    's1-map': [523, 587, 659, 698, 784, 698, 659, 587, 523, 659],
    's1-path': [440, 523, 659, 784, 698, 659, 523, 587, 659, 440],
    's1-fort': [523, 659, 784, 880, 1047, 880, 784, 659, 698, 523],
    's2-map': [659, 784, 880, 784, 698, 659, 587, 659, 698, 784],
    's2-hall': [523, 659, 784, 659, 880, 784, 698, 784, 659, 587],
    's2-atelier': [587, 698, 880, 698, 784, 698, 659, 587, 523, 587],
    's2-runner': [440, 440, 523, 587, 659, 587, 523, 440, 494, 587],
    's2-altar': [523, 523, 659, 523, 698, 659, 523, 587, 659, 784],
    finale: [523, 659, 784, 1047, 880, 784, 880, 1047, 1319, 1047]
};

const TEMPOS = {
    hogwarts: 900, centralperk: 520,
    's1-map': 720, 's1-path': 620, 's1-fort': 980,
    's2-map': 700, 's2-hall': 640, 's2-atelier': 820,
    's2-runner': 320, 's2-altar': 900, finale: 760
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else {
    window.AudioManager = AudioManager;
}
