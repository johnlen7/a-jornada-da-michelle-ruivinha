// ============================================================================
// SceneRenderer — toda a arte do jogo em pixel-art 2D desenhada em código.
// Sem Math.random() por frame: todas as decorações usam seeds fixas para não
// piscar. Elementos animados usam funções determinísticas do tempo (Date.now).
// ============================================================================
(function registerSceneRenderer(window) {
    const FONT = '"Pixelify Sans", Arial';

    // Gerador pseudo-aleatório com seed (mulberry32) — decorações estáveis.
    function mulberry32(seed) {
        let a = seed >>> 0;
        return function next() {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    class SceneRenderer {
        constructor(ctx, canvas) {
            this.ctx = ctx;
            this.canvas = canvas;
            this.W = canvas.width;
            this.H = canvas.height;

            // Decorações pré-computadas (estáveis entre frames)
            const rand = mulberry32(20240817);
            this.skyStars = Array.from({ length: 60 }, () => ({ x: rand() * this.W, y: rand() * 320, s: rand() }));
            this.grassTufts = Array.from({ length: 90 }, () => ({ x: rand() * this.W, y: 330 + rand() * 260, s: rand() }));
            this.mapFlowers = Array.from({ length: 26 }, () => ({ x: 20 + rand() * (this.W - 40), y: 350 + rand() * 220, c: rand() }));
            this.fortStones = Array.from({ length: 60 }, (_, i) => ({
                x: (i % 15) * 54 + (Math.floor(i / 15) % 2) * 27,
                y: Math.floor(i / 15) * 30,
                w: 48 + rand() * 8,
                tone: rand()
            }));
            this.roomDust = Array.from({ length: 14 }, (_, i) => ({ x: 90 + rand() * 620, y: 80 + rand() * 240, p: rand() * 6.28, s: 0.5 + rand() }));
            this.bookSpines = Array.from({ length: 42 }, (_, i) => ({
                shelf: Math.floor(i / 14),
                x: (i % 14) * 13,
                h: 22 + rand() * 8,
                c: ['#C0392B', '#27AE60', '#2980B9', '#F1C40F', '#9B59B6', '#16A085', '#E67E22', '#8E44AD'][Math.floor(rand() * 8)]
            }));
        }

        // --------------------------------------------------------------------
        // Utilitários de desenho
        // --------------------------------------------------------------------
        R(x, y, w, h, color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        }

        grad(x0, y0, x1, y1, stops) {
            const g = this.ctx.createLinearGradient(x0, y0, x1, y1);
            stops.forEach(([pos, color]) => g.addColorStop(pos, color));
            return g;
        }

        fillGrad(x, y, w, h, x0, y0, x1, y1, stops) {
            this.ctx.fillStyle = this.grad(x0, y0, x1, y1, stops);
            this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        }

        circle(x, y, r, color) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }

        ellipse(x, y, rx, ry, color) {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }

        text(str, x, y, size, color, align = 'center', shadow = true) {
            const ctx = this.ctx;
            ctx.font = `${size}px ${FONT}`;
            ctx.textAlign = align;
            if (shadow) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
                ctx.fillText(str, x + 2, y + 2);
            }
            ctx.fillStyle = color;
            ctx.fillText(str, x, y);
        }

        // --------------------------------------------------------------------
        // Elementos de cenário compartilhados
        // --------------------------------------------------------------------
        cloud(x, y, s, alpha = 0.92) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
            ctx.arc(x + 22 * s, y - 8 * s, 22 * s, 0, Math.PI * 2);
            ctx.arc(x + 46 * s, y, 18 * s, 0, Math.PI * 2);
            ctx.arc(x + 23 * s, y + 6 * s, 20 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        driftingClouds(t, baseColor = '#FFFFFF') {
            const speed = 0.006;
            const clouds = [
                { x: 120, y: 70, s: 1.1 }, { x: 380, y: 48, s: 0.8 },
                { x: 610, y: 88, s: 1.0 }, { x: 760, y: 40, s: 0.7 }
            ];
            clouds.forEach((c, i) => {
                const x = ((c.x + t * speed * (1 + i * 0.3)) % (this.W + 160)) - 80;
                this.cloud(x, c.y, c.s, 0.85);
            });
        }

        sun(x, y, r, color = '#FFE873') {
            const ctx = this.ctx;
            const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.2);
            g.addColorStop(0, 'rgba(255, 232, 115, 0.9)');
            g.addColorStop(1, 'rgba(255, 232, 115, 0)');
            ctx.fillStyle = g;
            ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
            this.circle(x, y, r, color);
        }

        tree(x, y, s = 1) {
            this.R(x - 6 * s, y - 30 * s, 12 * s, 30 * s, '#6E4B26');
            this.R(x - 8 * s, y - 34 * s, 16 * s, 6 * s, '#8B6914');
            this.circle(x, y - 48 * s, 22 * s, '#2E7D32');
            this.circle(x - 15 * s, y - 38 * s, 15 * s, '#388E3C');
            this.circle(x + 15 * s, y - 38 * s, 15 * s, '#388E3C');
            this.circle(x - 7 * s, y - 52 * s, 6 * s, '#4CAF50');
            this.circle(x + 8 * s, y - 44 * s, 5 * s, '#4CAF50');
        }

        palm(x, y, s = 1) {
            const ctx = this.ctx;
            ctx.save();
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 7 * s;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + 8 * s, y - 30 * s, x + 4 * s, y - 52 * s);
            ctx.stroke();
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 5 * s;
            for (let i = 0; i < 5; i++) {
                const ang = -Math.PI * 0.9 + i * 0.5;
                ctx.beginPath();
                ctx.moveTo(x + 4 * s, y - 52 * s);
                ctx.quadraticCurveTo(
                    x + 4 * s + Math.cos(ang) * 22 * s, y - 52 * s + Math.sin(ang) * 14 * s,
                    x + 4 * s + Math.cos(ang) * 34 * s, y - 52 * s + Math.sin(ang) * 26 * s
                );
                ctx.stroke();
            }
            ctx.restore();
        }

        roseBush(x, y, s = 1) {
            this.circle(x, y - 8 * s, 14 * s, '#2E7D32');
            this.circle(x - 10 * s, y - 4 * s, 9 * s, '#388E3C');
            this.circle(x + 10 * s, y - 4 * s, 9 * s, '#388E3C');
            const flowers = [[-8, -12], [0, -16], [8, -12], [-4, -6], [6, -5]];
            flowers.forEach(([fx, fy], i) => {
                this.circle(x + fx * s, y + fy * s, 3.4 * s, i % 2 ? '#F06292' : '#E91E63');
                this.circle(x + fx * s, y + fy * s, 1.4 * s, '#FFD1DC');
            });
        }

        bunting(x1, y1, x2, y2, colors, sag = 26) {
            const ctx = this.ctx;
            const mx = (x1 + x2) / 2;
            const my = Math.max(y1, y2) + sag;
            ctx.strokeStyle = 'rgba(60, 40, 20, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(mx, my, x2, y2);
            ctx.stroke();
            const count = 10;
            for (let i = 1; i < count; i++) {
                const t = i / count;
                const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
                const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.moveTo(px - 6, py);
                ctx.lineTo(px + 6, py);
                ctx.lineTo(px, py + 11);
                ctx.closePath();
                ctx.fill();
            }
        }

        stringLights(x1, y1, x2, y2, t, sag = 30) {
            const ctx = this.ctx;
            const mx = (x1 + x2) / 2;
            const my = Math.max(y1, y2) + sag;
            ctx.strokeStyle = 'rgba(50, 40, 30, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(mx, my, x2, y2);
            ctx.stroke();
            const count = 8;
            const bulbColors = ['#FFD54F', '#FF8A80', '#B2DFDB', '#F8BBD0'];
            for (let i = 1; i < count; i++) {
                const tt = i / count;
                const px = (1 - tt) * (1 - tt) * x1 + 2 * (1 - tt) * tt * mx + tt * tt * x2;
                const py = (1 - tt) * (1 - tt) * y1 + 2 * (1 - tt) * tt * my + tt * tt * y2;
                const glow = Math.sin(t * 0.004 + i * 1.3) * 0.3 + 0.7;
                ctx.save();
                ctx.globalAlpha = glow;
                this.circle(px, py + 5, 3.4, bulbColors[i % bulbColors.length]);
                ctx.restore();
            }
        }

        // Trilha de pegadas douradas ligando os pontos do mapa
        dottedPath(points, t, color = '#FFD700') {
            const ctx = this.ctx;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.setLineDash([2, 14]);
            ctx.lineDashOffset = -(t * 0.02) % 16;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();
            ctx.restore();
        }

        // Pétalas caindo (determinísticas no tempo)
        petals(t, count, colorA = '#F8BBD0', colorB = '#F06292') {
            const ctx = this.ctx;
            for (let i = 0; i < count; i++) {
                const fall = 26 + (i * 13) % 30;
                const y = ((i * 89 + t * fall * 0.06) % (this.H + 40)) - 20;
                const x = ((i * 137) % this.W) + Math.sin(t * 0.0012 + i * 1.7) * 34;
                const rot = t * 0.002 + i;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rot);
                ctx.globalAlpha = 0.75;
                ctx.fillStyle = i % 2 ? colorA : colorB;
                ctx.beginPath();
                ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        fireflies(t, count, area) {
            const ctx = this.ctx;
            for (let i = 0; i < count; i++) {
                const x = area.x + ((i * 173) % area.w) + Math.sin(t * 0.0011 + i * 2.1) * 26;
                const y = area.y + ((i * 97) % area.h) + Math.cos(t * 0.0013 + i * 1.4) * 18;
                const glow = Math.sin(t * 0.006 + i * 2.4) * 0.5 + 0.5;
                ctx.save();
                ctx.globalAlpha = 0.25 + glow * 0.75;
                this.circle(x, y, 2.2, '#FFF59D');
                ctx.restore();
            }
        }

        sparkle(x, y, t, phase = 0, color = '#FFF9C4') {
            const ctx = this.ctx;
            const s = (Math.sin(t * 0.005 + phase) * 0.5 + 0.5) * 5 + 2;
            ctx.save();
            ctx.globalAlpha = Math.sin(t * 0.005 + phase) * 0.4 + 0.6;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y - s);
            ctx.lineTo(x + s * 0.35, y - s * 0.35);
            ctx.lineTo(x + s, y);
            ctx.lineTo(x + s * 0.35, y + s * 0.35);
            ctx.lineTo(x, y + s);
            ctx.lineTo(x - s * 0.35, y + s * 0.35);
            ctx.lineTo(x - s, y);
            ctx.lineTo(x - s * 0.35, y - s * 0.35);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // --------------------------------------------------------------------
        // Personagens
        // --------------------------------------------------------------------
        drawCharacter(name, x, y, dir, frame, bob = 0) {
            const sprite = window.PixelSprites.character(name, dir, frame);
            this.ellipse(x, y + 4, 16, 5, 'rgba(0, 0, 0, 0.28)');
            this.ctx.drawImage(sprite, Math.round(x - sprite.width / 2), Math.round(y - sprite.height + 8 + bob));
        }

        drawPlayer(x, y, dir, moving, t) {
            const frame = moving ? (Math.floor(t / 150) % 2 === 0 ? 1 : 2) : 0;
            const bob = moving ? Math.abs(Math.sin(t * 0.02)) * -2 : Math.sin(t * 0.003) * 1.2;
            this.drawCharacter('michelle', x, y, dir, frame, bob);
        }

        drawJohn(x, y, t) {
            const bob = Math.sin(t * 0.003) * 1.2;
            this.drawCharacter('john', x, y, 'down', 0, bob);
        }

        // Marcador de interação: balão dourado com "!" flutuando
        drawMarker(x, y, t, symbol = '!') {
            const ctx = this.ctx;
            const bob = Math.sin(t * 0.005) * 4;
            const by = y - 78 + bob;
            ctx.save();
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 12;
            this.circle(x, by, 13, '#FFD700');
            ctx.restore();
            this.circle(x, by, 13, 'rgba(255, 215, 0, 0.35)');
            this.R(x - 3, by + 11, 6, 4, '#FFD700');
            this.text(symbol, x, by + 6, 16, '#5D4037', 'center', false);
        }

        drawExitDoor() {
            // Zona única de saída: mesma área usada pela lógica do jogo
            const { x, y, w, h } = SceneRenderer.EXIT_ZONE;
            this.R(x, y, w, h, '#5D4037');
            this.R(x + 4, y + 4, w - 8, h - 4, '#8D6E63');
            this.R(x + 8, y + 8, w - 16, h - 8, '#3E2723');
            this.text('SAIR', x + w / 2, y + h - 10, 13, '#FFD700');
        }

        // --------------------------------------------------------------------
        // TELA INICIAL
        // --------------------------------------------------------------------
        drawStartScreen(t) {
            const ctx = this.ctx;
            this.fillGrad(0, 0, this.W, this.H, 0, 0, 0, this.H, [
                [0, '#1B1035'], [0.55, '#3B1D5A'], [1, '#6B2D5C']
            ]);

            // Estrelas
            this.skyStars.forEach((s, i) => {
                const tw = Math.sin(t * 0.004 + i * 1.7) * 0.5 + 0.5;
                ctx.globalAlpha = 0.3 + tw * 0.7;
                this.R(s.x, s.y, 2, 2, '#FFFDE7');
            });
            ctx.globalAlpha = 1;

            // Lua
            this.circle(680, 90, 34, '#FFF9C4');
            this.circle(668, 82, 30, 'rgba(27, 16, 53, 0.35)');

            // Castelo ao longe (silhueta)
            this.R(80, 330, 60, 120, '#241447');
            this.R(70, 310, 24, 30, '#241447');
            this.R(126, 310, 24, 30, '#241447');
            this.R(70, 300, 24, 10, '#31215C');
            this.R(126, 300, 24, 10, '#31215C');
            this.R(95, 290, 30, 44, '#241447');
            this.R(95, 280, 30, 10, '#31215C');
            [[86, 350], [110, 350], [98, 380], [86, 400], [110, 400]].forEach(([wx, wy], i) => {
                const glow = Math.sin(t * 0.003 + i) * 0.3 + 0.7;
                ctx.globalAlpha = glow;
                this.R(wx, wy, 8, 12, '#FFD54F');
            });
            ctx.globalAlpha = 1;

            // Colinas
            this.ctx.fillStyle = '#2E1A47';
            this.ctx.beginPath();
            this.ctx.moveTo(0, 460);
            this.ctx.quadraticCurveTo(200, 400, 420, 455);
            this.ctx.quadraticCurveTo(620, 505, 800, 450);
            this.ctx.lineTo(800, 600);
            this.ctx.lineTo(0, 600);
            this.ctx.closePath();
            this.ctx.fill();
            this.R(0, 480, this.W, 120, '#241540');

            // Corações flutuando
            const heart = window.PixelSprites.object('heart');
            for (let i = 0; i < 6; i++) {
                const hx = ((i * 173 + t * 0.018) % (this.W + 60)) - 30;
                const hy = 480 - ((t * 0.03 + i * 90) % 260);
                const alpha = Math.max(0, Math.min(1, (480 - hy) / 120)) * 0.8;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.drawImage(heart, hx, hy, 22, 20);
                ctx.restore();
            }

            // Título
            this.text('✨ Mini Game do Amor ✨', this.W / 2, 120, 22, '#F8BBD0');
            this.text('A Jornada de Michelle', this.W / 2, 178, 44, '#FFD700');

            const pulse = Math.sin(t * 0.005) * 0.3 + 0.7;
            ctx.save();
            ctx.globalAlpha = pulse;
            this.text('Aperte qualquer tecla ou toque para começar', this.W / 2, 300, 20, '#FFFFFF', 'center', false);
            ctx.restore();

            this.text('Duas temporadas esperando por você ❤️', this.W / 2, 340, 16, '#F2D6FF');

            // Moldura
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.strokeRect(16, 16, this.W - 32, this.H - 32);
        }

        // Fundo animado atrás da seleção de temporada
        drawSeasonBackdrop(t) {
            this.fillGrad(0, 0, this.W, this.H, 0, 0, 0, this.H, [
                [0, '#2A1749'], [0.6, '#59306B'], [1, '#8E3B63']
            ]);
            this.skyStars.forEach((s, i) => {
                const tw = Math.sin(t * 0.004 + i * 2.3) * 0.5 + 0.5;
                this.ctx.globalAlpha = 0.25 + tw * 0.6;
                this.R(s.x, s.y * 1.6, 2, 2, '#FFFDE7');
            });
            this.ctx.globalAlpha = 1;
            const heart = window.PixelSprites.object('heart');
            const ring = window.PixelSprites.object('ring');
            for (let i = 0; i < 8; i++) {
                const hx = ((i * 211 + t * 0.012) % (this.W + 60)) - 30;
                const hy = 560 - ((t * 0.022 + i * 110) % 620);
                this.ctx.save();
                this.ctx.globalAlpha = 0.5;
                this.ctx.drawImage(i % 3 === 0 ? ring : heart, hx, hy, 24, 22);
                this.ctx.restore();
            }
            this.petals(t, 10);
        }

        // --------------------------------------------------------------------
        // MAPA (as duas temporadas)
        // --------------------------------------------------------------------
        drawMap(theme, locations, px, py, playerDir, playerMoving, t) {
            if (theme === 's2') {
                // Entardecer dourado/rosa da temporada do casamento
                this.fillGrad(0, 0, this.W, 330, 0, 0, 0, 330, [
                    [0, '#FFB88A'], [0.55, '#FF9AAE'], [1, '#E87BA0']
                ]);
                this.sun(640, 90, 30, '#FFE0A3');
                this.driftingClouds(t);
                this.R(0, 300, this.W, 300, '#79C47C');
                this.fillGrad(0, 300, this.W, 300, 0, 300, 0, 600, [
                    [0, '#8BCF8B'], [1, '#5FA85F']
                ]);
            } else {
                this.fillGrad(0, 0, this.W, 330, 0, 0, 0, 330, [
                    [0, '#6FB1E8'], [1, '#CDE7F5']
                ]);
                this.sun(110, 80, 26);
                this.driftingClouds(t);
                // Montanhas
                this.ctx.fillStyle = '#7E94A8';
                this.ctx.beginPath();
                this.ctx.moveTo(0, 300);
                this.ctx.lineTo(150, 190);
                this.ctx.lineTo(300, 260);
                this.ctx.lineTo(470, 170);
                this.ctx.lineTo(640, 250);
                this.ctx.lineTo(800, 200);
                this.ctx.lineTo(800, 310);
                this.ctx.lineTo(0, 310);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.fillStyle = '#9DB4C6';
                this.ctx.beginPath();
                this.ctx.moveTo(0, 300);
                this.ctx.lineTo(220, 230);
                this.ctx.lineTo(430, 290);
                this.ctx.lineTo(660, 225);
                this.ctx.lineTo(800, 270);
                this.ctx.lineTo(800, 310);
                this.ctx.lineTo(0, 310);
                this.ctx.closePath();
                this.ctx.fill();
                this.R(0, 300, this.W, 300, '#58B368');
                this.fillGrad(0, 300, this.W, 300, 0, 300, 0, 600, [
                    [0, '#63BE6F'], [1, '#3E9450']
                ]);
            }

            // Textura da grama
            this.grassTufts.forEach((g) => {
                const c = g.s > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)';
                this.R(g.x, g.y, 3, 6, c);
            });

            // Flores do mapa
            this.mapFlowers.forEach((f) => {
                const colors = theme === 's2'
                    ? ['#F06292', '#FFD54F', '#FFFFFF', '#E91E63']
                    : ['#FF69B4', '#FFD700', '#FFFFFF', '#BA68C8'];
                this.circle(f.x, f.y, 3, colors[Math.floor(f.c * colors.length)]);
                this.circle(f.x, f.y, 1.2, '#FFF9C4');
            });

            // Lago (T1) ou fonte de coração (T2)
            if (theme === 's2') {
                this.ellipse(400, 330, 74, 26, '#7FB3D5');
                this.ellipse(400, 328, 66, 21, '#A9CCE3');
                const heart = window.PixelSprites.object('heart');
                this.ctx.drawImage(heart, 386, 296 + Math.sin(t * 0.003) * 3, 28, 26);
            } else {
                this.ellipse(400, 330, 78, 27, '#3D6E9E');
                this.ellipse(400, 327, 68, 22, '#5B94C7');
                for (let i = 0; i < 3; i++) {
                    const rx = 400 + Math.sin(t * 0.0016 + i * 2.1) * 30;
                    this.ellipse(rx, 327 + i * 5, 10, 2.4, 'rgba(255,255,255,0.35)');
                }
            }

            // Trilha ligando os lugares
            const pathPoints = locations.map((l) => ({ x: l.x, y: l.y + 30 }));
            this.dottedPath(pathPoints, t, theme === 's2' ? '#FFE082' : '#FFD700');

            // Árvores / roseiras
            if (theme === 's2') {
                this.roseBush(80, 560, 1.3);
                this.roseBush(720, 560, 1.3);
                this.tree(60, 330, 0.9);
                this.tree(740, 330, 0.9);
            } else {
                this.tree(80, 570, 1.2);
                this.tree(720, 570, 1.2);
                this.tree(60, 330, 0.9);
                this.tree(745, 340, 0.9);
            }

            // Construções
            locations.forEach((loc, i) => this.drawMapBuilding(theme, i, loc, t));

            // Jogadora
            this.drawPlayer(px, py, playerDir, playerMoving, t);
        }

        drawMapBuilding(theme, index, loc, t) {
            const ctx = this.ctx;
            const { x, y } = loc;
            const unlocked = loc.unlocked;

            ctx.save();
            if (!unlocked) ctx.globalAlpha = 0.45;

            // Brilho pulsante no próximo destino disponível
            if (unlocked && loc.isNext) {
                const glow = Math.sin(t * 0.005) * 0.25 + 0.55;
                ctx.save();
                ctx.globalAlpha = glow * 0.5;
                this.circle(x, y - 10, 52, '#FFF9C4');
                ctx.restore();
            }

            // Sombra no chão
            this.ellipse(x, y + 34, 44, 9, 'rgba(0,0,0,0.22)');

            if (theme === 's2') {
                this.drawMapBuildingS2(index, x, y, t);
            } else {
                this.drawMapBuildingS1(index, x, y, t);
            }
            ctx.restore();

            // Nome
            this.text(loc.name, x, y + 56, 12, unlocked ? '#FFFFFF' : '#B9B9B9');

            if (!unlocked) {
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🔒', x, y - 52);
            }
        }

        drawMapBuildingS1(index, x, y, t) {
            if (index === 0) {
                // Torre de Hogwarts
                this.R(x - 26, y - 34, 52, 66, '#6D4C5E');
                this.R(x - 32, y - 44, 64, 12, '#54384A');
                this.R(x - 20, y - 58, 40, 18, '#6D4C5E');
                this.R(x - 20, y - 66, 40, 10, '#3F2C3E');
                this.R(x - 6, y - 84, 12, 20, '#3F2C3E');
                this.R(x - 9, y - 90, 18, 8, '#2C1E31');
                [[-16, -22], [6, -22], [-16, -2], [6, -2]].forEach(([dx, dy], i) => {
                    const glow = Math.sin(t * 0.004 + i * 1.4) * 0.3 + 0.7;
                    this.ctx.globalAlpha = glow;
                    this.R(x + dx, y + dy, 10, 14, '#FFD54F');
                    this.ctx.globalAlpha = 1;
                });
                this.R(x - 8, y + 10, 16, 22, '#3F2C3E');
            } else if (index === 1) {
                // Café Central Perk
                this.R(x - 34, y - 22, 68, 54, '#B5542D');
                this.R(x - 34, y - 30, 68, 10, '#8E3B1F');
                for (let i = 0; i < 5; i++) {
                    this.R(x - 34 + i * 14, y - 42, 13, 12, i % 2 ? '#F5EBDD' : '#E8641F');
                }
                this.R(x - 26, y - 8, 22, 18, '#F5D9A8');
                this.R(x + 6, y - 8, 22, 18, '#F5D9A8');
                this.R(x - 10, y + 12, 20, 20, '#5D2E17');
                this.text('CENTRAL PERK', x, y - 46, 9, '#7B3F00', 'center', false);
            } else if (index === 2) {
                // Portal do caminho
                this.R(x - 26, y - 30, 8, 62, '#6E4B26');
                this.R(x + 18, y - 30, 8, 62, '#6E4B26');
                this.R(x - 30, y - 40, 60, 12, '#8D6E63');
                this.R(x - 30, y - 44, 60, 6, '#5D4037');
                const sign = window.PixelSprites.object('signPost');
                this.ctx.drawImage(sign, x - 24, y - 26, 48, 42);
                this.tree(x - 44, y + 26, 0.7);
                this.tree(x + 46, y + 26, 0.7);
            } else {
                // Forte de Copacabana
                this.R(x - 44, y - 10, 88, 42, '#B8A088');
                for (let i = 0; i < 5; i++) {
                    this.R(x - 44 + i * 18, y - 20, 12, 12, '#B8A088');
                }
                this.R(x - 14, y - 46, 28, 38, '#A98867');
                this.R(x - 18, y - 54, 36, 10, '#8B7355');
                this.R(x - 2, y - 72, 4, 20, '#6E4B26');
                const wave = Math.sin(t * 0.006) * 3;
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.beginPath();
                this.ctx.moveTo(x + 2, y - 70);
                this.ctx.lineTo(x + 22, y - 66 + wave);
                this.ctx.lineTo(x + 2, y - 60);
                this.ctx.closePath();
                this.ctx.fill();
                this.R(x - 8, y + 8, 16, 24, '#5D4037');
            }
        }

        drawMapBuildingS2(index, x, y, t) {
            if (index === 0) {
                // Salão de festas
                this.R(x - 36, y - 26, 72, 58, '#E8D3B9');
                this.R(x - 40, y - 34, 80, 10, '#C9A97E');
                this.R(x - 12, y - 48, 24, 16, '#C9A97E');
                this.R(x - 14, y - 54, 28, 8, '#B08D5F');
                this.R(x - 26, y - 12, 16, 20, '#7FB3D5');
                this.R(x + 10, y - 12, 16, 20, '#7FB3D5');
                this.R(x - 8, y + 8, 16, 24, '#8D6E63');
                // Balões
                const bob = Math.sin(t * 0.004) * 3;
                [['#F06292', -30], ['#FFD54F', 30], ['#B2DFDB', 0]].forEach(([c, dx], i) => {
                    this.circle(x + dx, y - 62 - bob - i * 2, 7, c);
                    this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + dx, y - 55 - bob - i * 2);
                    this.ctx.lineTo(x + dx * 0.9, y - 36);
                    this.ctx.stroke();
                });
            } else if (index === 1) {
                // Ateliê
                this.R(x - 34, y - 24, 68, 56, '#F3CFDD');
                this.R(x - 38, y - 32, 76, 10, '#D899B3');
                for (let i = 0; i < 5; i++) {
                    this.R(x - 34 + i * 14, y - 42, 13, 10, i % 2 ? '#FFF0F5' : '#EC407A');
                }
                this.R(x - 24, y - 8, 48, 24, '#FCE4EC');
                const dress = window.PixelSprites.object('mannequin');
                this.ctx.drawImage(dress, x - 13, y - 6, 26, 39);
                this.text('ATELIÊ', x, y - 46, 10, '#AD1457', 'center', false);
            } else if (index === 2) {
                // Arco de largada do caminho
                this.R(x - 28, y - 34, 9, 66, '#8D6E63');
                this.R(x + 19, y - 34, 9, 66, '#8D6E63');
                this.R(x - 32, y - 46, 64, 14, '#A1887F');
                const flowers = ['#F06292', '#FFD54F', '#FFFFFF'];
                for (let i = 0; i < 5; i++) {
                    this.circle(x - 24 + i * 12, y - 40, 5, flowers[i % 3]);
                }
                // Cones do percurso
                this.R(x - 12, y + 16, 8, 10, '#E8641F');
                this.R(x + 4, y + 16, 8, 10, '#E8641F');
                this.R(x - 13, y + 20, 10, 2, '#FFFFFF');
                this.R(x + 3, y + 20, 10, 2, '#FFFFFF');
            } else {
                // Altar do jardim
                this.R(x - 40, y + 22, 80, 10, '#B08D5F');
                // Arco de flores
                const ctx = this.ctx;
                ctx.strokeStyle = '#7CBF7A';
                ctx.lineWidth = 7;
                ctx.beginPath();
                ctx.arc(x, y + 14, 34, Math.PI, 0);
                ctx.stroke();
                const fl = ['#F06292', '#FFD54F', '#FFFFFF', '#E91E63'];
                for (let i = 0; i <= 8; i++) {
                    const ang = Math.PI - (i / 8) * Math.PI;
                    const fx = x + Math.cos(ang) * 34;
                    const fy = y + 14 - Math.sin(ang) * 34;
                    this.circle(fx, fy, 5.5, fl[i % 4]);
                    this.circle(fx, fy, 2.2, '#FFF9C4');
                }
                // Tapete
                this.R(x - 12, y + 2, 24, 32, '#F8BBD0');
                this.R(x - 12, y + 2, 24, 4, '#F06292');
            }
        }
    }

    // Zona única da porta de saída (usada por renderização E lógica)
    SceneRenderer.EXIT_ZONE = { x: 368, y: 556, w: 64, h: 40 };

    window.SceneRenderer = SceneRenderer;
})(window);

// ============================================================================
// Parte 2 — cenários das fases (Temporada 1 e 2) e a fase de obstáculos.
// Estende SceneRenderer via prototype para manter o arquivo organizado.
// ============================================================================
(function registerSceneLevels(window) {
    const proto = window.SceneRenderer.prototype;

    // Desenha o objeto interativo da fase (com brilho suave)
    proto.drawInteractObject = function drawInteractObject(name, x, y, t) {
        if (!name) return;
        const sprite = window.PixelSprites.object(name);
        if (!sprite) return;
        const scaleByName = { mug: 2, sortingHat: 2.2, churrosCart: 1.6, cakeStand: 1.5, mannequin: 1.4 };
        const k = scaleByName[name] || 1.5;
        const w = sprite.width * k;
        const h = sprite.height * k;
        const ctx = this.ctx;
        ctx.save();
        const glow = Math.sin(t * 0.004) * 0.25 + 0.5;
        ctx.globalAlpha = glow * 0.35;
        this.circle(x, y - h / 2, Math.max(w, h) * 0.62, '#FFF9C4');
        ctx.restore();
        ctx.drawImage(sprite, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 1 — Fase 0: Quarto de Hogwarts
    // ------------------------------------------------------------------------
    proto.drawHogwartsRoom = function drawHogwartsRoom(t, interact) {
        const ctx = this.ctx;
        const W = this.W;

        // Paredes de pedra
        this.fillGrad(0, 0, W, 400, 0, 0, 0, 400, [
            [0, '#3A2E50'], [1, '#584A70']
        ]);
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 10; col++) {
                const bx = col * 84 + (row % 2) * 42;
                this.R(bx, row * 50, 80, 46, row % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)');
            }
        }

        // Piso de madeira
        this.fillGrad(0, 400, W, 200, 0, 400, 0, 600, [
            [0, '#6B4A2F'], [1, '#4E331F']
        ]);
        for (let i = 0; i < 9; i++) {
            this.R(0, 408 + i * 22, W, 2, 'rgba(0,0,0,0.25)');
        }
        this.R(0, 396, W, 8, '#3E2A1A');

        // Janelas góticas com céu noturno
        [300, 460].forEach((wx) => {
            this.R(wx - 4, 56, 88, 148, '#2C2140');
            this.R(wx, 60, 80, 140, '#1A2340');
            // arco
            ctx.fillStyle = '#2C2140';
            ctx.beginPath();
            ctx.arc(wx + 40, 60, 40, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#1A2340';
            ctx.beginPath();
            ctx.arc(wx + 40, 62, 37, Math.PI, 0);
            ctx.fill();
            // estrelas e lua na janela
            this.R(wx + 14, 78, 2, 2, '#FFFDE7');
            this.R(wx + 52, 96, 2, 2, '#FFFDE7');
            this.R(wx + 30, 116, 2, 2, '#FFFDE7');
            this.circle(wx + 58, 84, 10, '#FFF9C4');
            this.R(wx + 36, 60, 8, 140, '#2C2140');
            this.R(wx, 124, 80, 8, '#2C2140');
        });

        // Estante de livros
        this.R(64, 110, 192, 210, '#5D4037');
        this.R(70, 116, 180, 198, '#4E342E');
        for (let shelf = 0; shelf < 3; shelf++) {
            const sy = 130 + shelf * 62;
            this.R(74, sy + 40, 172, 6, '#6D4C41');
            this.bookSpines.filter((b) => b.shelf === shelf).forEach((b) => {
                this.R(78 + b.x, sy + 40 - b.h, 10, b.h, b.c);
                this.R(78 + b.x, sy + 40 - b.h, 10, 3, 'rgba(255,255,255,0.25)');
            });
        }

        // Banner da Corvinal
        this.R(18, 120, 34, 130, '#0E1A40');
        this.R(18, 120, 34, 8, '#B08D3C');
        this.R(32, 250, 6, 14, '#0E1A40');
        'CORVINAL'.split('').forEach((letter, i) => {
            this.text(letter, 35, 146 + i * 14, 12, '#B08D3C', 'center', false);
        });

        // Lareira
        this.R(636, 150, 120, 130, '#6D4C41');
        this.R(646, 160, 100, 110, '#3E2723');
        this.R(630, 140, 132, 12, '#8D6E63');
        const flame = Math.sin(t * 0.02) * 3;
        this.R(668, 226 - flame, 14, 26 + flame, '#E8641F');
        this.R(688, 218 + flame, 16, 34 - flame, '#F39C12');
        this.R(708, 230 - flame, 12, 22 + flame, '#E8641F');
        this.R(690, 238, 12, 14, '#FFD54F');
        ctx.save();
        ctx.globalAlpha = 0.25 + Math.sin(t * 0.01) * 0.08;
        this.circle(696, 226, 60, '#F39C12');
        ctx.restore();

        // Cama com dossel
        this.R(540, 330, 200, 14, '#5D4037');
        this.R(546, 344, 188, 60, '#4A148C');
        this.R(546, 344, 188, 12, '#6A1B9A');
        this.R(534, 320, 10, 130, '#4E342E');
        this.R(736, 320, 10, 130, '#4E342E');
        this.R(530, 312, 220, 10, '#4E342E');
        this.R(556, 352, 40, 22, '#FCE4EC');
        this.R(660, 352, 40, 22, '#FCE4EC');
        this.R(546, 322, 10, 60, 'rgba(142, 36, 170, 0.55)');
        this.R(724, 322, 10, 60, 'rgba(142, 36, 170, 0.55)');

        // Velas flutuantes
        [[180, 90], [290, 70], [590, 84], [680, 66]].forEach(([cx, cy], i) => {
            const bob = Math.sin(t * 0.003 + i * 1.6) * 5;
            ctx.save();
            ctx.globalAlpha = 0.5;
            this.circle(cx + 3, cy + bob + 4, 10, '#FFD54F');
            ctx.restore();
            this.R(cx, cy + bob, 6, 16, '#FFF8E1');
            this.R(cx + 1, cy + bob - 5, 4, 6, '#F39C12');
        });

        // Poeira mágica
        this.roomDust.forEach((d, i) => {
            const dx = d.x + Math.sin(t * 0.001 * d.s + d.p) * 24;
            const dy = d.y + Math.cos(t * 0.0013 * d.s + d.p) * 16;
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(t * 0.004 + i) * 0.25;
            this.circle(dx, dy, 2, '#CE93D8');
            ctx.restore();
        });

        // Mesa com o Chapéu Seletor (ponto de interação)
        if (interact) {
            this.R(interact.x - 44, interact.y - 12, 88, 12, '#6D4C41');
            this.R(interact.x - 38, interact.y, 10, 40, '#5D4037');
            this.R(interact.x + 28, interact.y, 10, 40, '#5D4037');
            this.drawInteractObject('sortingHat', interact.x, interact.y - 10, t);
        }
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 1 — Fase 1: Central Perk
    // ------------------------------------------------------------------------
    proto.drawCentralPerk = function drawCentralPerk(t, interact) {
        const ctx = this.ctx;
        const W = this.W;

        // Parede e rodapé de tijolos
        this.fillGrad(0, 0, W, 420, 0, 0, 0, 420, [
            [0, '#D89B66'], [1, '#C98B5E']
        ]);
        this.R(0, 330, W, 90, '#8B5A2B');
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 14; col++) {
                const bx = col * 60 + (row % 2) * 30;
                this.R(bx, 334 + row * 28, 56, 24, row % 2 ? '#7A4A21' : '#96622E');
            }
        }

        // Piso
        this.fillGrad(0, 420, W, 180, 0, 420, 0, 600, [
            [0, '#A0662C'], [1, '#7A4A21']
        ]);
        for (let i = 0; i < 7; i++) this.R(0, 428 + i * 26, W, 2, 'rgba(0,0,0,0.18)');

        // Janela com letreiro
        this.R(250, 60, 300, 150, '#5D4037');
        this.R(258, 68, 284, 134, '#2E3B4E');
        this.R(268, 150, 60, 52, '#1C2530');
        this.R(340, 130, 46, 72, '#232F3E');
        this.R(400, 156, 70, 46, '#1C2530');
        this.R(480, 138, 50, 64, '#232F3E');
        this.R(250, 130, 300, 6, '#5D4037');
        this.R(394, 60, 8, 150, '#5D4037');
        ctx.save();
        ctx.shadowColor = '#FFB74D';
        ctx.shadowBlur = 16;
        this.text('CENTRAL PERK', 400, 106, 26, '#FFE0B2', 'center', false);
        ctx.restore();

        // Tapete
        this.ellipse(400, 470, 190, 40, '#A03048');
        this.ellipse(400, 470, 160, 30, '#C0455E');

        // Sofá laranja icônico
        this.R(268, 300, 264, 26, '#D35400');
        this.R(250, 296, 26, 96, '#D35400');
        this.R(524, 296, 26, 96, '#D35400');
        this.R(276, 322, 248, 70, '#E8641F');
        this.R(284, 330, 74, 54, '#F47B20');
        this.R(364, 330, 74, 54, '#F47B20');
        this.R(444, 330, 74, 54, '#F47B20');
        this.R(276, 322, 248, 8, '#B34700');

        // Poltrona roxa
        this.R(96, 330, 88, 66, '#6C3483');
        this.R(80, 326, 22, 74, '#6C3483');
        this.R(178, 326, 22, 74, '#6C3483');
        this.R(104, 338, 72, 50, '#8E44AD');

        // Mesa de centro + caneca (interação)
        this.R(330, 430, 140, 14, '#6D4C41');
        this.R(340, 444, 12, 34, '#5D4037');
        this.R(448, 444, 12, 34, '#5D4037');
        this.R(356, 414, 34, 20, '#F8BBD0');
        if (interact) {
            this.drawInteractObject('mug', interact.x, interact.y + 14, t);
        }

        // Balcão com máquina de café
        this.R(600, 240, 170, 90, '#7A4A21');
        this.R(594, 232, 182, 12, '#96622E');
        this.R(640, 150, 90, 88, '#37474F');
        this.R(648, 158, 74, 26, '#546E7A');
        this.R(650, 190, 30, 40, '#263238');
        const steam = (sx) => {
            ctx.save();
            ctx.globalAlpha = 0.4 + Math.sin(t * 0.005 + sx) * 0.2;
            ctx.strokeStyle = '#ECEFF1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(sx, 140);
            ctx.quadraticCurveTo(sx - 6, 126 + Math.sin(t * 0.004) * 3, sx, 112);
            ctx.quadraticCurveTo(sx + 6, 98, sx, 86);
            ctx.stroke();
            ctx.restore();
        };
        steam(664);
        steam(690);

        // Menu
        this.R(600, 40, 110, 90, '#3E2723');
        this.R(606, 46, 98, 78, '#FFF8E1');
        this.text('MENU', 655, 66, 13, '#3E2723', 'center', false);
        this.text('café ... 2', 655, 86, 10, '#5D4037', 'center', false);
        this.text('latte ... 3', 655, 100, 10, '#5D4037', 'center', false);
        this.text('muffin .. 3', 655, 114, 10, '#5D4037', 'center', false);

        // Luminárias
        [[200, 90], [400, 150]].forEach(([lx, ly]) => {
            this.R(lx - 2, 0, 4, ly - 20, '#3E2723');
            ctx.save();
            ctx.globalAlpha = 0.35;
            this.circle(lx, ly, 34, '#FFD54F');
            ctx.restore();
            this.circle(lx, ly, 16, '#FFC107');
        });

        // Planta
        this.R(740, 370, 34, 40, '#8D6E63');
        this.circle(757, 356, 22, '#2E7D32');
        this.circle(744, 346, 13, '#388E3C');
        this.circle(770, 346, 13, '#388E3C');
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 1 — Fase 2: Caminho para o Forte (calçadão)
    // ------------------------------------------------------------------------
    proto.drawBeachPath = function drawBeachPath(t, interact) {
        const ctx = this.ctx;
        const W = this.W;

        // Céu e mar
        this.fillGrad(0, 0, W, 240, 0, 0, 0, 240, [
            [0, '#7EC8F0'], [1, '#CDEFFC']
        ]);
        this.sun(120, 70, 26);
        this.driftingClouds(t);

        this.fillGrad(0, 220, W, 130, 0, 220, 0, 350, [
            [0, '#2E86C1'], [1, '#5DADE2']
        ]);
        // Ondas
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            const wy = 240 + i * 26;
            for (let x = 0; x <= W; x += 16) {
                const yy = wy + Math.sin(x * 0.03 + t * 0.002 + i) * 5;
                if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
            }
            ctx.stroke();
        }

        // Forte ao longe
        ctx.save();
        ctx.globalAlpha = 0.75;
        this.R(640, 196, 90, 26, '#8B7355');
        this.R(664, 176, 34, 22, '#8B7355');
        this.R(640, 190, 14, 8, '#8B7355');
        this.R(716, 190, 14, 8, '#8B7355');
        ctx.restore();

        // Areia
        this.R(0, 350, W, 30, '#F0D9A8');

        // Calçadão de Copacabana (padrão de ondas)
        this.R(0, 380, W, 220, '#F5EFDD');
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 14;
        for (let row = 0; row < 5; row++) {
            const wy = 415 + row * 44;
            ctx.beginPath();
            for (let x = -20; x <= W + 20; x += 20) {
                const yy = wy + Math.sin((x + row * 40) * 0.035) * 12;
                if (x === -20) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
            }
            ctx.stroke();
        }

        // Palmeiras
        this.palm(90, 380, 1.1);
        this.palm(240, 372, 0.9);
        this.palm(720, 378, 1.0);

        // Gaivotas cruzando o céu
        const gull = window.PixelSprites.object('pigeon', Math.floor(t / 220) % 2);
        for (let i = 0; i < 3; i++) {
            const gx = ((t * 0.05 + i * 260) % (W + 120)) - 60;
            const gy = 90 + i * 34 + Math.sin(t * 0.003 + i) * 8;
            ctx.drawImage(gull, gx, gy, 34, 24);
        }

        // Barraca de churros (interação)
        if (interact) {
            this.ellipse(interact.x, interact.y + 6, 46, 9, 'rgba(0,0,0,0.2)');
            this.drawInteractObject('churrosCart', interact.x, interact.y, t);
        }
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 1 — Fase 3: Forte de Copacabana (o pedido)
    // ------------------------------------------------------------------------
    proto.drawFort = function drawFort(t, johnPos) {
        const ctx = this.ctx;
        const W = this.W;

        // Céu de pôr do sol
        this.fillGrad(0, 0, W, 330, 0, 0, 0, 330, [
            [0, '#5B2C6F'], [0.5, '#C1446E'], [1, '#FF9A5A']
        ]);
        this.sun(400, 210, 34, '#FFD27F');

        // Mar com reflexo do sol
        this.fillGrad(0, 300, W, 130, 0, 300, 0, 430, [
            [0, '#7C3A5E'], [1, '#3E2A55']
        ]);
        for (let i = 0; i < 12; i++) {
            const ry = 310 + i * 10;
            const rw = 26 - i * 1.6 + Math.sin(t * 0.003 + i) * 6;
            ctx.save();
            ctx.globalAlpha = 0.35;
            this.R(400 - rw, ry, rw * 2, 4, '#FFD27F');
            ctx.restore();
        }

        // Muralha do forte (pedras com seed fixa — sem flicker)
        this.R(0, 430, W, 60, '#A98867');
        this.fortStones.slice(0, 30).forEach((s) => {
            const tone = 150 + s.tone * 40;
            this.R(s.x, 432 + (s.y % 60), s.w, 26, `rgb(${tone}, ${tone - 22}, ${tone - 48})`);
        });
        this.R(0, 424, W, 10, '#C4A882');
        // Ameias
        for (let i = 0; i < 10; i++) {
            this.R(i * 82 + 30, 398, 38, 28, '#A98867');
            this.R(i * 82 + 30, 398, 6, 28, 'rgba(0,0,0,0.18)');
        }

        // Piso
        this.fillGrad(0, 490, W, 110, 0, 490, 0, 600, [
            [0, '#C9B08A'], [1, '#A98F68']
        ]);
        this.fortStones.slice(30).forEach((s) => {
            const tone = 190 + s.tone * 30;
            this.R(s.x, 496 + (s.y % 90), s.w, 26, `rgba(${tone}, ${tone - 20}, ${tone - 55}, 0.55)`);
        });

        // Caminho dourado até o John
        const jx = johnPos ? johnPos.x : 400;
        const jy = johnPos ? johnPos.y : 250;
        ctx.fillStyle = '#D9A441';
        ctx.beginPath();
        ctx.moveTo(jx - 34, 560);
        ctx.lineTo(jx + 34, 560);
        ctx.lineTo(jx + 16, jy + 8);
        ctx.lineTo(jx - 16, jy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        ctx.stroke();
        for (let i = 1; i < 7; i++) {
            const sy = jy + 8 + (560 - jy - 8) * (i / 7);
            const sw = 16 + (34 - 16) * (i / 7);
            this.R(jx - sw, sy, sw * 2, 2, 'rgba(139, 105, 20, 0.6)');
        }
        // Pétalas no caminho
        for (let i = 0; i < 10; i++) {
            const py = jy + 30 + ((i * 53) % 220);
            const px = jx + Math.sin(i * 2.3) * 20;
            this.circle(px, py, 2.5, i % 2 ? '#F8BBD0' : '#F06292');
        }
        // Postes com lanternas
        [[jx - 56, 545], [jx + 56, 545], [jx - 44, 500], [jx + 44, 500]].forEach(([px, py], i) => {
            this.R(px - 2, py, 4, 44, '#4E342E');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(t * 0.005 + i) * 0.2;
            this.circle(px, py - 4, 10, '#FFD54F');
            ctx.restore();
            this.R(px - 4, py - 10, 8, 10, '#FFC107');
        });

        // Coração atrás do John + glow
        if (johnPos) {
            ctx.save();
            const pulse = Math.sin(t * 0.004) * 0.15 + 0.85;
            ctx.globalAlpha = 0.85;
            ctx.shadowColor = '#FF5A8A';
            ctx.shadowBlur = 34;
            ctx.fillStyle = '#FF3366';
            ctx.beginPath();
            ctx.moveTo(jx, jy - 58 * pulse - 20);
            ctx.bezierCurveTo(jx - 44, jy - 96, jx - 46, jy - 30, jx, jy - 8);
            ctx.bezierCurveTo(jx + 46, jy - 30, jx + 44, jy - 96, jx, jy - 58 * pulse - 20);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            this.drawJohn(jx, jy, t);
        }

        // Bandeiras
        [[80, '#E74C3C'], [W - 84, '#F1C40F']].forEach(([fx, color]) => {
            this.R(fx, 340, 5, 60, '#4E342E');
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(fx + 5, 344);
            for (let i = 0; i <= 26; i += 2) {
                ctx.lineTo(fx + 5 + i, 344 + Math.sin(t * 0.008 + i * 0.3) * 3);
            }
            for (let i = 26; i >= 0; i -= 2) {
                ctx.lineTo(fx + 5 + i, 360 + Math.sin(t * 0.008 + i * 0.3) * 3);
            }
            ctx.closePath();
            ctx.fill();
        });

        this.fireflies(t, 10, { x: 60, y: 380, w: W - 120, h: 180 });
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 2 — Fase 0: Salão de Festas
    // ------------------------------------------------------------------------
    proto.drawHall = function drawHall(t, interact) {
        const ctx = this.ctx;
        const W = this.W;

        // Paredes creme e piso
        this.fillGrad(0, 0, W, 380, 0, 0, 0, 380, [
            [0, '#F5E6C8'], [1, '#E8D3B0']
        ]);
        this.R(0, 300, W, 80, '#D9BE93');
        this.R(0, 296, W, 6, '#B08D5F');
        this.fillGrad(0, 380, W, 220, 0, 380, 0, 600, [
            [0, '#C9A06A'], [1, '#A67C47']
        ]);

        // Pista de dança xadrez
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 7; col++) {
                const glow = Math.sin(t * 0.003 + row + col) * 0.5 + 0.5;
                const base = (row + col) % 2 === 0 ? [245, 240, 230] : [222, 184, 135];
                this.R(250 + col * 43, 420 + row * 40, 41, 38,
                    `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${0.85 + glow * 0.15})`);
            }
        }

        // Palco com cortinas
        this.R(230, 130, 340, 80, '#8D6E63');
        this.R(230, 122, 340, 10, '#6D4C41');
        this.R(230, 96, 26, 120, '#8E2442');
        this.R(544, 96, 26, 120, '#8E2442');
        for (let i = 0; i < 4; i++) {
            this.R(232 + i * 6, 96, 3, 120, '#701B33');
            this.R(548 + i * 6, 96, 3, 120, '#701B33');
        }
        this.R(230, 90, 340, 12, '#8E2442');
        this.text('♪ ♫', 400, 180, 30, '#FFE0B2');

        // Guirlanda de balões sobre o palco
        const balloonColors = ['#F06292', '#FFD54F', '#B2DFDB', '#F8BBD0', '#CE93D8'];
        for (let i = 0; i <= 16; i++) {
            const ang = Math.PI - (i / 16) * Math.PI;
            const bx = 400 + Math.cos(ang) * 190;
            const by = 96 - Math.sin(ang) * 62 + 20;
            this.circle(bx, by, 9, balloonColors[i % balloonColors.length]);
            this.circle(bx - 3, by - 3, 3, 'rgba(255,255,255,0.5)');
        }

        // Janelas com cortinas
        [[70, 90], [640, 90]].forEach(([wx, wy]) => {
            this.R(wx, wy, 90, 120, '#B08D5F');
            this.R(wx + 5, wy + 5, 80, 110, '#AED6F1');
            this.R(wx + 5, wy + 5, 80, 110, 'rgba(255, 240, 200, 0.25)');
            this.R(wx + 41, wy + 5, 8, 110, '#B08D5F');
            this.R(wx - 6, wy - 4, 16, 128, '#C0392B');
            this.R(wx + 80, wy - 4, 16, 128, '#C0392B');
            this.R(wx - 6, wy - 8, 102, 10, '#8E2442');
        });

        // Mesas redondas com velas
        [[140, 450], [660, 450], [140, 250]].forEach(([tx, ty], i) => {
            this.ellipse(tx, ty + 26, 46, 10, 'rgba(0,0,0,0.15)');
            this.circle(tx, ty, 38, '#FDFEFE');
            this.circle(tx, ty, 38, 'rgba(216, 179, 130, 0.25)');
            this.circle(tx, ty - 4, 30, '#FDFEFE');
            this.R(tx - 2, ty - 16, 4, 12, '#FFF8E1');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(t * 0.006 + i * 2) * 0.2;
            this.circle(tx, ty - 20, 7, '#FFD54F');
            ctx.restore();
            this.circle(tx - 14, ty + 2, 3, '#F8BBD0');
            this.circle(tx + 12, ty + 6, 3, '#F8BBD0');
        });

        // Lustre
        this.R(397, 0, 6, 60, '#8B6914');
        this.circle(400, 70, 26, '#FFD700');
        this.circle(400, 70, 18, '#FFECB3');
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const lx = 400 + Math.cos(ang) * 24;
            const ly = 70 + Math.sin(ang) * 24;
            ctx.save();
            ctx.globalAlpha = 0.6 + Math.sin(t * 0.005 + i) * 0.3;
            this.circle(lx, ly, 4, '#FFF59D');
            ctx.restore();
        }

        // Bandeirinhas
        this.bunting(40, 40, 380, 30, ['#F06292', '#FFD54F', '#B2DFDB'], 34);
        this.bunting(420, 30, 760, 40, ['#F06292', '#FFD54F', '#B2DFDB'], 34);

        // Mesa do bolo (interação)
        if (interact) {
            this.ellipse(interact.x, interact.y + 4, 52, 10, 'rgba(0,0,0,0.15)');
            this.R(interact.x - 46, interact.y - 6, 92, 10, '#8D6E63');
            this.R(interact.x - 40, interact.y + 4, 80, 30, '#FDFEFE');
            this.drawInteractObject('cakeStand', interact.x, interact.y - 4, t);
        }

        // Confete no chão
        for (let i = 0; i < 20; i++) {
            const cx = (i * 173) % W;
            const cy = 390 + (i * 97) % 190;
            this.R(cx, cy, 4, 2, ['#F06292', '#FFD54F', '#B2DFDB'][i % 3]);
        }
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 2 — Fase 1: Ateliê da Noiva
    // ------------------------------------------------------------------------
    proto.drawAtelier = function drawAtelier(t, interact) {
        const ctx = this.ctx;
        const W = this.W;

        // Parede rosa com listras sutis
        this.fillGrad(0, 0, W, 400, 0, 0, 0, 400, [
            [0, '#F7DCE6'], [1, '#F0C4D4']
        ]);
        for (let i = 0; i < 20; i++) {
            this.R(i * 42, 0, 18, 400, 'rgba(255,255,255,0.18)');
        }
        this.R(0, 388, W, 12, '#C98BA3');

        // Piso
        this.fillGrad(0, 400, W, 200, 0, 400, 0, 600, [
            [0, '#D9B48A'], [1, '#B08D5F']
        ]);
        for (let i = 0; i < 8; i++) this.R(0, 410 + i * 26, W, 2, 'rgba(0,0,0,0.12)');

        // Tapete
        this.ellipse(420, 500, 170, 36, '#E8A9BF');
        this.ellipse(420, 500, 140, 26, '#F3CFDD');

        // Janela com cortina de renda
        this.R(90, 70, 130, 150, '#C98BA3');
        this.R(96, 76, 118, 138, '#FDEBD0');
        this.R(151, 76, 8, 138, '#C98BA3');
        this.R(96, 138, 118, 6, '#C98BA3');
        for (let i = 0; i < 6; i++) {
            this.circle(106 + i * 20, 90, 7, 'rgba(255,255,255,0.65)');
        }
        this.R(84, 62, 142, 10, '#AD1457');
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFF3D6';
        ctx.beginPath();
        ctx.moveTo(96, 220);
        ctx.lineTo(260, 400);
        ctx.lineTo(340, 400);
        ctx.lineTo(214, 220);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Espelho oval dourado
        ctx.save();
        ctx.fillStyle = '#C9A227';
        ctx.beginPath();
        ctx.ellipse(690, 190, 64, 100, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#D6E9F5';
        ctx.beginPath();
        ctx.ellipse(690, 190, 54, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(664, 250);
        ctx.lineTo(716, 130);
        ctx.stroke();
        ctx.restore();

        // Estante de tecidos
        this.R(60, 270, 170, 130, '#8D6E63');
        this.R(66, 276, 158, 118, '#6D4C41');
        const fabrics = ['#F06292', '#B2DFDB', '#FFD54F', '#CE93D8', '#FFFFFF', '#F8BBD0'];
        fabrics.forEach((c, i) => {
            const fx = 74 + i * 25;
            this.R(fx, 286, 18, 46, c);
            this.R(fx, 286, 18, 6, 'rgba(0,0,0,0.15)');
        });
        fabrics.slice().reverse().forEach((c, i) => {
            const fx = 74 + i * 25;
            this.R(fx, 342, 18, 44, c);
            this.R(fx, 342, 18, 6, 'rgba(0,0,0,0.15)');
        });

        // Mesa de costura com máquina
        this.R(290, 300, 150, 12, '#8D6E63');
        this.R(300, 312, 12, 60, '#6D4C41');
        this.R(418, 312, 12, 60, '#6D4C41');
        this.R(320, 268, 70, 34, '#37474F');
        this.R(382, 276, 26, 12, '#37474F');
        this.R(386, 288, 6, 14, '#263238');
        this.R(330, 272, 20, 10, '#546E7A');
        this.circle(330, 262, 6, '#E91E63');
        this.R(328, 262, 4, 8, '#F8BBD0');

        // Quadros de croquis na parede
        [[280, 90], [390, 90], [500, 90]].forEach(([fx, fy], i) => {
            this.R(fx, fy, 70, 90, '#C9A227');
            this.R(fx + 5, fy + 5, 60, 80, '#FDFEFE');
            ctx.strokeStyle = '#AD1457';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fx + 35, fy + 20);
            ctx.lineTo(fx + 22, fy + 68);
            ctx.lineTo(fx + 48, fy + 68);
            ctx.closePath();
            ctx.stroke();
            this.circle(fx + 35, fy + 15, 5, '#F6C9A0');
        });

        // Fitas métricas decorativas
        this.bunting(240, 30, 560, 24, ['#FFD54F', '#FFFFFF'], 22);

        // Manequim com o vestido (interação)
        if (interact) {
            this.ellipse(interact.x, interact.y + 6, 40, 8, 'rgba(0,0,0,0.15)');
            this.drawInteractObject('mannequin', interact.x, interact.y, t);
            this.sparkle(interact.x - 34, interact.y - 80, t, 0);
            this.sparkle(interact.x + 30, interact.y - 60, t, 2);
            this.sparkle(interact.x, interact.y - 100, t, 4);
        }

        // Suspensão de teto
        this.R(398, 0, 4, 40, '#8B6914');
        this.circle(400, 50, 14, '#FFD700');
        ctx.save();
        ctx.globalAlpha = 0.3;
        this.circle(400, 54, 26, '#FFF59D');
        ctx.restore();
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 2 — Fase 3: Altar do Jardim (o grande momento)
    // ------------------------------------------------------------------------
    proto.drawAltar = function drawAltar(t, johnPos) {
        const ctx = this.ctx;
        const W = this.W;

        // Céu de entardecer
        this.fillGrad(0, 0, W, 340, 0, 0, 0, 340, [
            [0, '#7E57C2'], [0.5, '#EC407A'], [1, '#FFB74D']
        ]);
        this.sun(630, 120, 26, '#FFE0A3');
        this.driftingClouds(t);

        // Jardim
        this.fillGrad(0, 320, W, 280, 0, 320, 0, 600, [
            [0, '#7CBF7A'], [1, '#4E8F4E']
        ]);
        this.grassTufts.forEach((g) => {
            this.R(g.x, g.y, 3, 6, 'rgba(0,0,0,0.10)');
        });

        // Luzinhas cruzadas
        this.stringLights(60, 40, 400, 90, t, 40);
        this.stringLights(400, 90, 740, 40, t, 40);
        this.stringLights(120, 110, 680, 110, t, 30);

        // Tapete da entrada até o arco
        const jx = johnPos ? johnPos.x : 400;
        const jy = johnPos ? johnPos.y : 250;
        ctx.fillStyle = '#F8BBD0';
        ctx.beginPath();
        ctx.moveTo(jx - 46, 600);
        ctx.lineTo(jx + 46, 600);
        ctx.lineTo(jx + 24, jy + 10);
        ctx.lineTo(jx - 24, jy + 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#F06292';
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let i = 0; i < 14; i++) {
            const py = jy + 30 + ((i * 67) % 300);
            const spread = 12 + ((py - jy) / (600 - jy)) * 30;
            this.circle(jx + Math.sin(i * 2.7) * spread, py, 3, i % 2 ? '#FFFFFF' : '#F06292');
        }

        // Fileiras de cadeiras com laços
        for (let row = 0; row < 3; row++) {
            const cy = 400 + row * 62;
            [[170, -1], [630, 1]].forEach(([cx]) => {
                this.ellipse(cx, cy + 22, 30, 6, 'rgba(0,0,0,0.18)');
                this.R(cx - 22, cy - 18, 44, 10, '#FDFEFE');
                this.R(cx - 22, cy - 34, 8, 20, '#FDFEFE');
                this.R(cx + 14, cy - 34, 8, 20, '#FDFEFE');
                this.R(cx - 22, cy - 8, 44, 26, '#F5F0EA');
                this.circle(cx, cy - 4, 5, '#F06292');
                this.R(cx - 9, cy - 2, 6, 10, '#F06292');
                this.R(cx + 3, cy - 2, 6, 10, '#F06292');
            });
        }

        // Lanternas ao longo do caminho
        [[jx - 70, 500], [jx + 70, 500], [jx - 56, 390], [jx + 56, 390]].forEach(([lx, ly], i) => {
            this.R(lx - 2, ly - 26, 4, 40, '#4E342E');
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(t * 0.006 + i * 1.5) * 0.25;
            this.circle(lx, ly - 32, 11, '#FFD54F');
            ctx.restore();
            this.R(lx - 5, ly - 38, 10, 12, '#FFC107');
        });

        // Arco de flores
        ctx.strokeStyle = '#5D8F5D';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(jx, jy + 16, 66, Math.PI, 0);
        ctx.stroke();
        const archFlowers = ['#F06292', '#FFD54F', '#FFFFFF', '#E91E63'];
        for (let i = 0; i <= 12; i++) {
            const ang = Math.PI - (i / 12) * Math.PI;
            const fx = jx + Math.cos(ang) * 66;
            const fy = jy + 16 - Math.sin(ang) * 66;
            this.circle(fx, fy, 8, archFlowers[i % 4]);
            this.circle(fx, fy, 3, '#FFF9C4');
        }

        // John esperando no altar
        if (johnPos) {
            ctx.save();
            const glow = Math.sin(t * 0.004) * 0.2 + 0.5;
            ctx.globalAlpha = glow * 0.4;
            this.circle(jx, jy - 40, 56, '#FFF9C4');
            ctx.restore();
            this.drawJohn(jx, jy, t);
            const ring = window.PixelSprites.object('ring');
            const ringBob = Math.sin(t * 0.004) * 5;
            ctx.drawImage(ring, jx - 15, jy - 118 + ringBob, 30, 30);
            this.sparkle(jx - 24, jy - 110 + ringBob, t, 1);
            this.sparkle(jx + 26, jy - 96 + ringBob, t, 3);
        }

        // Roseiras e pombinhos
        this.roseBush(90, 560, 1.4);
        this.roseBush(710, 560, 1.4);
        this.roseBush(120, 350, 1.0);
        this.roseBush(680, 350, 1.0);
        const gull = window.PixelSprites.object('pigeon', Math.floor(t / 240) % 2);
        ctx.drawImage(gull, 130 + Math.sin(t * 0.002) * 20, 180, 30, 22);
        ctx.save();
        ctx.translate(660, 190);
        ctx.scale(-1, 1);
        ctx.drawImage(gull, 0, 0, 30, 22);
        ctx.restore();

        this.petals(t, 14);
    };

    // ------------------------------------------------------------------------
    // TEMPORADA 2 — Fase 2 (runner): Caminho do Altar
    // run = estado do mini-game vindo do GameManager
    // ------------------------------------------------------------------------
    proto.drawRunner = function drawRunner(run, t) {
        const ctx = this.ctx;
        const W = this.W;
        const H = this.H;
        const progress = Math.min(run.distance / run.goal, 1);

        // Céu
        this.fillGrad(0, 0, W, 240, 0, 0, 0, 240, [
            [0, '#8E5BB5'], [0.6, '#E8739A'], [1, '#FFB74D']
        ]);
        this.sun(120, 80, 24, '#FFE0A3');

        // Igreja ao longe (cresce conforme o progresso)
        const churchScale = 0.55 + progress * 0.75;
        const chX = 560;
        const chY = 210;
        ctx.save();
        ctx.translate(chX, chY);
        ctx.scale(churchScale, churchScale);
        ctx.translate(-chX, -chY);
        this.R(chX - 40, chY - 70, 80, 70, '#F5EFDD');
        this.R(chX - 46, chY - 78, 92, 10, '#C9B08A');
        ctx.fillStyle = '#C9B08A';
        ctx.beginPath();
        ctx.moveTo(chX - 46, chY - 78);
        ctx.lineTo(chX, chY - 112);
        ctx.lineTo(chX + 46, chY - 78);
        ctx.closePath();
        ctx.fill();
        this.R(chX - 8, chY - 136, 16, 30, '#F5EFDD');
        this.R(chX - 2, chY - 150, 4, 16, '#8D6E63');
        this.R(chX - 9, chY - 146, 18, 4, '#8D6E63');
        this.R(chX - 12, chY - 44, 24, 44, '#8D6E63');
        this.R(chX - 30, chY - 58, 12, 20, '#AED6F1');
        this.R(chX + 18, chY - 58, 12, 20, '#AED6F1');
        ctx.restore();

        // Grama
        this.fillGrad(0, 210, W, H - 210, 0, 210, 0, H, [
            [0, '#6DB56D'], [1, '#4E8F4E']
        ]);

        // Pista central
        const ROAD_TOP = 250;
        const ROAD_BOTTOM = 560;
        this.fillGrad(0, ROAD_TOP, W, ROAD_BOTTOM - ROAD_TOP, 0, ROAD_TOP, 0, ROAD_BOTTOM, [
            [0, '#E8D9B8'], [1, '#D9C49A']
        ]);
        this.R(0, ROAD_TOP, W, 6, '#B09A70');
        this.R(0, ROAD_BOTTOM - 6, W, 6, '#B09A70');

        // Faixas da pista rolando
        const scroll = run.scrollX % 90;
        for (let i = -1; i < 11; i++) {
            this.R(i * 90 - scroll, ROAD_TOP + 70, 46, 5, 'rgba(176, 154, 112, 0.8)');
            this.R(i * 90 - scroll, ROAD_BOTTOM - 90, 46, 5, 'rgba(176, 154, 112, 0.8)');
        }

        // Flores laterais rolando
        for (let i = 0; i < 14; i++) {
            const fx = ((i * 137 - run.scrollX * 1.0) % (W + 40) + W + 40) % (W + 40) - 20;
            const fyTop = 222 + (i % 3) * 8;
            const fyBot = 570 + (i % 3) * 9;
            const colors = ['#F06292', '#FFD54F', '#FFFFFF'];
            this.circle(fx, fyTop, 3.4, colors[i % 3]);
            this.circle((fx + 53) % W, fyBot, 3.4, colors[(i + 1) % 3]);
        }

        // Itens colecionáveis
        run.items.forEach((item) => {
            const sprite = window.PixelSprites.object(item.type);
            const bob = Math.sin(t * 0.006 + item.x * 0.05) * 4;
            ctx.save();
            ctx.shadowColor = item.type === 'ring' ? '#FFD700' : '#FF5A8A';
            ctx.shadowBlur = 10;
            ctx.drawImage(sprite, item.x - item.w / 2, item.y - item.h / 2 + bob, item.w, item.h);
            ctx.restore();
        });

        // Obstáculos
        run.obstacles.forEach((obs) => {
            const frame = obs.type === 'pigeon' ? Math.floor(t / 160) % 2 : 0;
            const sprite = window.PixelSprites.object(obs.type, frame);
            const y = obs.type === 'pigeon' ? obs.y + Math.sin(t * 0.006 + obs.x * 0.03) * 10 : obs.y;
            if (obs.type !== 'pigeon') {
                this.ellipse(obs.x, y + obs.h / 2, obs.w / 2, 6, 'rgba(0,0,0,0.22)');
            }
            ctx.drawImage(sprite, obs.x - obs.w / 2, y - obs.h / 2, obs.w, obs.h);
        });

        // Jogadora (pisca quando invulnerável)
        const blink = run.invulnerableUntil > t && Math.floor(t / 90) % 2 === 0;
        ctx.save();
        if (blink) ctx.globalAlpha = 0.35;
        const frame = Math.floor(t / 130) % 2 === 0 ? 1 : 2;
        this.drawCharacter('michelle', run.playerX, run.playerY + 26, 'right', frame);
        ctx.restore();

        // ---------------- HUD ----------------
        ctx.save();
        ctx.globalAlpha = 0.88;
        this.R(12, 12, 330, 58, 'rgba(20, 12, 36, 0.85)');
        ctx.restore();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(12, 12, 330, 58);

        // Barra de progresso até o altar
        this.R(24, 24, 220, 14, '#3E2A55');
        this.fillGrad(24, 24, 216 * progress, 14, 24, 24, 244, 24, [
            [0, '#F06292'], [1, '#FFD54F']
        ]);
        ctx.strokeStyle = '#F8BBD0';
        ctx.strokeRect(24, 24, 220, 14);
        this.text(`${Math.floor(run.distance)}m / ${run.goal}m`, 134, 36, 11, '#FFFFFF', 'center', false);

        // Vidas (corações)
        const heart = window.PixelSprites.object('heart');
        for (let i = 0; i < run.maxLives; i++) {
            ctx.save();
            ctx.globalAlpha = i < run.lives ? 1 : 0.25;
            ctx.drawImage(heart, 24 + i * 26, 46, 22, 20);
            ctx.restore();
        }

        // Pontos
        this.text(`💖 ${run.score}`, 300, 60, 14, '#FFD54F', 'center', false);

        // Mensagem inicial
        if (run.distance < 30) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - run.distance / 30);
            this.text(run.intro, W / 2, 130, 18, '#FFFFFF');
            ctx.restore();
        }
    };
})(window);
