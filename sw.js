// Service worker do jogo.
//
// Guarda os arquivos essenciais (HTML, JS, fonte, ícones) num cache
// versionado assim que o jogo é aberto pela primeira vez com conexão — a
// partir daí ele abre e é jogável sem internet. As trilhas em MP3 NÃO entram
// nesse pré-cache de propósito: elas são grandes e já são buscadas sob
// demanda pelo AudioManager (veja src/audio.js); ficam em cache
// automaticamente assim que alguém realmente as ouve uma vez, e até lá o
// jogo tem a melodia sintética como trilha — nunca fica em silêncio.
//
// Para publicar uma atualização: troque CACHE_VERSION. O cache antigo é
// descartado na ativação da nova versão.
const CACHE_VERSION = 'michelle-v1';

const CORE_FILES = [
    'index.html',
    'jogo.html',
    'manifest.webmanifest',
    'src/data/gameData.js',
    'src/data/season2Data.js',
    'src/sprites.js',
    'src/audio.js',
    'src/loading.js',
    'src/scenes.js',
    'src/game.js',
    'src/main.js',
    'src/pwa.js',
    'assets/fonts/pixelify-sans.woff2',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(CORE_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.filter((name) => name !== CACHE_VERSION).map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

function putInCache(request, response) {
    // Só guarda respostas de sucesso da própria origem — nunca um erro, e
    // nunca uma resposta opaca de terceiros (o jogo não faz esse tipo de
    // requisição, mas o service worker não deveria supor isso).
    if (!response || !response.ok || new URL(request.url).origin !== self.location.origin) {
        return;
    }
    caches.open(CACHE_VERSION).then((cache) => cache.put(request, response));
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const isDocument = request.mode === 'navigate' || request.destination === 'document';

    if (isDocument) {
        // Documento HTML: rede primeiro, para notar uma publicação nova assim
        // que houver conexão; o cache é o respaldo sem internet.
        event.respondWith(
            fetch(request)
                .then((response) => {
                    putInCache(request, response.clone());
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html')))
        );
        return;
    }

    // Demais arquivos (scripts, fonte, ícones, áudio): cache primeiro — são
    // imutáveis dentro de uma versão — com a rede como respaldo, guardando o
    // resultado para a próxima vez.
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                putInCache(request, response.clone());
                return response;
            });
        })
    );
});
