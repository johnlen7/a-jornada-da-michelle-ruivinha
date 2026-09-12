// Sistema de Loading Screen.
// Os gráficos são gerados em código (pixel-art), então não há imagens pesadas
// para pré-carregar, e as trilhas em arquivo são buscadas sob demanda pelo
// AudioManager quando a cena que as usa começa — não aqui. O progresso desta
// tela reflete só o tempo mínimo de apresentação, nunca download de mídia.
class LoadingScreen {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.loadingProgress = 0;
        this.loadingText = 'Carregando...';
        this.startTime = Date.now();
        this.minimumDuration = 900;
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        this.loadingProgress = Math.min(elapsed / this.minimumDuration, 1);

        if (this.loadingProgress < 0.3) {
            this.loadingText = 'Carregando recursos...';
        } else if (this.loadingProgress < 0.6) {
            this.loadingText = 'Preparando aventura...';
        } else if (this.loadingProgress < 0.95) {
            this.loadingText = 'Quase pronto...';
        } else {
            this.loadingText = 'Pronto!';
        }

        return this.loadingProgress >= 1;
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const now = Date.now();

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#241447');
        gradient.addColorStop(0.5, '#3B1D5A');
        gradient.addColorStop(1, '#5D2A52');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Estrelas cintilando (posições fixas, sem flicker)
        for (let i = 0; i < 40; i++) {
            const x = (i * 173) % canvas.width;
            const y = (i * 97) % canvas.height;
            const twinkle = Math.sin(now * 0.004 + i * 1.7) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + twinkle * 0.6})`;
            ctx.fillRect(x, y, 2, 2);
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px "Pixelify Sans", Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#5D2A52';
        ctx.lineWidth = 3;
        ctx.strokeText('A Jornada de Michelle', canvas.width / 2, 120);
        ctx.fillText('A Jornada de Michelle', canvas.width / 2, 120);

        // Coração pixel-art pulsando no centro
        const heart = window.PixelSprites ? window.PixelSprites.object('heart') : null;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 - 40;
        const pulse = 1 + Math.sin(now * 0.006) * 0.12;

        ctx.save();
        ctx.shadowColor = '#FF5A8A';
        ctx.shadowBlur = 26 * (Math.sin(now * 0.005) * 0.3 + 0.7);
        if (heart) {
            const w = heart.width * 2.4 * pulse;
            const h = heart.height * 2.4 * pulse;
            ctx.drawImage(heart, cx - w / 2, cy - h / 2, w, h);
        } else {
            ctx.fillStyle = '#FF5A8A';
            ctx.beginPath();
            ctx.arc(cx, cy, 30 * pulse, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Alianças decorativas orbitando
        const ring = window.PixelSprites ? window.PixelSprites.object('ring') : null;
        if (ring) {
            const angle = now * 0.0012;
            const rx = Math.cos(angle) * 110;
            const ry = Math.sin(angle) * 36;
            ctx.drawImage(ring, cx + rx - 15, cy + ry - 15, 30, 30);
            ctx.drawImage(ring, cx - rx - 15, cy - ry - 15, 30, 30);
        }

        // Barra de progresso
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
        ctx.font = '18px "Pixelify Sans", Arial';
        ctx.fillText(this.loadingText, canvas.width / 2, barY - 20);

        ctx.font = '14px "Pixelify Sans", Arial';
        ctx.fillText(`${Math.round(this.loadingProgress * 100)}%`, canvas.width / 2, barY + 45);

        if (this.loadingProgress > 0.5) {
            const alpha = Math.sin(now * 0.005) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.font = '16px "Pixelify Sans", Arial';
            ctx.fillText('Prepare-se para a aventura do amor! ❤️', canvas.width / 2, canvas.height - 50);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingScreen;
} else {
    window.LoadingScreen = LoadingScreen;
}
