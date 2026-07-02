// Sistema de Loading Screen com progresso real dos assets principais.
class LoadingScreen {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.loadingProgress = 0;
        this.loadingText = 'Carregando...';
        this.startTime = Date.now();
        this.minimumDuration = 700;
        this.assetsStarted = false;
        this.assetsLoaded = 0;
        this.assetsTotal = 0;
        this.assetErrors = [];
        this.michelleSprite = new Image();
        this.spriteLoaded = false;

        const imageAssets = window.GameData && window.GameData.assets ? window.GameData.assets.images : {};
        this.michelleSprite.src = imageAssets && imageAssets.michelle ? imageAssets.michelle : 'assets/images/michelle_sprite.png';
        this.michelleSprite.onload = () => { this.spriteLoaded = true; };
        this.michelleSprite.onerror = () => {
            console.warn('Erro ao carregar sprite da Michelle para loading');
        };

        this.preloadAssets();
    }

    preloadAssets() {
        if (this.assetsStarted) return;
        this.assetsStarted = true;

        const data = window.GameData || {};
        const images = data.assets && data.assets.images ? Object.values(data.assets.images) : [];
        const audio = data.assets && data.assets.audio ? Object.values(data.assets.audio) : [];
        const uniqueAssets = [...new Set([...images, ...audio].filter(Boolean))];

        this.assetsTotal = uniqueAssets.length;
        if (this.assetsTotal === 0) {
            this.loadingProgress = 1;
            return;
        }

        uniqueAssets.forEach((src) => {
            let settled = false;
            const done = (error) => {
                if (settled) return;
                settled = true;
                if (error) this.assetErrors.push(src);
                this.assetsLoaded += 1;
            };

            if (/\.(png|jpe?g|gif|webp|svg)$/i.test(src)) {
                const image = new Image();
                image.onload = () => done(false);
                image.onerror = () => done(true);
                image.src = src;
            } else if (/\.(mp3|ogg|wav|m4a)$/i.test(src)) {
                const audioElement = new Audio();
                audioElement.preload = 'auto';
                audioElement.oncanplaythrough = () => done(false);
                audioElement.onerror = () => done(true);
                audioElement.src = src;
                audioElement.load();

                // Áudio pode demorar/ser bloqueado em alguns navegadores. Não travar o jogo por isso.
                setTimeout(() => {
                    if (audioElement.readyState < 2) done(true);
                }, 2500);
            } else {
                done(false);
            }
        });
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        const assetProgress = this.assetsTotal === 0 ? 1 : Math.min(this.assetsLoaded / this.assetsTotal, 1);
        const timeProgress = Math.min(elapsed / this.minimumDuration, 1);
        this.loadingProgress = Math.min(assetProgress, timeProgress);

        if (this.loadingProgress < 0.3) {
            this.loadingText = 'Carregando recursos...';
        } else if (this.loadingProgress < 0.6) {
            this.loadingText = 'Preparando aventura...';
        } else if (this.loadingProgress < 0.95) {
            this.loadingText = 'Quase pronto...';
        } else {
            this.loadingText = this.assetErrors.length ? 'Pronto com alguns fallbacks!' : 'Pronto!';
        }

        return assetProgress >= 1 && timeProgress >= 1;
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0d4d');
        gradient.addColorStop(0.5, '#2d1810');
        gradient.addColorStop(1, '#4a3426');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 30; i++) {
            const x = (i * 127) % canvas.width;
            const y = (i * 97) % canvas.height;
            const twinkle = Math.sin(Date.now() * 0.005 + i) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Pixelify Sans, Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeText('A Jornada de Michelle', canvas.width / 2, 120);
        ctx.fillText('A Jornada de Michelle', canvas.width / 2, 120);

        const michelleX = canvas.width / 2;
        const michelleY = canvas.height / 2 - 50;
        const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20 * glowIntensity;

        if (this.spriteLoaded) {
            const spriteSize = 80 + Math.sin(Date.now() * 0.003) * 10;
            ctx.drawImage(this.michelleSprite, michelleX - spriteSize / 2, michelleY - spriteSize / 2, spriteSize, spriteSize);
        } else {
            ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity})`;
            ctx.beginPath();
            ctx.arc(michelleX, michelleY, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;

        const barWidth = 300;
        const barHeight = 20;
        const barX = (canvas.width - barWidth) / 2;
        const barY = canvas.height - 150;

        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        const progressWidth = barWidth * this.loadingProgress;
        const progressGradient = ctx.createLinearGradient(barX, barY, barX + Math.max(progressWidth, 1), barY);
        progressGradient.addColorStop(0, '#FFD700');
        progressGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(barX, barY, progressWidth, barHeight);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Pixelify Sans, Arial';
        ctx.fillText(this.loadingText, canvas.width / 2, barY - 20);

        ctx.font = '14px Pixelify Sans, Arial';
        ctx.fillText(`${Math.round(this.loadingProgress * 100)}%`, canvas.width / 2, barY + 45);

        ctx.fillStyle = '#FF1493';
        ctx.font = '30px Arial';
        const heartBounce = Math.sin(Date.now() * 0.008) * 3;
        ctx.fillText('💖', canvas.width / 2 - 100, michelleY + heartBounce);
        ctx.fillText('💖', canvas.width / 2 + 100, michelleY - heartBounce);

        if (this.loadingProgress > 0.5) {
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.font = '16px Pixelify Sans, Arial';
            ctx.fillText('Prepare-se para a aventura do amor! ❤️', canvas.width / 2, canvas.height - 50);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingScreen;
} else {
    window.LoadingScreen = LoadingScreen;
}
