## Why

Cada abertura do jogo baixa **27,98 MB de áudio** (medido em Chromium com servidor local),
porque as duas trilhas MP3 são instanciadas duas vezes com `preload="auto"` — uma em
`LoadingScreen.preloadAssets()` e outra no construtor de `AudioManager`. As duas faixas são
baixadas inteiras antes mesmo da tela de escolha de temporada, inclusive para quem vai jogar
a Temporada 2, que não usa nenhum MP3. Em rede móvel, isso é a diferença entre abrir o
presente e desistir da tela de carregamento.

No mesmo movimento, `assets/images/` carrega 31 MB de PNGs que nenhum código lê: a arte do
jogo é toda desenhada em código desde a reestruturação, e o único consumidor de
`GameData.assets` é `assets.audio`.

## What Changes

- Cada faixa de áudio passa a ter **uma única instância** compartilhada entre a tela de
  carregamento e o sistema de áudio.
- A tela de carregamento deixa de baixar faixas inteiras: ela confirma disponibilidade do
  áudio sem forçar o download completo, e nunca bloqueia o jogo por causa de mídia.
- A trilha de uma cena é buscada **quando a cena começa**, não na abertura do jogo.
- As trilhas MP3 são recomprimidas para um alvo de tamanho adequado a loop de fundo.
- **BREAKING (conteúdo):** `assets/images/` é removido do repositório, junto das entradas
  `assets.images` em `src/data/gameData.js`, por serem código morto. Nenhum comportamento
  do jogo muda — nada as carrega hoje.
- O jogo continua tocando som mesmo se um MP3 falhar: o fallback sintético existente passa
  a valer também para falha de rede no meio da partida.

## Capabilities

### New Capabilities

- `carregamento-de-midia`: como o jogo baixa, prepara e degrada áudio e demais mídias,
  incluindo o orçamento de bytes do primeiro carregamento e o comportamento da tela de
  carregamento.

### Modified Capabilities

Nenhuma — não há specs arquivadas ainda.

## Impact

- `src/loading.js` — pré-carregamento e cálculo de progresso.
- `src/audio.js` — criação dos elementos `Audio`, política de `preload`, busca sob demanda.
- `src/data/gameData.js` — remoção do bloco `assets.images`.
- `assets/audio/*.mp3` — recompressão.
- `assets/images/` — removido (31 MB).
- Sem mudança de API pública, de progresso salvo ou de fluxo de telas.
