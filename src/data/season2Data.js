// ============================================================================
// 💒 TEMPORADA 2 — O CAMINHO DO CASAMENTO
// ----------------------------------------------------------------------------
// ✏️  ESTE É O ARQUIVO DE CONTEÚDO EDITÁVEL DA TEMPORADA 2!
//
// Aqui você pode editar TUDO o que aparece no jogo, sem mexer no código:
//   • Nomes dos lugares (mapa e fases);
//   • PERGUNTAS, OPÇÕES de resposta e qual é a CORRETA;
//   • Textos do grande momento final e da mensagem de encerramento;
//   • Dificuldade da fase de obstáculos ("Caminho do Altar").
//
// Dicas rápidas:
//   • `correct` é o ÍNDICE da resposta certa, começando em 0
//     (0 = primeira opção, 1 = segunda, 2 = terceira, 3 = quarta).
//   • Pode usar emojis à vontade nos textos. 💕
//   • Depois de editar, é só salvar e recarregar a página do jogo.
// ============================================================================
(function registerSeason2Data(window) {
    // ------------------------------------------------------------------------
    // 🗺️  LUGARES NO MAPA DA TEMPORADA 2
    // `x` e `y` são as posições no mapa (tela de 800x600).
    // Só mude `name` se quiser; mudar x/y move o lugar no mapa.
    // ------------------------------------------------------------------------
    const mapLocations = [
        { id: 'salao-festas',   name: 'Salão de Festas',   x: 150, y: 200, unlocked: true,  color: '#B388FF', houseColor: '#7C4DFF' },
        { id: 'atelie',         name: 'Ateliê da Noiva',   x: 650, y: 200, unlocked: false, color: '#F8BBD0', houseColor: '#EC407A' },
        { id: 'caminho-altar',  name: 'Caminho do Altar',  x: 400, y: 100, unlocked: false, color: '#A5D6A7', houseColor: '#43A047' },
        { id: 'altar-jardim',   name: 'Altar do Jardim',   x: 400, y: 450, unlocked: false, color: '#FFE082', houseColor: '#FFB300', isFort: true }
    ];

    // ------------------------------------------------------------------------
    // 🏠 FASES DA TEMPORADA 2
    // `kind` define o tipo da fase:
    //   'question' → fase de pergunta (andando até o objeto e interagindo)
    //   'runner'   → fase de obstáculos (desviar até chegar ao altar)
    //   'final'    → o grande momento no altar
    // `interactX/interactY` = onde fica o ponto de interação dentro da fase.
    // ------------------------------------------------------------------------
    const levels = [
        {
            id: 'salao-festas',
            name: 'Salão de Festas',
            kind: 'question',
            questionId: 'local-festa',
            interactX: 400,
            interactY: 360,
            music: 's2-hall'
        },
        {
            id: 'atelie',
            name: 'Ateliê da Noiva',
            kind: 'question',
            questionId: 'vestido-detalhe',
            interactX: 560,
            interactY: 350,
            music: 's2-atelier'
        },
        {
            id: 'caminho-altar',
            name: 'Caminho do Altar',
            kind: 'runner',
            music: 's2-runner'
        },
        {
            id: 'altar-jardim',
            name: 'Altar do Jardim',
            kind: 'final',
            interactX: 400,
            interactY: 250,
            music: 's2-altar'
        }
    ];

    // ------------------------------------------------------------------------
    // ❓ PERGUNTAS DA TEMPORADA 2  ✏️ (EDITE À VONTADE!)
    // ------------------------------------------------------------------------
    const questions = [
        {
            id: 'local-festa',
            title: 'O Local da Festa 🎉',
            text: 'Para começar os preparativos: onde vai ser a festa dos nossos sonhos?',
            options: [
                'Num salão com cara de Central Perk',
                'Na praia, com o pôr do sol',
                'Num castelo estilo Hogwarts',
                'Num jardim cheio de flores'
            ],
            correct: 3
        },
        {
            id: 'vestido-detalhe',
            title: 'O Vestido 👗',
            text: 'E o look da noiva? Qual detalhe não pode faltar de jeito nenhum?',
            options: [
                'Brilho de estrela e um laço ruivo',
                'Tênis para correr dos pombos',
                'Capa da Corvinal por cima do vestido',
                'Um bolso secreto para churros'
            ],
            correct: 3
        }
        // 💡 Quer MAIS perguntas? Copie um bloco acima, troque o `id`,
        //    e ligue ele a uma fase em `levels` pelo campo `questionId`.
    ];

    // ------------------------------------------------------------------------
    // 🏃‍♀️ FASE DE OBSTÁCULOS — "CAMINHO DO ALTAR"
    // A Michelle precisa atravessar o caminho desviando dos obstáculos dos
    // preparativos (caixas, bolos, pombos e buquês voadores) e juntando
    // corações. Ajuste a dificuldade aqui:
    // ------------------------------------------------------------------------
    const runner = {
        goalDistance: 900,      // metros até o altar (menor = mais curto)
        startSpeed: 4.2,        // velocidade inicial dos obstáculos
        maxSpeed: 8.5,          // velocidade máxima
        spawnEveryMs: 950,      // intervalo inicial entre obstáculos (ms)
        minSpawnEveryMs: 480,   // intervalo mínimo (mais difícil)
        lives: 3,               // corações (vidas) da Michelle
        invulnerableMs: 1400,   // tempo piscando após levar um choque
        title: 'Caminho do Altar',
        intro: 'Desvie dos obstáculos e colete corações até chegar ao altar! 💒'
    };

    // ------------------------------------------------------------------------
    // 💍 O GRANDE MOMENTO (no Altar do Jardim)
    // Qualquer opção aceita leva ao final feliz — como deve ser. ❤️
    // ------------------------------------------------------------------------
    const finale = {
        title: '💍 No Altar 💍',
        text: 'Michelle, depois de todo esse caminho... aceita viver o nosso para sempre?',
        options: [
            'Aceito, para sempre ❤️',
            'Óbvio que sim! 💕'
        ],
        epilogueTitle: '💒 Vem aí o casamento! 💒',
        epilogueLines: [
            'Duas temporadas de amor, magia e churros...',
            'e o próximo capítulo a gente escreve na vida real. ❤️'
        ]
    };

    window.Season2Data = {
        version: '2.0.0',
        seasonId: 's2',
        seasonName: 'Temporada 2 — O Caminho do Casamento',
        mapName: 'Vila do Casamento 💒',
        storageKey: 'michelleGameProgress.s2.v1',
        mapLocations,
        levels,
        questions,
        runner,
        finale
    };
})(window);
