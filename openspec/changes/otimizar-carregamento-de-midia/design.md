## Context

Ver `proposal.md — Why` para a motivação. O que importa para o desenho:

- `LoadingScreen` (`src/loading.js:34-54`) cria um `Audio` por faixa só para medir progresso,
  e `AudioManager` (`src/audio.js:14-17`) cria outro par para tocar. Os dois usam
  `preload="auto"`, daí os 27,98 MB medidos.
- `AudioManager.playBackgroundMusic(key)` (`src/audio.js:145-184`) já tem o padrão certo:
  tenta o arquivo e cai para melodia sintética se `play()` rejeitar. O problema é só *quando*
  o arquivo é buscado.
- O jogo não tem build. Qualquer solução precisa funcionar com `<script>` global e servidor
  estático.
- `assets.images` existe em `gameData.js` desde antes da arte em código; hoje ninguém lê.

## Goals / Non-Goals

**Goals:**

- Primeiro carregamento abaixo de 1 MB sem perder a tela de loading nem a trilha das cenas.
- Uma fonte única de verdade para "qual objeto de áudio representa a faixa X".
- Manter o fallback sintético como caminho normal, não como caminho de exceção.

**Non-Goals:**

- Trocar Web Audio API por biblioteca de áudio.
- Adicionar bundler, pipeline de assets ou etapa de build.
- Substituir a pixel-art em código por imagens.
- Streaming adaptativo ou múltiplos formatos além de um fallback simples.

## Decisions

### 1. Registro de faixas dentro do `AudioManager`, consumido pela tela de carregamento

`AudioManager` passa a ser o dono de todos os objetos `Audio`, expostos por um método de
consulta por chave. `LoadingScreen` deixa de instanciar mídia e passa a perguntar ao
`AudioManager` se as faixas estão prontas.

*Alternativa considerada:* deixar a `LoadingScreen` pré-carregar e o `AudioManager`
reaproveitar os elementos dela. Rejeitada porque inverte a dependência — a tela de
carregamento é efêmera e o sistema de áudio vive a sessão inteira.

### 2. `preload="none"` com busca disparada pela entrada na cena

As faixas nascem com `preload="none"`. `playBackgroundMusic(key)` dispara o `load()` e o
`play()` no momento em que a cena começa. Como já existe um gesto do usuário antes de
qualquer cena (a tela inicial exige toque/tecla), não há risco de bloqueio de autoplay novo.

*Alternativa considerada:* `preload="metadata"` para todas. Rejeitada: ainda assim custa
requisições e headers de duas faixas que talvez nunca toquem, e não resolve o caso da
Temporada 2.

### 3. Progresso da tela de carregamento deixa de ser progresso de download

Como nada pesado é baixado na abertura, a barra passa a refletir a preparação do jogo
(sprites em cache, cenas prontas) com o mínimo de tempo de exibição que já existe
(`minimumDuration`). O teto de 3 segundos da spec vira uma garantia trivial em vez de uma
corrida contra a rede.

*Alternativa considerada:* remover a tela de carregamento. Rejeitada: ela é parte da
apresentação do presente (coração pulsando, alianças orbitando) e custa quase nada.

### 4. Recompressão das trilhas para ~96 kbps mono

12 MB para um loop de fundo é ~20× o necessário. O alvo é cada faixa abaixo de 700 KB, o
que mantém o orçamento de 1 MB mesmo se alguém entrar direto na primeira fase. A
recompressão é feita uma vez, com os arquivos originais preservados fora do repositório.

*Alternativa considerada:* gerar as trilhas só sinteticamente e apagar os MP3. Rejeitada:
a trilha de Hogwarts é parte da graça da Temporada 1.

### 5. Remoção de `assets/images/` junto com `assets.images`

Os dois andam juntos: apagar os arquivos e deixar o bloco de caminhos em `gameData.js` só
adiaria a confusão. A remoção é registrada no README para quem procurar as artes antigas
no histórico do git.

## Risks / Trade-offs

- **A trilha demora a começar ao entrar na fase** → a melodia sintética da cena começa
  imediatamente e é substituída pelo arquivo quando ele estiver pronto; o jogador nunca
  ouve silêncio.
- **Recompressão degrada a trilha** → validar ouvindo antes de commitar; o alvo de 96 kbps
  mono é conservador para música de fundo em loop sob efeitos sonoros.
- **Alguém ainda quer os PNGs** → continuam recuperáveis no histórico do git; o README
  aponta o commit.
- **Medição de bytes varia por navegador** → o critério de aceite usa Chromium headless,
  o mesmo ambiente da auditoria, para ser comparável.
