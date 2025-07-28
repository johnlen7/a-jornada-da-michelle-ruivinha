// Sistema de Loading Screen
class LoadingScreen {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.loadingProgress = 0;
        this.loadingText = 'Carregando...';
        this.startTime = Date.now();
        this.duration = 3000; // 3 segundos de loading
        this.michelleSprite = new Image();
        this.michelleSprite.src = 'michelle_sprite.png';
        this.spriteLoaded = false;
        
        this.michelleSprite.onload = () => {
            this.spriteLoaded = true;
        };
        
        this.michelleSprite.onerror = () => {
            console.log('Erro ao carregar sprite da Michelle para loading');
        };
    }
    
    update() {
        const elapsed = Date.now() - this.startTime;
        this.loadingProgress = Math.min(elapsed / this.duration, 1);
        
        // Atualizar texto baseado no progresso
        if (this.loadingProgress < 0.3) {
            this.loadingText = 'Carregando recursos...';
        } else if (this.loadingProgress < 0.6) {
            this.loadingText = 'Preparando aventura...';
        } else if (this.loadingProgress < 0.9) {
            this.loadingText = 'Quase pronto...';
        } else {
            this.loadingText = 'Pronto!';
        }
        
        return this.loadingProgress >= 1;
    }
    
    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Fundo mágico
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0d4d');
        gradient.addColorStop(0.5, '#2d1810');
        gradient.addColorStop(1, '#4a3426');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Estrelas de fundo
        for(let i = 0; i < 30; i++) {
            const x = (i * 127) % canvas.width;
            const y = (i * 97) % canvas.height;
            const twinkle = Math.sin(Date.now() * 0.005 + i) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Título
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Pixelify Sans';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeText('A Jornada de Michelle', canvas.width/2, 120);
        ctx.fillText('A Jornada de Michelle', canvas.width/2, 120);
        
        // Michelle Sprite (centralizada)
        const michelleX = canvas.width / 2;
        const michelleY = canvas.height / 2 - 50;
        
        // Efeito de brilho ao redor da Michelle
        const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20 * glowIntensity;
        
        if (this.spriteLoaded) {
            // Usar sprite real da Michelle
            const spriteSize = 80 + Math.sin(Date.now() * 0.003) * 10; // Efeito de respiração
            ctx.drawImage(this.michelleSprite, michelleX - spriteSize/2, michelleY - spriteSize/2, spriteSize, spriteSize);
        } else {
            // Fallback: círculo dourado pulsante
            ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity})`;
            ctx.beginPath();
            ctx.arc(michelleX, michelleY, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0; // Reset shadow
        
        // Barra de progresso
        const barWidth = 300;
        const barHeight = 20;
        const barX = (canvas.width - barWidth) / 2;
        const barY = canvas.height - 150;
        
        // Fundo da barra
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Progresso da barra
        const progressWidth = barWidth * this.loadingProgress;
        const progressGradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
        progressGradient.addColorStop(0, '#FFD700');
        progressGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(barX, barY, progressWidth, barHeight);
        
        // Texto de progresso
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Pixelify Sans';
        ctx.fillText(this.loadingText, canvas.width/2, barY - 20);
        
        // Porcentagem
        ctx.font = '14px Pixelify Sans';
        ctx.fillText(`${Math.round(this.loadingProgress * 100)}%`, canvas.width/2, barY + 45);
        
        // Corações decorativos
        ctx.fillStyle = '#FF1493';
        ctx.font = '30px Arial';
        const heartBounce = Math.sin(Date.now() * 0.008) * 3;
        ctx.fillText('💖', canvas.width/2 - 100, michelleY + heartBounce);
        ctx.fillText('💖', canvas.width/2 + 100, michelleY - heartBounce);
        
        // Dica enquanto carrega
        if (this.loadingProgress > 0.5) {
            const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.font = '16px Pixelify Sans';
            ctx.fillText('Prepare-se para a aventura do amor! ❤️', canvas.width/2, canvas.height - 50);
        }
    }
}
