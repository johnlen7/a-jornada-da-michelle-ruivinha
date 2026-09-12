## Why

A Temporada 2 foi escrita para ser editável por quem não programa: `src/data/season2Data.js`
descreve cada fase com `kind`, `questionId` e ponto de interação, e o próprio arquivo
convida a acrescentar perguntas. A Temporada 1 **não** funciona assim. Em
`GameManager.normalizeSeason1()`, as fases da T1 são casadas por índice com um array
`interact` de exatamente quatro posições fixo no motor do jogo: acrescentar uma quinta fase
produz `undefined` e quebra: o ponto de interação, a trilha e o tipo da fase vêm do código,
não do conteúdo.

Ou seja, a promessa do README — "todo o conteúdo editável fica em arquivos de dados
separados do código" — só vale para metade do jogo.

Há ainda um segundo incômodo: o progresso salvo grava um campo `version` que **nunca é
lido**. Quando o número de perguntas de uma temporada muda, o progresso antigo é aplicado
por posição sobre a lista nova, e quem já jogou pode ver uma fase concluída que não
respondeu — ou perder uma que respondeu.

## What Changes

- A Temporada 1 passa a declarar no arquivo de conteúdo tudo o que hoje está no motor: tipo
  da fase, ponto de interação, objeto interativo, trilha e posição de entrada.
- O motor deixa de assumir quatro fases por temporada: qualquer quantidade de fases e
  perguntas funciona nas duas temporadas.
- O campo `version` do progresso passa a ser lido de verdade: progresso salvo de uma versão
  incompatível é descartado com segurança, em vez de aplicado torto.
- O conteúdo passa a ser conferido ao carregar, com aviso claro quando uma fase aponta para
  pergunta inexistente, quando falta ponto de interação ou quando o número de fases e de
  pontos do mapa não bate.
- `src/data/gameData.js` ganha os mesmos comentários em português que `season2Data.js` já
  tem, e o README passa a documentar como acrescentar uma fase.

## Capabilities

### New Capabilities

- `conteudo-das-temporadas`: o contrato entre os arquivos de conteúdo editável e o motor do
  jogo — o que uma temporada precisa declarar, o que o motor garante, e como conteúdo
  inválido ou progresso incompatível é tratado.

### Modified Capabilities

Nenhuma — não há specs arquivadas ainda.

## Impact

- `src/data/gameData.js` — passa a declarar as fases no formato completo.
- `src/game.js` — `normalizeSeason1()`, `normalizeSeason2()`, `configureSeason()`,
  `loadProgress()`, `saveProgress()`, `drawCurrentLevel()` e os limites de movimento por
  fase, hoje fixos em `LEVEL_BOUNDS`.
- `README.md` — seção de edição de conteúdo.
- Depende de `corrigir-fluxo-das-fases`, que toca o mesmo trecho de resolução de perguntas.
- Progresso já salvo pelos jogadores é preservado enquanto compatível; incompatível é
  descartado com aviso, nunca aplicado pela metade.
