// Classe para gerenciar todos os cenários do jogo
class SceneRenderer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        
        // Carregar sprite da Michelle
        this.michelleSprite = new Image();
        this.michelleSprite.src = 'michelle_sprite.png';
        this.michelleSprite.onerror = () => {
            console.log('Erro ao carregar sprite da Michelle, usando fallback');
        };

        // Carregar sprite do John
        this.johnSprite = new Image();
        this.johnSprite.src = 'sprite_johnlennon.png';

        // Carregar imagens de Hogwarts
        this.hogwartsImages = {
            bed: new Image(),
            sortingHat: new Image(),
            banner: new Image(),
            bookshelf: new Image()
        };
        
        this.hogwartsImages.bed.src = 'cama_hogwarts.png';
        this.hogwartsImages.sortingHat.src = 'chapeu_seletor.png';
        this.hogwartsImages.banner.src = 'banner_corvinal.png';
        this.hogwartsImages.bookshelf.src = 'estante_livros.png';
        
        // Error handling para imagens
        Object.entries(this.hogwartsImages).forEach(([key, img]) => {
            img.onerror = () => {
                console.log(`Erro ao carregar imagem de ${key}, usando fallback`);
            };
        });

        // Carregar imagens das casas do mapa
        this.mapHouseImages = {
            hogwarts: new Image(),
            centralperk: new Image(),
            caminhoforte: new Image(),
            fortecopacabana: new Image()
        };
        this.mapHouseImages.hogwarts.src = 'casa_hogwarts.png';
        this.mapHouseImages.centralperk.src = 'centralperk.png';
        this.mapHouseImages.caminhoforte.src = 'caminho_forte.png';
        this.mapHouseImages.fortecopacabana.src = 'forte_copacabana.png';

        // Carregar imagem da carroçinha de churros
        this.churrosCartImg = new Image();
        this.churrosCartImg.src = 'churros.png';
    }
    
    // Desenhar tela inicial
    drawStartScreen() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0d4d');
        gradient.addColorStop(0.5, '#2d1810');
        gradient.addColorStop(1, '#4a3426');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Magical sparkles background
        for(let i = 0; i < 25; i++) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 
                   1 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Pixelify Sans';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.strokeText('Mini Game', canvas.width/2, 150);
        ctx.fillText('Mini Game', canvas.width/2, 150);
        
        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 32px Pixelify Sans';
        ctx.strokeText('A Jornada de Michelle', canvas.width/2, 200);
        ctx.fillText('A Jornada de Michelle', canvas.width/2, 200);
        
        // Hearts decoration
        ctx.fillStyle = '#FF1493';
        ctx.font = '40px Arial';
        ctx.fillText('💖', canvas.width/2 - 150, 180);
        ctx.fillText('💖', canvas.width/2 + 150, 180);
        ctx.fillText('✨', canvas.width/2, 250);
        
        // Instructions
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Pixelify Sans';
        ctx.fillText('Aperte qualquer tecla para começar o jogo', canvas.width/2, 350);
        
        // Pulsing effect for instruction
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.font = '20px Pixelify Sans';
        ctx.fillText('Ajude a Michelle a responder as perguntas do coração ❤️', canvas.width/2, 420);
        
        // Game info
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px Pixelify Sans';
        ctx.fillText('Use ↑↓←→ para mover | ESPAÇO para interagir', canvas.width/2, 500);
          // Magical border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        console.log('Tela inicial desenhada com sucesso');
    }

    // Desenhar Michelle em pixel art detalhada
    drawMichellePixelArt(x, y) {
        const ctx = this.ctx;
        
        // Sombra da Michelle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + 40, 20, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // === CABELO RUIVO (baseado na imagem enviada) ===
        ctx.fillStyle = '#B8860B'; // Tom mais escuro do cabelo
        // Cabelo - parte superior
        ctx.fillRect(x-24, y-60, 48, 12);
        ctx.fillRect(x-20, y-72, 40, 12);
        ctx.fillRect(x-16, y-84, 32, 12);
        
        // Cabelo - laterais
        ctx.fillRect(x-28, y-48, 8, 24);
        ctx.fillRect(x+20, y-48, 8, 24);
        ctx.fillRect(x-24, y-24, 8, 16);
        ctx.fillRect(x+16, y-24, 8, 16);
        
        // Cabelo - tons mais claros
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(x-20, y-68, 40, 8);
        ctx.fillRect(x-16, y-80, 32, 8);
        ctx.fillRect(x-24, y-44, 6, 20);
        ctx.fillRect(x+18, y-44, 6, 20);
        
        // === ROSTO ===
        ctx.fillStyle = '#FDBCB4'; // Tom de pele
        ctx.fillRect(x-16, y-48, 32, 32);
        
        // === OLHOS VERDES ===
        ctx.fillStyle = '#228B22'; // Verde dos olhos
        ctx.fillRect(x-12, y-40, 6, 6);
        ctx.fillRect(x+6, y-40, 6, 6);
        
        // Pupilas
        ctx.fillStyle = '#000000';
        ctx.fillRect(x-10, y-38, 2, 2);
        ctx.fillRect(x+8, y-38, 2, 2);
        
        // Brilho nos olhos
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x-9, y-39, 1, 1);
        ctx.fillRect(x+9, y-39, 1, 1);
        
        // === NARIZ ===
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(x-2, y-32, 4, 4);
        
        // === BOCA ===
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x-6, y-24, 12, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x-4, y-22, 8, 2);
        
        // === BLUSA VERMELHA ===
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(x-20, y-16, 40, 28);
        
        // Detalhes da blusa
        ctx.fillStyle = '#B22222';
        ctx.fillRect(x-16, y-12, 32, 4);
        ctx.fillRect(x-18, y-8, 4, 20);
        ctx.fillRect(x+14, y-8, 4, 20);
        
        // === BRAÇOS ===
        ctx.fillStyle = '#FDBCB4';
        // Braço esquerdo
        ctx.fillRect(x-28, y-8, 8, 20);
        // Braço direito
        ctx.fillRect(x+20, y-8, 8, 20);
        
        // Mãos
        ctx.fillRect(x-28, y+12, 8, 8);
        ctx.fillRect(x+20, y+12, 8, 8);
        
        // === CALÇA AZUL ===
        ctx.fillStyle = '#191970';
        ctx.fillRect(x-16, y+12, 32, 20);
        
        // Detalhes da calça
        ctx.fillStyle = '#000080';
        ctx.fillRect(x-14, y+16, 28, 2);
        ctx.fillRect(x-2, y+14, 4, 18);
        
        // === PERNAS ===
        ctx.fillStyle = '#FDBCB4';
        // Perna esquerda
        ctx.fillRect(x-12, y+32, 8, 16);
        // Perna direita
        ctx.fillRect(x+4, y+32, 8, 16);
        
        // === SAPATOS ===
        ctx.fillStyle = '#654321';
        ctx.fillRect(x-14, y+48, 12, 6);
        ctx.fillRect(x+2, y+48, 12, 6);
        
        // Sola dos sapatos
        ctx.fillStyle = '#2F1B14';
        ctx.fillRect(x-16, y+52, 16, 2);
        ctx.fillRect(x, y+52, 16, 2);
    }    // Desenhar mapa principal baseado na imagem fornecida
    drawMap(playerX, playerY, mapLocations) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // === CÉUS E NUVENS ===
        // Céu azul claro
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#B0E0E6');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
        
        // Nuvens brancas grandes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.drawCloud(120, 80);
        this.drawCloud(350, 60);
        this.drawCloud(580, 90);
        this.drawCloud(650, 45);
        
        // === MONTANHAS AO FUNDO ===
        ctx.fillStyle = '#8B7D6B';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.4);
        ctx.lineTo(200, canvas.height * 0.2);
        ctx.lineTo(400, canvas.height * 0.3);
        ctx.lineTo(600, canvas.height * 0.15);
        ctx.lineTo(canvas.width, canvas.height * 0.25);
        ctx.lineTo(canvas.width, canvas.height * 0.6);
        ctx.lineTo(0, canvas.height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // === GRAMA E TERRENO ===
        // Grama verde principal
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
        
        // Grama mais escura para variação
        ctx.fillStyle = '#228B22';
        for(let i = 0; i < canvas.width; i += 40) {
            ctx.fillRect(i, canvas.height * 0.65, 20, canvas.height * 0.35);
        }
        
        // === ILHA CENTRAL ===
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.75;
        
        // Ilha principal (circular)
        ctx.fillStyle = '#8FBC8F';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
        ctx.fill();
        
        // Borda da ilha
        ctx.strokeStyle = '#556B2F';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // === RIOS/CAMINHOS CONECTANDO AS CASAS ===
        ctx.fillStyle = '#4169E1';
        ctx.strokeStyle = '#191970';
        ctx.lineWidth = 2;
        
        // Rio horizontal (conecta hogwarts com central perk)
        const riverY = canvas.height * 0.75;
        ctx.fillRect(100, riverY - 10, canvas.width - 200, 20);
        ctx.strokeRect(100, riverY - 10, canvas.width - 200, 20);
        
        // Rio vertical (conecta central perk com forte)
        ctx.fillRect(centerX - 10, canvas.height * 0.3, 20, canvas.height * 0.45);
        ctx.strokeRect(centerX - 10, canvas.height * 0.3, 20, canvas.height * 0.45);
        
        // Rio diagonal (para a praia)
        ctx.save();
        ctx.translate(centerX + 80, riverY);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-10, 0, 20, 100);
        ctx.strokeRect(-10, 0, 20, 100);
        ctx.restore();
        
        // === PONTE NA ILHA CENTRAL ===
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(centerX - 30, riverY - 5, 60, 10);
        ctx.strokeStyle = '#654321';
        ctx.strokeRect(centerX - 30, riverY - 5, 60, 10);
        
        // === PRAIA (canto inferior direito) ===
        // Areia
        ctx.fillStyle = '#F4A460';
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.75, canvas.height);
        ctx.lineTo(canvas.width, canvas.height * 0.85);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
        
        // Água do mar
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.8, canvas.height);
        ctx.lineTo(canvas.width, canvas.height * 0.9);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
        
        // Ondas da praia
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        for(let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(canvas.width * 0.9 + i * 15, canvas.height * 0.95 - i * 5, 8, Math.PI, 2 * Math.PI);
            ctx.stroke();
        }
        
        // === ÁRVORES DECORATIVAS ===
        this.drawMagicalTree(150, canvas.height * 0.8);
        this.drawMagicalTree(650, canvas.height * 0.8);
        this.drawMagicalTree(centerX - 80, canvas.height * 0.65);
        this.drawMagicalTree(centerX + 80, canvas.height * 0.65);
        
        // === FLORES E DETALHES ===
        ctx.fillStyle = '#FF69B4';
        for(let i = 0; i < 10; i++) {
            const flowerX = 50 + i * 70;
            const flowerY = canvas.height * 0.85 + Math.sin(i) * 20;
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === ESTRELAS MÁGICAS ===
        for(let i = 0; i < 15; i++) {
            const x = (i * 127) % canvas.width;
            const y = (i * 97) % (canvas.height * 0.5);
            const twinkle = Math.sin(Date.now() * 0.005 + i) * 0.3 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === TRILHAS MÁGICAS CONECTANDO AS CASAS ===
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        // Trilha horizontal (Hogwarts para Central Perk)
        ctx.beginPath();
        ctx.moveTo(mapLocations[0].x + 50, mapLocations[0].y);
        ctx.lineTo(mapLocations[1].x - 50, mapLocations[1].y);
        ctx.stroke();
        
        // Trilha vertical (Central Perk para Caminho)
        ctx.beginPath();
        ctx.moveTo(mapLocations[1].x, mapLocations[1].y - 50);
        ctx.lineTo(mapLocations[2].x, mapLocations[2].y + 50);
        ctx.stroke();
        
        // Trilha para o forte
        ctx.beginPath();
        ctx.moveTo(mapLocations[2].x, mapLocations[2].y + 50);
        ctx.lineTo(mapLocations[3].x, mapLocations[3].y - 50);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // === DESENHAR CASAS TEMÁTICAS ===
        mapLocations.forEach((location, index) => {
            this.drawThemedHouse(location, index);
        });
        
        // === DECORAÇÕES DO MAPA ===
        // Árvores mágicas
        this.drawMagicalTree(100, 450);
        this.drawMagicalTree(700, 450);
        this.drawMagicalTree(50, 100);
        this.drawMagicalTree(750, 100);
        
        // Lago central mágico
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2 + 100, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflexos no lago
        ctx.fillStyle = '#87CEEB';
        for(let i = 0; i < 5; i++) {            ctx.beginPath();
            ctx.arc(canvas.width/2 + Math.sin(Date.now() * 0.002 + i) * 30, 
                   canvas.height/2 + 100 + Math.cos(Date.now() * 0.003 + i) * 20, 
                   5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === DESENHAR LOCALIZAÇÕES ===
        mapLocations.forEach((location, index) => {
            this.drawThemedHouse(location, index);
        });
        
        // === DESENHAR JOGADOR ===
        this.drawPlayer(playerX, playerY);

        // Desenhar carroçinha de churros
        const churrosX = 430; // 400 + 30
        const churrosY = canvas.height * 0.75 + 60; // posição na calçada
        if (this.churrosCartImg.complete && this.churrosCartImg.naturalWidth) {
            ctx.drawImage(this.churrosCartImg, churrosX, churrosY, 80, 60);
            // Desenhar símbolo de interação acima da barraquinha
            ctx.save();
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = '#FFD700';
            ctx.fillText('?', churrosX + 40, churrosY - 10); // centralizado acima
            ctx.restore();
        }
    }

    // Desenhar casas temáticas melhoradas
    drawThemedHouse(location, index) {
        const ctx = this.ctx;
        const x = location.x;
        const y = location.y;
        const unlocked = location.unlocked;
        // Substituir casas por imagens
        let img = null;
        if (index === 0) img = this.mapHouseImages.hogwarts;
        if (index === 1) img = this.mapHouseImages.centralperk;
        if (index === 2) img = this.mapHouseImages.caminhoforte;
        if (index === 3) img = this.mapHouseImages.fortecopacabana;
        if (img && img.complete && img.naturalWidth) {
            // Tamanho padrão para cada casa
            let w = 70, h = 70;
            if (index === 3) { w = 90; h = 90; } // Forte maior
            ctx.save();
            ctx.globalAlpha = unlocked ? 1 : 0.5;
            ctx.drawImage(img, x - w/2, y - h/2, w, h);
            ctx.restore();
        } else {
            // Fallback: desenho antigo
            if (location.isFort) {
                ctx.fillStyle = unlocked ? location.houseColor : '#404040';
                ctx.fillRect(x-60, y-40, 120, 80);
                ctx.fillRect(x-50, y-30, 100, 60);
                ctx.fillStyle = unlocked ? location.houseColor : '#404040';
                ctx.fillRect(x-70, y-50, 20, 30);
                ctx.fillRect(x+50, y-50, 20, 30);
            } else {
                ctx.fillStyle = unlocked ? location.houseColor : '#404040';
                ctx.fillRect(x-30, y-20, 60, 40);
                ctx.fillStyle = unlocked ? '#8B0000' : '#2F2F2F';
                ctx.beginPath();
                ctx.moveTo(x-35, y-20);
                ctx.lineTo(x, y-50);
                ctx.lineTo(x+35, y-20);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = unlocked ? '#654321' : '#1F1F1F';
                ctx.fillRect(x-8, y-5, 16, 25);
                ctx.fillStyle = unlocked ? '#87CEEB' : '#2F2F2F';
                ctx.fillRect(x-20, y-15, 8, 8);
                ctx.fillRect(x+12, y-15, 8, 8);
            }
        }
        // Nome da localização
        ctx.fillStyle = unlocked ? '#FFFFFF' : '#808080';
        ctx.font = '12px Pixelify Sans';
        ctx.textAlign = 'center';
        ctx.fillText(location.name, x, y+40);
        // Cadeado se bloqueado
        if (!unlocked) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '20px Arial';
            ctx.fillText('🔒', x, y-60);
        }
    }

    // Desenhar árvore mágica
    drawMagicalTree(x, y) {
        const ctx = this.ctx;
        
        // Tronco
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x-8, y-40, 16, 40);
        
        // Copa da árvore
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x, y-60, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x-15, y-50, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x+15, y-50, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Frutos mágicos brilhantes
        const fruits = ['⭐', '💎', '🔮'];
        for(let i = 0; i < 3; i++) {
            const fx = x + Math.sin(Date.now() * 0.005 + i) * 20;
            const fy = y - 60 + Math.cos(Date.now() * 0.007 + i) * 15;
            ctx.font = '12px Arial';
            ctx.fillText(fruits[i], fx, fy);
        }
    }    // Desenhar jogador (Michelle)
    drawPlayer(playerX, playerY) {
        const ctx = this.ctx;
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(playerX, playerY + 15, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Usar sprite da Michelle se carregado
        if (this.michelleSprite.complete && this.michelleSprite.naturalWidth > 0) {
            ctx.save();
            
            // Animação de movimento
            const offset = Math.sin(Date.now() * 0.01) * 2;
            ctx.translate(0, offset);
            
            // Desenhar sprite da Michelle centralizado
            ctx.drawImage(this.michelleSprite, playerX - 32, playerY - 32, 64, 64);
            
            ctx.restore();
        } else {
            // Fallback: Arte pixel da Michelle
            this.drawMichellePixelArt(playerX, playerY);
        }
    }
    
    // Fallback da Michelle em pixel art
    drawMichellePixelArt(playerX, playerY) {
        const ctx = this.ctx;
        
        // Corpo
        ctx.fillStyle = '#8B4513'; // Cor da pele
        ctx.fillRect(playerX-8, playerY-15, 16, 20);
        
        // Cabeça
        ctx.beginPath();
        ctx.arc(playerX, playerY-20, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Cabelo ruivo
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.arc(playerX, playerY-25, 12, 0, Math.PI);
        ctx.fill();
        
        // Roupas
        ctx.fillStyle = '#8B0000'; // Blusa vermelha
        ctx.fillRect(playerX-8, playerY-15, 16, 12);
        
        ctx.fillStyle = '#000080'; // Calça azul
        ctx.fillRect(playerX-8, playerY-3, 16, 8);
        
        // Detalhes do rosto
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(playerX-3, playerY-22, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(playerX+3, playerY-22, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Sorriso
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(playerX, playerY-18, 3, 0, Math.PI);
        ctx.stroke();
    }

    // Desenhar decorações específicas de cada nível
    drawLevelDecorations(currentLevel) {
        switch(currentLevel) {
            case 0:
                this.drawHogwartsRoom();
                break;
            case 1:
                this.drawCentralPerk();
                break;
            case 2:
                this.drawBeachPath();
                break;
            case 3:
                this.drawForteCopacabana();
                break;
        }
    }

    // Quarto de Hogwarts melhorado
    drawHogwartsRoom() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Room background with walls and floor
        // Back wall
        ctx.fillStyle = '#2d1810';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.65);
        
        // Floor
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);
        
        // Floor planks
        ctx.fillStyle = '#4a3426';
        for(let i = 0; i < 15; i++) {
            ctx.fillRect(0, (canvas.height * 0.65) + i*18, canvas.width, 2);
        }
        
        // Side walls for depth
        ctx.fillStyle = '#1a0d4d';
        ctx.fillRect(0, 0, 50, canvas.height);
        ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
        
        // === ESTANTE DE LIVROS (lado esquerdo como na imagem) ===
        ctx.fillStyle = '#654321';
        ctx.fillRect(70, 120, 200, 180);
        
        // Prateleiras da estante
        ctx.fillRect(75, 140, 190, 8);
        ctx.fillRect(75, 180, 190, 8);
        ctx.fillRect(75, 220, 190, 8);
        ctx.fillRect(75, 260, 190, 8);
        
        // Livros organizados por prateleira
        const bookColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#8B008B'];
        for(let shelf = 0; shelf < 4; shelf++) {
            for(let book = 0; book < 14; book++) {
                ctx.fillStyle = bookColors[book % 8];
                ctx.fillRect(80 + book*13, 125 + shelf*40, 10, 30);
            }
        }
        
        // === JANELAS CENTRAIS (como na imagem) ===
        // Janela esquerda
        ctx.fillStyle = '#654321';
        ctx.fillRect(350, 60, 80, 120);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(355, 65, 35, 50);
        ctx.fillRect(355, 125, 35, 50);
        ctx.fillRect(395, 65, 35, 50);
        ctx.fillRect(395, 125, 35, 50);
        
        // Divisórias da janela esquerda
        ctx.fillStyle = '#654321';
        ctx.fillRect(390, 65, 5, 110);
        ctx.fillRect(355, 115, 70, 5);
        
        // Adicionar quadro do Dumbledore ao lado da janela esquerda, 20px de distância, mesma altura
        if (!this.dumbledoreQuadroImg) {
            this.dumbledoreQuadroImg = new Image();
            this.dumbledoreQuadroImg.src = 'dumbledore_quadro_foto.png';
        }
        // Subir o quadro 5px (y=55)
        if (this.dumbledoreQuadroImg.complete && this.dumbledoreQuadroImg.naturalWidth) {
            ctx.drawImage(this.dumbledoreQuadroImg, 450, 55, 100, 140);
        } else {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 8;
            ctx.strokeRect(450, 55, 100, 140);
        }
        
        // === MESA/PEDESTAL CENTRAL (como na imagem) ===
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(320, 350, 80, 60);
        ctx.fillStyle = '#654321';
        ctx.fillRect(315, 345, 90, 10);

        // Chapéu seletor: base tocando o tampo da mesa (y=345), centralizado
        if (this.hogwartsImages && this.hogwartsImages.sortingHat && this.hogwartsImages.sortingHat.complete && this.hogwartsImages.sortingHat.naturalWidth) {
            // Animação sutil do chapéu
            const hatWiggle = Math.sin(Date.now() * 0.004) * 2; // movimento quase imperceptível
            ctx.drawImage(this.hogwartsImages.sortingHat, 320 + 24, 345 - 28 + 2 + hatWiggle, 32, 28);
        } else {
            // Fallback: chapéu desenhado
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(350, 370);
            ctx.lineTo(360, 350);
            ctx.lineTo(380, 370);
            ctx.closePath();
            ctx.fill();
        }
        
        // === CAMA COM DOSSEL (lado direito como na imagem) ===
        // Base da cama
        ctx.fillStyle = '#4B0082';
        ctx.fillRect(550, 350, 180, 80);
        // Dossel/cortinas da cama
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(545, 280, 190, 80);
        ctx.fillStyle = '#654321';
        ctx.fillRect(545, 275, 190, 10);
        // Colunas da cama
        ctx.fillStyle = '#654321';
        ctx.fillRect(545, 275, 10, 155);
        ctx.fillRect(725, 275, 10, 155);
        // Travesseiros
        ctx.fillStyle = '#FFE4E1';
        ctx.fillRect(560, 350, 40, 25);
        ctx.fillRect(680, 350, 40, 25);
        // Imagem da cama perfeitamente alinhada ao fundo azul, ocupando quase toda a área
        if (this.hogwartsImages && this.hogwartsImages.bed && this.hogwartsImages.bed.complete && this.hogwartsImages.bed.naturalWidth) {
            ctx.drawImage(this.hogwartsImages.bed, 552, 361, 176, 76);
        }
        
        // === LAREIRA (canto direito como na imagem) ===
        ctx.fillStyle = '#654321';
        ctx.fillRect(680, 140, 80, 100);
        ctx.fillStyle = '#2F1B14';
        ctx.fillRect(685, 155, 70, 70);
        
        // Fogo na lareira
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(695, 200, 12, 20);
        ctx.fillRect(710, 195, 10, 25);
        ctx.fillRect(725, 205, 12, 15);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(700, 210, 8, 10);
        ctx.fillRect(715, 205, 6, 12);
        
        // === BANNER NA PAREDE LATERAL (como na imagem) ===
        ctx.fillStyle = '#000080';
        ctx.fillRect(20, 150, 25, 80);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(22, 160, 21, 15);
        
        // === TEXTO "CORVINAL" VERTICAL ===
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Pixelify Sans';
        ctx.textAlign = 'center';
        const corvinaltText = 'CORVINAL';
        for(let i = 0; i < corvinaltText.length; i++) {
            ctx.fillText(corvinaltText[i], 32, 250 + i*24);
        }
        
        // === ELEMENTOS MÁGICOS ===
        // Velas flutuantes
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(200, 80, 6, 18);
        ctx.fillRect(300, 75, 6, 18);
        ctx.fillRect(580, 90, 6, 18);
        ctx.fillRect(650, 85, 6, 18);
        
        // Chamas das velas
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(201, 75, 4, 8);
        ctx.fillRect(301, 70, 4, 8);
        ctx.fillRect(581, 85, 4, 8);
        ctx.fillRect(651, 80, 4, 8);
        
        // Poeira mágica flutuante
        ctx.fillStyle = '#9370DB';
        for(let i = 0; i < 10; i++) {
            const x = 100 + i*60 + Math.sin(Date.now() * 0.01 + i) * 20;
            const y = 100 + Math.cos(Date.now() * 0.008 + i) * 30;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === FANTASMAS DE HOGWARTS FLUTUANDO ===
        const ghostTime = Date.now() * 0.003;
        
        // Fantasma 1 - Flutuando pela sala
        const ghost1X = 200 + Math.sin(ghostTime) * 100;
        const ghost1Y = 150 + Math.cos(ghostTime * 0.7) * 30;
        this.drawGhost(ghost1X, ghost1Y, 0.6);
        
        // Fantasma 2 - Flutuando próximo às janelas
        const ghost2X = 500 + Math.sin(ghostTime * 1.2) * 80;
        const ghost2Y = 100 + Math.cos(ghostTime * 0.8) * 40;
        this.drawGhost(ghost2X, ghost2Y, 0.4);
        
        // Fantasma 3 - Pequeno fantasma brincalhão
        const ghost3X = 300 + Math.sin(ghostTime * 1.5) * 60;
        const ghost3Y = 200 + Math.cos(ghostTime * 1.1) * 25;
        this.drawGhost(ghost3X, ghost3Y, 0.5);
    }

    // Método para desenhar fantasmas de Hogwarts
    drawGhost(x, y, opacity) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Corpo principal do fantasma
        ctx.fillStyle = '#E6E6FA';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Parte inferior ondulada do fantasma
        ctx.beginPath();
        ctx.moveTo(x - 25, y);
        for(let i = 0; i < 5; i++) {
            const waveX = x - 25 + (i * 10);
            const waveY = y + 10 + Math.sin(Date.now() * 0.01 + i) * 5;
            ctx.lineTo(waveX, waveY);
        }
        ctx.lineTo(x + 25, y);
        ctx.closePath();
        ctx.fill();
        
        // Olhos do fantasma
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - 8, y - 5, 3, 0, Math.PI * 2);
        ctx.arc(x + 8, y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca do fantasma (às vezes sorrindo, às vezes neutra)
        const mouthOffset = Math.sin(Date.now() * 0.005) > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(x, y + 5, 4, 0, Math.PI * mouthOffset);
        ctx.stroke();
        
        ctx.restore();
    }

    // Central Perk atualizado
    drawCentralPerk() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // === FUNDO E PAREDES ===
        // Parede principal (cor quente laranja/terracota)
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
        
        // Piso de madeira
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
        
        // Tábuas do piso
        ctx.fillStyle = '#A0522D';
        for(let i = 0; i < 8; i++) {
            ctx.fillRect(0, (canvas.height * 0.7) + i*25, canvas.width, 2);
        }
        
        // === SOFÁ LARANJA CENTRAL (principal elemento) ===
        // Base do sofá
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(280, 320, 240, 120);
        
        // Braços do sofá
        ctx.fillRect(260, 320, 20, 120);
        ctx.fillRect(520, 320, 20, 120);
        
        // Encosto do sofá
        ctx.fillRect(280, 300, 240, 20);
        
        // Almofadas do sofá
        ctx.fillStyle = '#FF7F00';
        ctx.fillRect(290, 330, 45, 80);
        ctx.fillRect(345, 330, 45, 80);
        ctx.fillRect(400, 330, 45, 80);
        ctx.fillRect(465, 330, 45, 80);
        
        // === POLTRONA ROXA/VIOLETA (lado esquerdo) ===
        ctx.fillStyle = '#8B008B';
        ctx.fillRect(100, 350, 100, 90);
        
        // Braços da poltrona
        ctx.fillRect(80, 350, 20, 90);
        ctx.fillRect(200, 350, 20, 90);
        
        // Encosto da poltrona
        ctx.fillRect(100, 330, 100, 20);
        
        // Almofada da poltrona
        ctx.fillStyle = '#9932CC';
        ctx.fillRect(110, 360, 80, 70);
        
        // === MESA DE CENTRO (em frente ao sofá) ===
        ctx.fillStyle = '#654321';
        ctx.fillRect(320, 450, 160, 60);
        
        // Tampo da mesa
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(315, 445, 170, 10);
        
        // Pernas da mesa
        ctx.fillStyle = '#654321';
        ctx.fillRect(325, 505, 8, 20);
        ctx.fillRect(457, 505, 8, 20);
        ctx.fillRect(325, 505, 8, 20);
        ctx.fillRect(457, 505, 8, 20);
        
        // === MÁQUINA DE CAFÉ (lado direito) ===
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(650, 250, 80, 120);
        
        // Detalhes da máquina
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(655, 260, 70, 30);
        ctx.fillRect(655, 300, 30, 60);
        
        // Xícaras em cima da máquina
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(690, 240, 15, 10);
        ctx.fillRect(710, 240, 15, 10);
        
        // === QUADROS NA PAREDE ===
        // Quadro principal (grande)
        ctx.fillStyle = '#654321';
        ctx.fillRect(450, 120, 120, 80);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(455, 125, 110, 70);
        
        // Quadro pequeno esquerdo
        ctx.fillStyle = '#654321';
        ctx.fillRect(150, 140, 80, 60);
        ctx.fillStyle = '#98FB98';
        ctx.fillRect(155, 145, 70, 50);
        
        // Quadro pequeno direito
        ctx.fillStyle = '#654321';
        ctx.fillRect(600, 130, 70, 70);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(605, 135, 60, 60);
        
        // === PLANTA (canto direito) ===
        // Vaso da planta
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(720, 380, 40, 50);
        
        // Planta/folhas
        ctx.fillStyle = '#228B22';
        ctx.fillRect(725, 360, 30, 20);
        ctx.fillRect(720, 340, 40, 20);
        ctx.fillRect(715, 320, 50, 20);
        
        // === BALCÃO/CONTADOR (fundo direito) ===
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(580, 180, 150, 60);
        
        // Tampo do balcão
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(575, 175, 160, 10);
        
        // === MENU NA PAREDE ===
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(600, 80, 80, 100);
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MENU', 640, 100);
        ctx.font = '8px Arial';
        ctx.fillText('Coffee $2', 640, 120);
        ctx.fillText('Latte $3', 640, 135);
        ctx.fillText('Tea $2', 640, 150);
        ctx.fillText('Muffin $3', 640, 165);
        
        // === LUMINÁRIAS/LUZES ===
        // Luminária pendente central
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(395, 80, 10, 30);
        ctx.beginPath();
        ctx.arc(400, 120, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Luminária lateral
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(200, 90, 8, 25);
        ctx.beginPath();
        ctx.arc(204, 125, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // === DETALHES FINAIS ===
        // Revista na mesa
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(360, 460, 40, 30);
        
        // Xícaras na mesa
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(420, 465, 12, 8);
        ctx.fillRect(440, 465, 12, 8);
    }

    // Caminho para o forte melhorado baseado na imagem
    drawBeachPath() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // === CÉU AZUL CLARO ===
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
        
        // === NUVENS PIXELADAS ===
        ctx.fillStyle = '#FFFFFF';
        // Nuvem esquerda
        ctx.fillRect(80, 80, 60, 20);
        ctx.fillRect(70, 90, 80, 20);
        ctx.fillRect(90, 70, 40, 20);
        
        // Nuvem direita
        ctx.fillRect(580, 100, 80, 20);
        ctx.fillRect(570, 110, 100, 20);
        ctx.fillRect(590, 90, 60, 20);
        
        // === MONTANHAS/COLINAS VERDES NO FUNDO ===
        ctx.fillStyle = '#228B22';
        // Primeira camada de colinas
        for(let i = 0; i < 8; i++) {
            const x = i * 100;
            const height = 80 + Math.sin(i * 0.8) * 20;
            ctx.fillRect(x, canvas.height * 0.6 - height, 120, height);
        }
        
        // Segunda camada mais escura
        ctx.fillStyle = '#006400';
        for(let i = 0; i < 6; i++) {
            const x = i * 120 + 60;
            const height = 60 + Math.cos(i * 0.6) * 15;
            ctx.fillRect(x, canvas.height * 0.6 - height, 100, height);
        }
        
        // === LAGO/RIO ===
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.15);
        
        // Reflexos na água
        ctx.fillStyle = '#87CEEB';
        for(let i = 0; i < 10; i++) {
            const x = i * 80 + Math.sin(Date.now() * 0.005 + i) * 20;
            const y = canvas.height * 0.6 + 20 + Math.cos(Date.now() * 0.003 + i) * 10;
            ctx.fillRect(x, y, 40, 3);
        }
        
        // === CERCA DE MADEIRA ===
        ctx.fillStyle = '#8B4513';
        const fenceY = canvas.height * 0.75;
        
        // Postes da cerca
        for(let i = 0; i < 9; i++) {
            const x = i * 100;
            ctx.fillRect(x, fenceY - 30, 8, 40);
        }
        
        // Tábuas horizontais da cerca
        ctx.fillRect(0, fenceY - 20, canvas.width, 6);
        ctx.fillRect(0, fenceY - 5, canvas.width, 6);
        
        // === TRILHA/CAMINHO ===
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(0, fenceY + 10, canvas.width, canvas.height * 0.25);
        
        // Padrão de pedras na trilha (baseado na imagem)
        ctx.fillStyle = '#F5DEB3';
        ctx.fillStyle = '#8B7355';
        
        // Padrão de paralelepípedos
        for(let row = 0; row < 6; row++) {
            for(let col = 0; col < 20; col++) {
                const x = col * 40 + (row % 2) * 20;
                const y = fenceY + 15 + row * 25;
                
                // Pedra clara
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x, y, 35, 20);
                
                // Bordas escuras
                ctx.fillStyle = '#8B7355';
                ctx.fillRect(x, y, 35, 3);
                ctx.fillRect(x, y, 3, 20);
                ctx.fillRect(x + 32, y, 3, 20);
                ctx.fillRect(x, y + 17, 35, 3);
            }
        }
        
        // === VEGETAÇÃO ===
        // Árvores no fundo
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(120, canvas.height * 0.5, 15, 60);
        ctx.fillRect(650, canvas.height * 0.45, 18, 70);
        
        // Copas das árvores
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(127, canvas.height * 0.5, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(659, canvas.height * 0.45, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Arbustos pequenos
        ctx.fillStyle = '#32CD32';
        for(let i = 0; i < 5; i++) {
            const x = 200 + i * 150;
            const y = canvas.height * 0.72;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        // Nova posição da barraca de churros mais à direita
        const churrosX = 600; // mais à direita
        const churrosYBase = 480;
        const churrosY = churrosYBase + Math.sin(Date.now() * 0.01) * 4; // leve movimento
        if (this.churrosCartImg.complete && this.churrosCartImg.naturalWidth) {
            ctx.drawImage(this.churrosCartImg, churrosX - 40, churrosY - 30, 80, 60); // centraliza a imagem
            // Símbolo de interação acima
            ctx.save();
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = '#FFD700';
            ctx.fillText('?', churrosX, churrosY - 40);
            ctx.restore();
        }        // Remover bolinhas e caixa amarela na cena do Caminho do Forte
        // Não depender mais da variável currentLevel que está causando erro
        
        // Remover bolinhas que saem do botão sair até a barraca de churros
        ctx.clearRect(390, 290, 20, 100); 
        // Remover caixa amarela no início
        ctx.clearRect(300, 300, 50, 50);
        
        // Desenhar Michelle de forma explícita na cena do Caminho do Forte
        this.drawMichellePixelArt(400, 500);
        
        // Michelle deve ser desenhada no Caminho do Forte
        if (typeof playerX !== 'undefined' && typeof playerY !== 'undefined') {
            this.drawPlayer(playerX, playerY);
        }
    }

    // Forte Copacabana com John Lennon e caminho bonito
    drawForteCopacabana() {        // Guardar referências para facilitar o código
        var ctx = this.ctx;
        var canvas = this.canvas;
        
        // === CÉU AZUL ===
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
        
        // === NUVENS BRANCAS PIXELADAS ===
        ctx.fillStyle = '#FFFFFF';
        // Nuvem esquerda
        ctx.fillRect(100, 80, 80, 20);
        ctx.fillRect(90, 90, 100, 20);
        ctx.fillRect(110, 70, 60, 20);
        
        // Nuvem direita
        ctx.fillRect(550, 100, 100, 20);
        ctx.fillRect(540, 110, 120, 20);
        ctx.fillRect(560, 90, 80, 20);
        
        // === OCEANO ===
        ctx.fillStyle = '#006994';
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
        
        // === MURALHA/PARAPEITO DO FORTE ===
        ctx.fillStyle = '#8B7355';
        var fortWallY = canvas.height * 0.75;
        ctx.fillRect(0, fortWallY, canvas.width, canvas.height * 0.25);
        
        // Detalhes da muralha
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(0, fortWallY, canvas.width, 10);
        
        // Ameias da muralha
        ctx.fillStyle = '#696969';
        for(var i = 0; i < 8; i++) {
            var x = i * 100 + 50;
            ctx.fillRect(x, fortWallY - 20, 30, 20);
        }
        
        // === PISO DE PEDRA ===
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(0, fortWallY + 30, canvas.width, canvas.height * 0.2);
        
        // Padrão de pedras no piso
        ctx.fillStyle = '#F5DEB3';
        for(var row = 0; row < 4; row++) {
            for(var col = 0; col < 15; col++) {
                var x = col * 50 + (row % 2) * 25;
                var y = fortWallY + 35 + row * 30;
                
                ctx.fillRect(x, y, 45, 25);
                
                // Bordas das pedras
                ctx.fillStyle = '#8B7355';
                ctx.strokeRect(x, y, 45, 25);
                ctx.fillStyle = '#F5DEB3';
            }
        }
        
        // === BANDEIRAS NOS CANTOS ===
        // Mastros
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(80, fortWallY - 60, 4, 40);
        ctx.fillRect(canvas.width - 84, fortWallY - 60, 4, 40);
        
        // Bandeiras
        ctx.fillStyle = '#FF0000';  // Bandeira vermelha
        ctx.fillRect(84, fortWallY - 55, 25, 15);
        ctx.fillStyle = '#FFFF00';  // Bandeira amarela
        ctx.fillRect(canvas.width - 109, fortWallY - 55, 25, 15);
        
        // === CAMINHO BONITO DO MURO ATÉ JOHN LENNON ===
        var johnX = canvas.width / 2;
        var johnY = canvas.height * 0.45;
        
        // Caminho principal - base
        ctx.fillStyle = '#8B4513';  // Marrom para o caminho de madeira
        var pathWidth = 60;
        
        // Desenhar caminho com pedras decorativas
        var pathY = fortWallY;
        var pathEndY = johnY + 32;  // Altura até os pés do John
        
        // Caminho dourado brilhante
        ctx.fillStyle = '#DAA520';  // Dourado
        ctx.beginPath();
        ctx.moveTo(johnX - pathWidth/2, pathY);
        ctx.lineTo(johnX + pathWidth/2, pathY);
        ctx.lineTo(johnX + pathWidth/3, pathEndY);
        ctx.lineTo(johnX - pathWidth/3, pathEndY);
        ctx.closePath();
        ctx.fill();
        
        // Adicionar brilho ao caminho
        ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.beginPath();
        ctx.moveTo(johnX - pathWidth/4, pathY);
        ctx.lineTo(johnX + pathWidth/4, pathY);
        ctx.lineTo(johnX + pathWidth/6, pathEndY);
        ctx.lineTo(johnX - pathWidth/6, pathEndY);
        ctx.closePath();
        ctx.fill();
        
        // Detalhes do caminho - pedras pequenas
        ctx.fillStyle = '#B8860B';  // Dourado escuro
        var steps = 8;
        var stepHeight = (pathEndY - pathY) / steps;
        
        for(var i = 1; i < steps; i++) {
            var stepY = pathY + i * stepHeight;
            var stepWidth = pathWidth - (i * 5);
            
            // Linha horizontal para marcar degrau
            ctx.fillRect(johnX - stepWidth/2, stepY, stepWidth, 2);
            
            // Detalhes decorativos - pedras brilhantes
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';  // Ouro com transparência
                ctx.beginPath();
                ctx.arc(johnX, stepY, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#B8860B';
            }
        }
        
        // Corrimãos/guias laterais
        ctx.strokeStyle = '#CD853F';  // Marrom claro
        ctx.lineWidth = 3;
        
        // Corrimão esquerdo
        ctx.beginPath();
        ctx.moveTo(johnX - pathWidth/2, pathY);
        ctx.lineTo(johnX - pathWidth/3, pathEndY);
        ctx.stroke();
        
        // Corrimão direito
        ctx.beginPath();
        ctx.moveTo(johnX + pathWidth/2, pathY);
        ctx.lineTo(johnX + pathWidth/3, pathEndY);
        ctx.stroke();
        
        // === DESENHAR JOHN LENNON NO TOPO DO CAMINHO ===
        // Ajustado Y para descer 20px
        var johnY = canvas.height * 0.45;
        var johnYAdjusted = johnY + 20;
        // Desenhar coração grande atrás do John Lennon
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        // Coração estilizado (duas metades)
        ctx.moveTo(johnX, johnYAdjusted);
        ctx.bezierCurveTo(johnX - 64, johnYAdjusted - 64, johnX - 64, johnYAdjusted + 48, johnX, johnYAdjusted + 96);
        ctx.bezierCurveTo(johnX + 64, johnYAdjusted + 48, johnX + 64, johnYAdjusted - 64, johnX, johnYAdjusted);
        ctx.closePath();
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ffb6c1';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.restore();
        
        if (this.johnSprite && this.johnSprite.complete && this.johnSprite.naturalWidth) {
            // Brilho dourado ao redor do sprite
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(johnX, johnYAdjusted, 40, 0, Math.PI * 2);
            ctx.fill();
            // Desenhar o sprite do John na nova posição
            ctx.drawImage(this.johnSprite, johnX - 32, johnYAdjusted - 64, 64, 64);
        } else {
            // Fallback se a imagem não carregar
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(johnX, johnYAdjusted, 32, 0, Math.PI * 2);
            ctx.fill();
        }
          // === OCEANO COM GRADIENTE ===
        var oceanGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
        oceanGradient.addColorStop(0, '#1E90FF');  // Azul mais claro na superfície
        oceanGradient.addColorStop(0.5, '#0066CC');  // Azul médio
        oceanGradient.addColorStop(1, '#003366');  // Azul escuro nas profundezas
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
          // === ONDAS SUAVES NO OCEANO ===
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for(var i = 0; i < 5; i++) {
            ctx.beginPath();
            var waveY = canvas.height * 0.6 + 20 + i * 15;
            var waveOffset = Date.now() * 0.001 * (i + 1) * 0.3;
            
            for(var x = 0; x < canvas.width; x += 10) {
                var y = waveY + Math.sin(x * 0.03 + waveOffset) * 5;
                if(x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
          // === MURALHA/PARAPEITO DO FORTE ===
        ctx.fillStyle = '#A98867';  // Cor mais quente para o forte
        var fortWallY = canvas.height * 0.75;
        ctx.fillRect(0, fortWallY, canvas.width, canvas.height * 0.25);
          // Textura de pedras na muralha
        ctx.fillStyle = '#8B7355';
        for(var row = 0; row < 2; row++) {
            for(var col = 0; col < 20; col++) {
                var x = col * 40;
                var y = fortWallY + row * 30;
                
                // Varia tamanhos das pedras
                var width = 35 + Math.random() * 5;
                var height = 25 + Math.random() * 5;
                
                ctx.fillRect(x, y, width, height);
            }
        }
        
        // Detalhes da muralha
        ctx.fillStyle = '#B8A088';
        ctx.fillRect(0, fortWallY - 5, canvas.width, 10);
          // Ameias da muralha mais detalhadas
        ctx.fillStyle = '#8B7355';
        for(var i = 0; i < 10; i++) {
            var x = i * 80 + 40;
            ctx.fillRect(x, fortWallY - 25, 35, 25);
            
            // Sombra nas ameias
            ctx.fillStyle = '#71614A';
            ctx.fillRect(x + 30, fortWallY - 25, 5, 25);
            ctx.fillStyle = '#8B7355';
            
            // Detalhes nas ameias
            ctx.strokeStyle = '#71614A';
            ctx.strokeRect(x + 5, fortWallY - 20, 25, 15);
        }
        
        // === PISO DE PEDRA ===
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(0, fortWallY + 30, canvas.width, canvas.height * 0.2);
          // Padrão mais detalhado de pedras no piso
        for(var row = 0; row < 4; row++) {
            for(var col = 0; col < 15; col++) {
                var x = col * 50 + (row % 2) * 25;
                var y = fortWallY + 35 + row * 30;
                
                // Cor base da pedra com variação
                var r = 245 - Math.random() * 15;
                var g = 222 - Math.random() * 15;
                var b = 179 - Math.random() * 15;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                
                ctx.fillRect(x, y, 45, 25);
                
                // Bordas mais suaves das pedras
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 45, 25);
            }
        }
        
        // === BANDEIRAS TREMULANDO ===
        // Mastros
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(80, fortWallY - 70, 6, 50);
        ctx.fillRect(canvas.width - 86, fortWallY - 70, 6, 50);
          // Bandeiras ondulando com animação
        var time = Date.now() * 0.003;
        
        // Bandeira esquerda (vermelha)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(86, fortWallY - 65);
        
        for(var i = 0; i < 25; i++) {
            var x = 86 + i;
            var waveFactor = Math.sin(time + i * 0.2) * 3;
            var y = fortWallY - 65 + waveFactor;
            ctx.lineTo(x, y);
        }
        
        for(var i = 25; i >= 0; i--) {
            var x = 86 + i;
            var waveFactor = Math.sin(time + i * 0.2) * 3;
            var y = fortWallY - 50 + waveFactor;
            ctx.lineTo(x, y);
        }
        
        ctx.fill();
          // Bandeira direita (amarela)
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(canvas.width - 86, fortWallY - 65);
        
        for(var i = 0; i < 25; i++) {
            var x = canvas.width - 86 - i;
            var waveFactor = Math.sin(time + i * 0.2) * 3;
            var y = fortWallY - 65 + waveFactor;
            ctx.lineTo(x, y);
        }
        
        for(var i = 25; i >= 0; i--) {
            var x = canvas.width - 86 - i;
            var waveFactor = Math.sin(time + i * 0.2) * 3;
            var y = fortWallY - 50 + waveFactor;
            ctx.lineTo(x, y);
        }
        
        ctx.fill();
          // === JOHN LENNON E CAMINHO ATÉ ELE ===
        var johnX = canvas.width / 2;
        var johnY = canvas.height * 0.45;
        
        // === CAMINHO BONITO DO MURO ATÉ JOHN LENNON ===
        // Calcular dimensões
        var pathStartY = fortWallY;
        var pathEndY = johnY + 32; // Pés do sprite
        var pathHeight = pathEndY - pathStartY;
        var pathWidth = 60;
        
        // Desenhar caminho estilo escadaria de pedras
        var numSteps = 8;
        var stepHeight = pathHeight / numSteps;
        
        // 1. Base/sombra do caminho
        ctx.fillStyle = 'rgba(90, 77, 65, 0.6)';
        ctx.beginPath();
        ctx.moveTo(johnX - pathWidth/2 - 5, pathStartY);
        ctx.lineTo(johnX + pathWidth/2 + 5, pathStartY);
        ctx.lineTo(johnX + pathWidth/2, pathEndY + 5);
        ctx.lineTo(johnX - pathWidth/2, pathEndY + 5);
        ctx.closePath();
        ctx.fill();
          // 2. Degraus de pedra
        for (var i = 0; i < numSteps; i++) {
            var y = pathStartY + i * stepHeight;
            var stepWidth = pathWidth - (i * 4); // Estreita gradualmente
            
            // Cor base da pedra com variação
            var brightness = 180 + Math.random() * 30;
            ctx.fillStyle = 'rgb(' + brightness + ', ' + (brightness - 30) + ', ' + (brightness - 50) + ')';
            
            // Forma do degrau com bordas arredondadas
            ctx.beginPath();
            ctx.moveTo(johnX - stepWidth/2, y);
            ctx.lineTo(johnX + stepWidth/2, y);
            ctx.lineTo(johnX + (stepWidth-8)/2, y + stepHeight - 2);
            ctx.lineTo(johnX - (stepWidth-8)/2, y + stepHeight - 2);
            ctx.closePath();
            ctx.fill();
            
            // Detalhe/borda do degrau
            ctx.strokeStyle = '#71614A';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Textura/detalhe
            ctx.strokeStyle = 'rgba(113, 97, 74, 0.5)';
            ctx.beginPath();
            for (var j = 0; j < 3; j++) {
                var detailY = y + 2 + j * (stepHeight / 4);
                if (detailY < y + stepHeight - 2) {
                    ctx.moveTo(johnX - stepWidth/2 + 5, detailY);
                    ctx.lineTo(johnX + stepWidth/2 - 5, detailY);
                }
            }
            ctx.stroke();
        }
          // 3. Adicionar efeito de brilho no caminho
        ctx.fillStyle = 'rgba(255, 253, 208, 0.15)';
        for (var i = 0; i < numSteps; i++) {
            if (i % 2 === 0) continue; // Apenas alguns degraus com brilho
            var y = pathStartY + i * stepHeight;
            var stepWidth = pathWidth - (i * 4);
            
            ctx.beginPath();
            ctx.moveTo(johnX - stepWidth/2 + 5, y + 2);
            ctx.lineTo(johnX + stepWidth/2 - 5, y + 2);
            ctx.lineTo(johnX + (stepWidth-8)/2 - 5, y + stepHeight - 4);
            ctx.lineTo(johnX - (stepWidth-8)/2 + 5, y + stepHeight - 4);
            ctx.closePath();
            ctx.fill();
        }
          // 4. Corrimão/Cordas nas laterais
        var ropeGradient = ctx.createLinearGradient(0, pathStartY, 0, pathEndY);
        ropeGradient.addColorStop(0, '#C8A887');
        ropeGradient.addColorStop(0.5, '#DEB887');
        ropeGradient.addColorStop(1, '#C8A887');
        
        ctx.strokeStyle = ropeGradient;
        ctx.lineWidth = 3;
          // Corda esquerda com efeito de caída
        ctx.beginPath();
        ctx.moveTo(johnX - pathWidth/2, pathStartY);
        
        for (var y = pathStartY; y <= pathEndY; y += 10) {
            var xOffset = Math.sin((y - pathStartY) * 0.05) * 3;
            var x = johnX - pathWidth/2 + xOffset;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
          // Corda direita com efeito de caída
        ctx.beginPath();
        ctx.moveTo(johnX + pathWidth/2, pathStartY);
        
        for (var y = pathStartY; y <= pathEndY; y += 10) {
            var xOffset = Math.sin((y - pathStartY) * 0.05) * 3;
            var x = johnX + pathWidth/2 - xOffset;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
          // 5. Pequenos brilhos nos corrimãos
        ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
        for (var i = 0; i < 5; i++) {
            var y = pathStartY + (pathHeight * i / 5);
            
            // Brilho esquerdo
            var leftX = johnX - pathWidth/2 + Math.sin((y - pathStartY) * 0.05) * 3;
            ctx.beginPath();
            ctx.arc(leftX, y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Brilho direito
            var rightX = johnX + pathWidth/2 - Math.sin((y - pathStartY) * 0.05) * 3;
            ctx.beginPath();
            ctx.arc(rightX, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
          // === DESENHAR JOHN LENNON NO TOPO DO CAMINHO ===
        if (this.johnSprite && this.johnSprite.complete && this.johnSprite.naturalWidth) {
            // Suave brilho dourado ao redor do John
            var glowRadius = 40 + Math.sin(Date.now() * 0.002) * 5;
            var gradient = ctx.createRadialGradient(
                johnX, johnY, 10,
                johnX, johnY, glowRadius
            );
            gradient.addColorStop(0, 'rgba(255, 223, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 223, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(johnX, johnY, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Desenhar o sprite do John
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.drawImage(this.johnSprite, johnX - 32, johnY - 64, 64, 64);
            ctx.restore();
            
            // Pequeno destaque para dar mais profundidade
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(johnX - 15, johnY - 45, 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Fallback: círculo vermelho com efeito de brilho
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.arc(johnX, johnY, 32, 0, Math.PI * 2);
            ctx.fill();
              ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        

    }

    // Método para desenhar nuvens
    drawCloud(x, y) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Círculos sobrepostos para formar nuvem
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 15, y - 15, 15, 0, Math.PI * 2);
        ctx.arc(x + 35, y - 15, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // Desenhar NPC/objeto interativo
    drawNPC(level, npcX, npcY, treasureGlowing) {
        const ctx = this.ctx;
        
        if (level < 3) {
            // Interactive object (book, sofa, etc.)
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(npcX-15, npcY-15, 30, 30);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', npcX, npcY+5);
        } else {
            // Não desenhar John Lennon aqui para evitar duplicidade
            // ctx.drawImage(this.johnSprite, npcX - 32, npcY - 64, 64, 64);
        }
    }

    // Desenhar porta de saída
    drawExitDoor() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Exit door at the bottom
        ctx.fillStyle = '#654321';
        ctx.fillRect(370, 570, 60, 30);
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SAIR', 400, 590);
    }

    // Desenhar cena final com Michelle e aliança (John já está desenhado no cenário)
    drawFinalScene() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        // Michelle posicionada para interagir com John que está na ponte
        const centerX = canvas.width / 2;
        const michelleY = canvas.height * 0.75; // Posicionar Michelle no piso do forte
        
        // Michelle
        if (this.michelleSprite.complete && this.michelleSprite.naturalWidth) {
            ctx.drawImage(this.michelleSprite, centerX - 80, michelleY - 32, 64, 64);
        }
        
        // Aliança de noivado flutuando entre Michelle e John
        const ringX = centerX;
        const ringY = canvas.height * 0.6; // Posição entre Michelle e John
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(ringX, ringY, 24, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Pedra da aliança
        ctx.beginPath();
        ctx.arc(ringX, ringY - 20, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#B9F2FF';
        ctx.fill();
        ctx.restore();
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneRenderer;
} else {
    window.SceneRenderer = SceneRenderer;
}
