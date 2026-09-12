// Registra o service worker quando o navegador suporta. Instalação e modo
// offline são um bônus, não um requisito: sem suporte (ou aberto por
// file://, onde service worker não funciona), o jogo roda exatamente igual.
(function registerServiceWorker(window, navigator) {
    if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {
            // Registro recusado ou indisponível — segue o jogo sem
            // instalação nem modo offline, sem incomodar quem está jogando.
        });
    });
})(window, navigator);
