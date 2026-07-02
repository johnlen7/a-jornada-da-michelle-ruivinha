// Dados centrais da jornada: assets, mapa, fases e perguntas.
// Mantido em formato global para funcionar direto no navegador sem build.
(function registerGameData(window) {
    const assets = {
        images: {
            michelle: 'assets/images/michelle_sprite.png',
            john: 'assets/images/sprite_johnlennon.png',
            hogwartsHouse: 'assets/images/casa_hogwarts.png',
            centralPerk: 'assets/images/centralperk.png',
            fortePath: 'assets/images/caminho_forte.png',
            forte: 'assets/images/forte_copacabana.png',
            churros: 'assets/images/churros.png',
            hogwartsBed: 'assets/images/cama_hogwarts.png',
            sortingHat: 'assets/images/chapeu_seletor.png',
            ravenclawBanner: 'assets/images/banner_corvinal.png',
            bookshelf: 'assets/images/estante_livros.png',
            dumbledoreFrame: 'assets/images/dumbledore_quadro_foto.png'
        },
        audio: {
            hogwarts: 'assets/audio/hogwarts.mp3',
            centralPerk: 'assets/audio/centralperk.mp3'
        }
    };

    const mapLocations = [
        {
            id: 'hogwarts',
            name: 'Quarto Hogwarts',
            x: 150,
            y: 200,
            unlocked: true,
            color: '#8B4513',
            houseColor: '#654321',
            assetKey: 'hogwartsHouse'
        },
        {
            id: 'central-perk',
            name: 'Central Perk',
            x: 650,
            y: 200,
            unlocked: false,
            color: '#FF8C00',
            houseColor: '#CD853F',
            assetKey: 'centralPerk'
        },
        {
            id: 'forte-path',
            name: 'Caminho Forte',
            x: 400,
            y: 100,
            unlocked: false,
            color: '#4682B4',
            houseColor: '#5F9EA0',
            assetKey: 'fortePath'
        },
        {
            id: 'forte-copacabana',
            name: 'Forte Copacabana',
            x: 400,
            y: 450,
            unlocked: false,
            color: '#DAA520',
            houseColor: '#B8860B',
            assetKey: 'forte',
            isFort: true
        }
    ];

    const levels = [
        {
            id: 'hogwarts',
            name: 'Quarto Hogwarts',
            color: '#2F1B69',
            npcX: 360,
            npcY: 380,
            questionId: 'primeira-lembranca',
            unlocks: 'central-perk'
        },
        {
            id: 'central-perk',
            name: 'Central Perk',
            color: '#FF8C00',
            npcX: 400,
            npcY: 380,
            questionId: 'apelidos',
            unlocks: 'forte-path'
        },
        {
            id: 'forte-path',
            name: 'Caminho para o Forte',
            color: '#4682B4',
            npcX: 600,
            npcY: 480,
            questionId: 'pedido-namoro',
            unlocks: 'forte-copacabana'
        },
        {
            id: 'forte-copacabana',
            name: 'Forte Copacabana',
            color: '#1e3a8a',
            npcX: 400,
            npcY: 250,
            final: true
        }
    ];

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
    ];

    window.GameData = {
        version: '1.1.0',
        storageKey: 'michelleGameProgress.v1',
        assets,
        mapLocations,
        levels,
        questions
    };
})(window);
