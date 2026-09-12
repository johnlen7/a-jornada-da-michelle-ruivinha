// ============================================================================
// 💕 TEMPORADA 1 — A JORNADA
// ----------------------------------------------------------------------------
// ✏️  ESTE É O ARQUIVO DE CONTEÚDO EDITÁVEL DA TEMPORADA 1!
//
// Segue exatamente o mesmo formato de `season2Data.js`. Aqui você pode editar
// TUDO o que aparece no jogo, sem mexer no motor (`src/game.js`):
//   • Nomes dos lugares (mapa e fases);
//   • PERGUNTAS, OPÇÕES de resposta e qual é a CORRETA;
//   • Textos do grande momento final e da mensagem de encerramento;
//   • Onde fica o ponto de interação de cada fase, e até onde a Michelle
//     pode andar dentro dela (`bounds`).
//
// Dicas rápidas:
//   • `correct` é o ÍNDICE da resposta certa, começando em 0.
//   • `scene` liga a fase a uma das cenas desenhadas em código
//     (`src/scenes.js`, registradas em `SceneRenderer.SCENES`). Usar um nome
//     que não existe aí faz a fase avisar no console e não travar o jogo —
//     mas também não desenha nada, então confira o nome com cuidado.
//   • Pode usar emojis à vontade nos textos. 💕
//   • Depois de editar, é só salvar e recarregar a página do jogo.
//   • Quer adicionar ou remover uma fase? Veja "Como acrescentar uma fase"
//     no README — o motor não assume mais um número fixo de fases.
// ============================================================================
(function registerGameData(window) {
    // ------------------------------------------------------------------------
    // 🗺️  LUGARES NO MAPA DA TEMPORADA 1
    // `x` e `y` são as posições no mapa (tela de 800x600).
    // ------------------------------------------------------------------------
    const mapLocations = [
        { id: 'hogwarts', name: 'Quarto Hogwarts', x: 150, y: 200, unlocked: true, color: '#8B4513', houseColor: '#654321' },
        { id: 'central-perk', name: 'Central Perk', x: 650, y: 200, unlocked: false, color: '#FF8C00', houseColor: '#CD853F' },
        { id: 'forte-path', name: 'Caminho Forte', x: 400, y: 100, unlocked: false, color: '#4682B4', houseColor: '#5F9EA0' },
        { id: 'forte-copacabana', name: 'Forte Copacabana', x: 400, y: 450, unlocked: false, color: '#DAA520', houseColor: '#B8860B', isFort: true }
    ];

    // ------------------------------------------------------------------------
    // 🏠 FASES DA TEMPORADA 1
    // `kind` define o tipo da fase: 'question' (pergunta) ou 'final' (o
    // grande momento). `scene` é o nome da cena em `SceneRenderer.SCENES`.
    // `bounds` limita onde a Michelle pode andar dentro da fase — omita para
    // usar o limite padrão do motor.
    // ------------------------------------------------------------------------
    const levels = [
        {
            id: 'hogwarts',
            name: 'Quarto Hogwarts',
            kind: 'question',
            questionId: 'primeira-lembranca',
            scene: 'hogwarts-room',
            interactX: 360,
            interactY: 380,
            interactObject: 'sortingHat',
            music: 'hogwarts',
            bounds: { minX: 24, maxX: 776, minY: 405, maxY: 580 }
        },
        {
            id: 'central-perk',
            name: 'Central Perk',
            kind: 'question',
            questionId: 'apelidos',
            scene: 'central-perk',
            interactX: 400,
            interactY: 410,
            interactObject: 'mug',
            music: 'centralperk',
            bounds: { minX: 24, maxX: 776, minY: 425, maxY: 580 }
        },
        {
            id: 'forte-path',
            name: 'Caminho para o Forte',
            kind: 'question',
            questionId: 'pedido-namoro',
            scene: 'beach-path',
            interactX: 600,
            interactY: 480,
            interactObject: 'churrosCart',
            music: 's1-path',
            bounds: { minX: 24, maxX: 776, minY: 395, maxY: 580 }
        },
        {
            id: 'forte-copacabana',
            name: 'Forte Copacabana',
            kind: 'final',
            scene: 'fort',
            interactX: 400,
            interactY: 440,
            interactObject: null,
            music: 's1-fort',
            spawnY: 540,
            bounds: { minX: 24, maxX: 776, minY: 455, maxY: 580 }
        }
    ];

    // ------------------------------------------------------------------------
    // ❓ PERGUNTAS DA TEMPORADA 1  ✏️ (EDITE À VONTADE!)
    // ------------------------------------------------------------------------
    const questions = [
        {
            id: 'primeira-lembranca',
            title: 'Primeira Lembrança ❤️',
            text: 'Qual a data do nosso primeiro beijo?',
            options: ['05/08/19', '08/09/19', '10/09/19', '15/08/19'],
            correct: 1
        },
        {
            id: 'apelidos',
            title: 'Nossos Apelidos 🐰',
            text: 'Quais eram nossos apelidos?',
            options: ['Gatinho e Gatinha', 'Coelhinho e Cenourinha', 'Docinho e Benzinho', 'Amor e Paixão'],
            correct: 1
        },
        {
            id: 'pedido-namoro',
            title: 'Pedido de Namoro 💕',
            text: 'Quando foi o pedido de namoro?',
            options: ['20/10/19', '22/10/19', '25/10/19', '18/10/19'],
            correct: 1
        }
        // 💡 Quer MAIS perguntas? Copie um bloco acima, troque o `id`,
        //    e ligue ele a uma fase em `levels` pelo campo `questionId`.
    ];

    // ------------------------------------------------------------------------
    // 💍 O GRANDE MOMENTO (no Forte de Copacabana)
    // `acceptIndex` é o ÍNDICE da opção que representa o "sim" — escolher
    // qualquer outra mostra `rejectText` e deixa tentar de novo.
    // ------------------------------------------------------------------------
    const finale = {
        title: '💍 O Grande Momento 💍',
        text: 'Quer casar comigo?',
        options: ['Sim ❤️', 'Não'],
        acceptIndex: 0,
        rejectText: 'Nan nan ni na não! Tenta de novo!',
        acceptedText: 'SIM! ❤️❤️❤️',
        epilogueTitle: '💖 Parabéns! 💖',
        epilogueLines: ['Não é fim de jogo...', 'é o começo de uma nova jornada ❤️'],
        nextSeason: 's2',
        nextSeasonLabel: '💒 Ir para a Temporada 2'
    };

    // Toda a arte do jogo é pixel-art desenhada em código (veja src/sprites.js e
    // src/scenes.js) — não há PNGs para carregar. Só o áudio vem de arquivo,
    // buscado sob demanda quando a cena que o usa começa (veja src/audio.js).
    const assets = {
        audio: {
            hogwarts: 'assets/audio/hogwarts.mp3',
            centralPerk: 'assets/audio/centralperk.mp3'
        }
    };

    window.GameData = {
        // A migração para o formato orientado a dados (mover interactX/Y,
        // trilha, bounds e o finale para cá) não muda nada que o jogador vê —
        // por isso a versão continua a mesma, e quem já jogou não perde nada.
        version: '1.1.0',
        storageKey: 'michelleGameProgress.v1',
        theme: 's1',
        mapName: 'Vila Mágica do Amor ❤️',
        mapMusic: 's1-map',
        assets,
        mapLocations,
        levels,
        questions,
        runner: null,
        finale
    };
})(window);
