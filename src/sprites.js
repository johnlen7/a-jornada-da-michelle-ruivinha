// ============================================================================
// Sistema de sprites em pixel-art do jogo.
// Tudo é desenhado em código em uma grade virtual (ex.: 16x24) e renderizado
// uma única vez em canvases offscreen com escala inteira — visual 2D nítido,
// leve e consistente, sem depender de PNGs pesados.
// ============================================================================
(function registerPixelSprites(window, document) {
    const SCALE = 3;
    const CHAR_W = 16;
    const CHAR_H = 24;

    // Paletas dos personagens
    const MICHELLE = {
        hairDark: '#8E3B12', hair: '#C9541E', hairLight: '#F08A3C',
        skin: '#F6C9A0', skinShade: '#E3A97C',
        eye: '#1E7A3C', white: '#FFFFFF', dark: '#2B1B12',
        blush: '#F1948A', mouth: '#A93226',
        blouse: '#C0392B', blouseDark: '#922B21',
        jeans: '#34495E', jeansDark: '#283747',
        shoe: '#6E4B26'
    };

    const JOHN = {
        hair: '#3E2723', hairLight: '#5D4037',
        skin: '#F0BE9C', skinShade: '#DEA47E',
        glass: '#212121', lens: '#D7ECF5',
        jacket: '#37474F', jacketDark: '#263238',
        shirt: '#FAFAFA',
        jeans: '#37474F', shoe: '#212121'
    };

    const charCache = new Map();
    const objCache = new Map();

    // Cria um canvas e devolve uma "caneta" que desenha em unidades virtuais.
    function buildCanvas(w, h, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = w * SCALE;
        canvas.height = h * SCALE;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const pen = {
            ctx,
            r(x, y, w2, h2, color) {
                ctx.fillStyle = color;
                ctx.fillRect(Math.round(x * SCALE), Math.round(y * SCALE), Math.round(w2 * SCALE), Math.round(h2 * SCALE));
            },
            // contorno 1px em volta de um retângulo virtual
            border(x, y, w2, h2, color) {
                pen.r(x, y, w2, 1, color);
                pen.r(x, y + h2 - 1, w2, 1, color);
                pen.r(x, y, 1, h2, color);
                pen.r(x + w2 - 1, y, 1, h2, color);
            }
        };
        drawFn(pen);
        return canvas;
    }

    function flipHorizontal(source) {
        const canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.translate(source.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(source, 0, 0);
        return canvas;
    }

    // ------------------------------------------------------------------------
    // MICHELLE (16x24). frame: 0 parada, 1 passo esquerdo, 2 passo direito
    // ------------------------------------------------------------------------
    function drawMichelle(p, dir, frame) {
        const C = MICHELLE;
        const stepA = frame === 1;
        const stepB = frame === 2;

        if (dir === 'up') {
            // Cabelo cobrindo toda a parte de trás da cabeça
            p.r(3, 0, 10, 2, C.hair);
            p.r(2, 1, 12, 8, C.hair);
            p.r(1, 3, 2, 8, C.hairDark);
            p.r(13, 3, 2, 8, C.hairDark);
            p.r(4, 2, 2, 7, C.hairLight);
            p.r(10, 2, 2, 7, C.hairLight);
            p.r(7, 1, 2, 8, C.hair);
            p.r(2, 9, 12, 1, C.hairDark);
            drawMichelleBody(p, C, stepA, stepB, false);
            return;
        }

        if (dir === 'left') {
            // Perfil olhando para a esquerda (a direita é espelhada depois)
            p.r(4, 0, 9, 2, C.hair);          // topo
            p.r(3, 1, 11, 3, C.hair);         // volume superior
            p.r(3, 3, 7, 6, C.skin);          // rosto de perfil
            p.r(2, 5, 1, 2, C.skin);          // nariz
            p.r(9, 2, 5, 10, C.hair);         // cabelo comprido nas costas
            p.r(13, 3, 1, 9, C.hairDark);
            p.r(10, 2, 2, 8, C.hairLight);    // mecha clara
            p.r(4, 5, 2, 2, C.eye);           // olho
            p.r(4, 5, 1, 1, C.white);
            p.r(3, 7, 1, 1, C.blush);
            p.r(3, 8, 2, 1, C.mouth);         // boca
            drawMichelleBody(p, C, stepA, stepB, true);
            return;
        }

        // dir === 'down' (de frente)
        p.r(3, 0, 10, 2, C.hair);
        p.r(2, 1, 12, 3, C.hair);
        p.r(4, 2, 2, 2, C.hairLight);
        p.r(10, 2, 2, 2, C.hairLight);
        p.r(2, 4, 2, 7, C.hair);              // laterais do cabelo
        p.r(12, 4, 2, 7, C.hair);
        p.r(1, 5, 1, 6, C.hairDark);
        p.r(14, 5, 1, 6, C.hairDark);
        p.r(4, 4, 8, 6, C.skin);              // rosto
        p.r(5, 6, 2, 2, C.eye);               // olhos verdes
        p.r(9, 6, 2, 2, C.eye);
        p.r(5, 6, 1, 1, C.white);
        p.r(9, 6, 1, 1, C.white);
        p.r(4, 8, 1, 1, C.blush);             // blush
        p.r(11, 8, 1, 1, C.blush);
        p.r(7, 8, 2, 1, C.mouth);             // boca
        drawMichelleBody(p, C, stepA, stepB, false);
    }

    function drawMichelleBody(p, C, stepA, stepB, profile) {
        // Pescoço
        p.r(7, 10, 2, 1, C.skin);

        // Blusa vermelha
        p.r(3, 11, 10, 5, C.blouse);
        p.r(6, 11, 4, 1, C.blouseDark);       // gola
        p.r(3, 15, 10, 1, C.blouseDark);      // barra

        // Braços (balançam com o passo)
        if (profile) {
            p.r(2, 11, 1, 3, C.blouse);
            p.r(2, 14, 1, 2, C.skin);
        } else {
            const leftY = stepB ? 10 : 11;
            const rightY = stepA ? 10 : 11;
            p.r(1, leftY, 2, 3, C.blouse);
            p.r(1, leftY + 3, 2, 2, C.skin);
            p.r(13, rightY, 2, 3, C.blouse);
            p.r(13, rightY + 3, 2, 2, C.skin);
        }

        // Calça jeans
        p.r(4, 16, 8, 1, C.jeansDark);        // cós
        if (stepA) {
            p.r(4, 17, 3, 6, C.jeans);        // perna esquerda à frente
            p.r(8, 17, 3, 4, C.jeans);
            p.r(3, 22, 4, 2, C.shoe);
            p.r(8, 21, 4, 2, C.shoe);
        } else if (stepB) {
            p.r(4, 17, 3, 4, C.jeans);
            p.r(8, 17, 3, 6, C.jeans);        // perna direita à frente
            p.r(4, 21, 4, 2, C.shoe);
            p.r(9, 22, 4, 2, C.shoe);
        } else {
            p.r(4, 17, 3, 5, C.jeans);
            p.r(8, 17, 3, 5, C.jeans);
            p.r(4, 19, 1, 3, C.jeansDark);    // costura
            p.r(3, 22, 4, 2, C.shoe);
            p.r(9, 22, 4, 2, C.shoe);
        }
    }

    // ------------------------------------------------------------------------
    // JOHN (16x24)
    // ------------------------------------------------------------------------
    function drawJohn(p, dir, frame) {
        const C = JOHN;
        const stepA = frame === 1;
        const stepB = frame === 2;

        if (dir === 'up') {
            p.r(3, 0, 10, 2, C.hair);
            p.r(2, 1, 12, 8, C.hair);
            p.r(4, 2, 2, 6, C.hairLight);
            p.r(10, 2, 2, 6, C.hairLight);
            p.r(2, 9, 12, 1, C.hair);
            drawJohnBody(p, C, stepA, stepB, false);
            return;
        }

        if (dir === 'left') {
            p.r(4, 0, 9, 2, C.hair);
            p.r(3, 1, 11, 3, C.hair);
            p.r(3, 3, 7, 6, C.skin);
            p.r(2, 5, 1, 2, C.skin);
            p.r(9, 2, 5, 6, C.hair);
            p.r(4, 5, 3, 3, C.glass);         // óculos redondo de perfil
            p.r(5, 6, 1, 1, C.lens);
            p.r(3, 8, 2, 1, C.hair);          // boca/barba leve
            drawJohnBody(p, C, stepA, stepB, true);
            return;
        }

        // down
        p.r(3, 0, 10, 2, C.hair);
        p.r(2, 1, 12, 3, C.hair);
        p.r(4, 2, 2, 2, C.hairLight);
        p.r(10, 2, 2, 2, C.hairLight);
        p.r(2, 4, 2, 3, C.hair);
        p.r(12, 4, 2, 3, C.hair);
        p.r(4, 4, 8, 6, C.skin);
        // Óculos redondos icônicos
        p.r(4, 5, 3, 3, C.glass);
        p.r(9, 5, 3, 3, C.glass);
        p.r(7, 6, 2, 1, C.glass);             // ponte
        p.r(5, 6, 1, 1, C.lens);
        p.r(10, 6, 1, 1, C.lens);
        p.r(7, 8, 2, 1, C.skinShade);         // boca discreta
        drawJohnBody(p, C, stepA, stepB, false);
    }

    function drawJohnBody(p, C, stepA, stepB, profile) {
        p.r(7, 10, 2, 1, C.skin);
        p.r(3, 11, 10, 5, C.jacket);
        p.r(7, 11, 2, 5, C.shirt);            // camisa branca
        p.r(3, 15, 10, 1, C.jacketDark);

        if (profile) {
            p.r(2, 11, 1, 3, C.jacket);
            p.r(2, 14, 1, 2, C.skin);
        } else {
            const leftY = stepB ? 10 : 11;
            const rightY = stepA ? 10 : 11;
            p.r(1, leftY, 2, 3, C.jacket);
            p.r(1, leftY + 3, 2, 2, C.skin);
            p.r(13, rightY, 2, 3, C.jacket);
            p.r(13, rightY + 3, 2, 2, C.skin);
        }

        p.r(4, 16, 8, 1, C.jacketDark);
        if (stepA) {
            p.r(4, 17, 3, 6, C.jeans);
            p.r(8, 17, 3, 4, C.jeans);
            p.r(3, 22, 4, 2, C.shoe);
            p.r(8, 21, 4, 2, C.shoe);
        } else if (stepB) {
            p.r(4, 17, 3, 4, C.jeans);
            p.r(8, 17, 3, 6, C.jeans);
            p.r(4, 21, 4, 2, C.shoe);
            p.r(9, 22, 4, 2, C.shoe);
        } else {
            p.r(4, 17, 3, 5, C.jeans);
            p.r(8, 17, 3, 5, C.jeans);
            p.r(3, 22, 4, 2, C.shoe);
            p.r(9, 22, 4, 2, C.shoe);
        }
    }

    // ------------------------------------------------------------------------
    // OBJETOS
    // ------------------------------------------------------------------------
    const OBJECT_DRAWERS = {
        // Chapéu Seletor (16x14)
        sortingHat(p) {
            const dark = '#5D4037', mid = '#795548', light = '#8D6E63';
            p.r(2, 11, 12, 2, dark);            // aba
            p.r(1, 12, 14, 2, mid);
            p.r(4, 7, 8, 4, mid);               // copa
            p.r(5, 4, 6, 3, mid);
            p.r(6, 1, 4, 3, light);
            p.r(7, 0, 2, 1, light);
            p.r(6, 8, 1, 2, dark);              // "rosto" do chapéu
            p.r(9, 8, 1, 2, dark);
            p.r(6, 10, 4, 1, dark);
            p.r(4, 7, 8, 1, light);
        },

        // Barraca de churros (28x22)
        churrosCart(p) {
            const red = '#C0392B', white = '#FDF2E9', wood = '#8D6E63', woodDark = '#5D4037';
            for (let i = 0; i < 7; i++) {       // toldo listrado
                p.r(i * 4, 0, 4, 4, i % 2 === 0 ? red : white);
            }
            p.r(0, 4, 28, 1, woodDark);
            p.r(2, 5, 2, 5, woodDark);          // hastes do toldo
            p.r(24, 5, 2, 5, woodDark);
            p.r(3, 10, 22, 7, wood);            // corpo
            p.r(3, 10, 22, 1, woodDark);
            p.r(4, 12, 20, 3, '#D7CCC8');       // vitrine
            p.r(5, 13, 2, 1, '#E8A33D');        // churros na vitrine
            p.r(9, 13, 2, 1, '#E8A33D');
            p.r(13, 13, 2, 1, '#E8A33D');
            p.r(17, 13, 2, 1, '#E8A33D');
            p.r(21, 13, 2, 1, '#E8A33D');
            p.r(5, 17, 4, 4, woodDark);         // rodas
            p.r(19, 17, 4, 4, woodDark);
            p.r(6, 18, 2, 2, '#B0BEC5');
            p.r(20, 18, 2, 2, '#B0BEC5');
        },

        // Caneca com coração (8x9)
        mug(p) {
            p.r(1, 2, 5, 6, '#FDFEFE');
            p.r(6, 3, 2, 3, '#FDFEFE');         // alça
            p.r(1, 2, 5, 1, '#D5DBDB');
            p.r(2, 4, 3, 2, '#E74C3C');         // coração
            p.r(2, 4, 1, 1, '#C0392B');
            p.r(1, 0, 1, 2, '#D5DBDB');         // vapor
            p.r(4, 0, 1, 1, '#D5DBDB');
        },

        // Bolo de casamento de 3 andares (22x22)
        cakeStand(p) {
            const cream = '#FDF2E9', pink = '#F8BBD0', gold = '#FFD700';
            p.r(2, 19, 18, 2, '#B0BEC5');       // base
            p.r(4, 14, 14, 5, cream);           // andar 1
            p.r(4, 14, 14, 1, pink);
            p.r(6, 9, 10, 5, cream);            // andar 2
            p.r(6, 9, 10, 1, pink);
            p.r(8, 4, 6, 5, cream);             // andar 3
            p.r(8, 4, 6, 1, pink);
            p.r(5, 16, 2, 2, '#E74C3C');        // cerejas/flores
            p.r(15, 16, 2, 2, '#E74C3C');
            p.r(7, 11, 2, 2, '#E74C3C');
            p.r(13, 11, 2, 2, '#E74C3C');
            p.r(10, 1, 2, 3, gold);             // topo: haste
            p.r(9, 0, 4, 2, '#E74C3C');         // coração do topo
        },

        // Manequim com vestido de noiva (16x24)
        mannequin(p) {
            const white = '#FDFEFE', shade = '#EAECEE', stand = '#795548';
            p.r(7, 0, 2, 2, stand);             // pescoço
            p.r(5, 2, 6, 5, white);             // corpete
            p.r(5, 2, 6, 1, shade);
            p.r(4, 7, 8, 3, white);             // saia
            p.r(3, 10, 10, 4, white);
            p.r(2, 14, 12, 4, white);
            p.r(2, 14, 12, 1, shade);
            p.r(1, 18, 14, 2, white);
            p.r(1, 18, 14, 1, shade);
            p.r(7, 20, 2, 3, stand);            // haste
            p.r(4, 23, 8, 1, stand);            // base
            p.r(4, 5, 1, 2, '#F8BBD0');         // laço rosa
            p.r(11, 5, 1, 2, '#F8BBD0');
        },

        // Caixa de presente — obstáculo (12x12)
        giftBox(p) {
            p.r(1, 3, 10, 8, '#EC407A');
            p.r(1, 3, 10, 1, '#AD1457');
            p.r(5, 3, 2, 8, '#FFD700');         // fita vertical
            p.r(1, 6, 10, 2, '#FFD700');        // fita horizontal
            p.r(3, 0, 3, 3, '#FFD700');         // laço esquerdo
            p.r(6, 0, 3, 3, '#FFD700');         // laço direito
            p.r(5, 1, 2, 2, '#FFC107');
        },

        // Bolo de 2 andares — obstáculo (14x14)
        cakeObstacle(p) {
            const cream = '#FFF8E1', choco = '#8D6E63';
            p.r(1, 8, 12, 5, cream);
            p.r(1, 8, 12, 1, choco);
            p.r(3, 3, 8, 5, cream);
            p.r(3, 3, 8, 1, choco);
            p.r(6, 0, 2, 3, '#E74C3C');         // cereja
            p.r(2, 10, 2, 2, '#F8BBD0');
            p.r(10, 10, 2, 2, '#F8BBD0');
            p.r(4, 5, 2, 2, '#F8BBD0');
            p.r(8, 5, 2, 2, '#F8BBD0');
        },

        // Pombo (14x10) — 2 frames de asa
        pigeon(p, frame) {
            const body = '#90A4AE', dark = '#546E7A', beak = '#FFB300';
            if (frame === 1) {
                p.r(4, 0, 6, 3, dark);          // asa para cima
            } else {
                p.r(4, 6, 6, 3, dark);          // asa para baixo
            }
            p.r(3, 3, 8, 4, body);              // corpo
            p.r(10, 2, 3, 3, body);             // cabeça
            p.r(13, 3, 1, 1, beak);             // bico
            p.r(11, 3, 1, 1, '#212121');        // olho
            p.r(1, 4, 2, 2, dark);              // rabo
        },

        // Buquê voador — obstáculo rápido (10x12)
        bouquet(p) {
            p.r(4, 7, 2, 5, '#2E7D32');         // haste
            p.r(1, 2, 3, 3, '#E91E63');         // flores
            p.r(6, 1, 3, 3, '#F06292');
            p.r(3, 4, 4, 3, '#E91E63');
            p.r(0, 5, 2, 2, '#F8BBD0');
            p.r(7, 5, 2, 2, '#F8BBD0');
            p.r(4, 3, 2, 2, '#FFD700');         // miolo
            p.r(3, 8, 4, 1, '#FFD700');         // fita
        },

        // Coração colecionável (10x9)
        heart(p) {
            const c = '#FF5A8A', d = '#E91E63';
            p.r(1, 1, 3, 2, c);
            p.r(6, 1, 3, 2, c);
            p.r(0, 2, 10, 3, c);
            p.r(1, 5, 8, 2, c);
            p.r(2, 7, 6, 1, d);
            p.r(4, 8, 2, 1, d);
            p.r(1, 2, 2, 1, '#FFD1DC');         // brilho
        },

        // Aliança colecionável (10x10)
        ring(p) {
            const gold = '#FFD54F', dark = '#C8A415';
            p.r(2, 3, 6, 2, gold);
            p.r(1, 4, 2, 4, gold);
            p.r(7, 4, 2, 4, gold);
            p.r(2, 8, 6, 2, gold);
            p.r(2, 8, 6, 1, dark);
            p.r(3, 0, 4, 3, '#B9F2FF');         // diamante
            p.r(4, 0, 2, 1, '#FFFFFF');
        },

        // Placa de madeira com seta (16x14) — usada no mapa/caminho
        signPost(p) {
            const wood = '#8D6E63', dark = '#5D4037';
            p.r(7, 4, 2, 10, dark);             // poste
            p.r(1, 1, 14, 6, wood);             // placa
            p.border(1, 1, 14, 6, dark);
            p.r(4, 3, 6, 2, '#FFE082');         // seta
            p.r(10, 2, 2, 4, '#FFE082');
        }
    };

    const OBJECT_SIZES = {
        sortingHat: [16, 14],
        churrosCart: [28, 22],
        mug: [8, 9],
        cakeStand: [22, 22],
        mannequin: [16, 24],
        giftBox: [12, 12],
        cakeObstacle: [14, 14],
        pigeon: [14, 10],
        bouquet: [10, 12],
        heart: [10, 9],
        ring: [10, 10],
        signPost: [16, 14]
    };

    const PixelSprites = {
        SCALE,
        CHAR_W,
        CHAR_H,

        // Retorna canvas da personagem: name 'michelle'|'john', dir, frame 0..2
        character(name, dir, frame) {
            const renderDir = dir === 'right' ? 'left' : dir;
            const key = `${name}|${renderDir}|${frame}`;
            let canvas = charCache.get(key);
            if (!canvas) {
                const drawer = name === 'john' ? drawJohn : drawMichelle;
                canvas = buildCanvas(CHAR_W, CHAR_H, (p) => drawer(p, renderDir, frame));
                charCache.set(key, canvas);
            }
            if (dir === 'right') {
                const flipKey = `${key}|flip`;
                let flipped = charCache.get(flipKey);
                if (!flipped) {
                    flipped = flipHorizontal(canvas);
                    charCache.set(flipKey, flipped);
                }
                return flipped;
            }
            return canvas;
        },

        // Retorna canvas de um objeto pelo nome (frame opcional p/ animados)
        object(name, frame) {
            const key = `${name}|${frame || 0}`;
            let canvas = objCache.get(key);
            if (!canvas) {
                const size = OBJECT_SIZES[name];
                const drawer = OBJECT_DRAWERS[name];
                if (!size || !drawer) return null;
                canvas = buildCanvas(size[0], size[1], (p) => drawer(p, frame || 0));
                objCache.set(key, canvas);
            }
            return canvas;
        },

        objectSize(name) {
            const size = OBJECT_SIZES[name];
            return size ? { w: size[0] * SCALE, h: size[1] * SCALE } : null;
        },

        charSize() {
            return { w: CHAR_W * SCALE, h: CHAR_H * SCALE };
        }
    };

    window.PixelSprites = PixelSprites;
})(window, document);
