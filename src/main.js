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
        console.log('🎮 A Jornada de Michelle inicializada (2 temporadas).');
    });
})(window, document);
