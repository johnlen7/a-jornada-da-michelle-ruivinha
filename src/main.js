// Entrada única do jogo para desktop e mobile.
(function bootMichelleGame(window, document) {
    function whenReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    whenReady(() => {
        if (!window.GameManager) {
            console.error('GameManager não foi carregado. Verifique os scripts em game_atualizado.html.');
            return;
        }

        window.game = new window.GameManager();

        if (window.MichelleGameStabilizer && typeof window.MichelleGameStabilizer.apply === 'function') {
            window.MichelleGameStabilizer.apply(window.game);
        }

        console.log('🎮 A Jornada de Michelle inicializada pela entrada única.');
    });
})(window, document);
