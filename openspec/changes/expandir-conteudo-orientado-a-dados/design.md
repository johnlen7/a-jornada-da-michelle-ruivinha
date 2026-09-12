## Context

Ver `proposal.md — Why` para a motivação. O que o desenho precisa levar em conta:

- `normalizeSeason1()` (`src/game.js:109-145`) casa `clone.levels` com um array `interact`
  de quatro posições declarado dentro do próprio método, e ainda decide o tipo da fase por
  posição (`i < 3 ? 'question' : 'final'`).
- `LEVEL_BOUNDS` (`src/game.js:13-26`) guarda limites de movimentação por tema e por índice
  de fase, também fixos em quatro posições por temporada.
- `drawCurrentLevel()` (`src/game.js:975-1006`) escolhe o desenho da cena por
  `if (index === 0) ... else if (index === 1) ...`, por tema. As funções de cena são, elas
  sim, específicas de cada cenário e não podem virar dados.
- `season2Data.js` já é o formato desejado; a T1 precisa alcançá-lo, não o contrário.
- Já existe progresso salvo no navegador de quem jogou, com as chaves
  `michelleGameProgress.v1` e `michelleGameProgress.s2.v1`.

## Goals / Non-Goals

**Goals:**

- Um único formato de conteúdo para as duas temporadas.
- Acrescentar ou remover uma fase sem tocar no motor.
- Progresso antigo respeitado quando compatível e descartado com clareza quando não.

**Non-Goals:**

- Transformar o desenho das cenas em dados — a pixel-art de cada cenário continua em código.
- Criar editor visual de conteúdo ou formato de arquivo novo (JSON, YAML); os arquivos
  continuam `.js` com `window.X`, para abrir sem servidor.
- Adicionar novas temporadas ou novo conteúdo narrativo nesta change.
- Validação em tempo de build — a conferência é em tempo de execução, no console.

## Decisions

### 1. A fase declara o nome da cena; o motor mantém o mapa nome → função de desenho

Cada fase passa a declarar um identificador de cena (por exemplo `hogwarts-room`), e o motor
guarda um registro que liga identificador a função de desenho. Some a cadeia de `if (index
=== 0)`, e acrescentar uma fase passa a ser: escrever a função da cena nova, registrá-la e
citá-la no conteúdo.

*Alternativa considerada:* descrever a cena inteira em dados. Rejeitada: as cenas são
centenas de linhas de desenho procedural com animação própria; virar dados só transformaria
código legível num formato de configuração ilegível.

### 2. Limites de movimentação migram para a declaração da fase, com padrão no motor

`LEVEL_BOUNDS` deixa de existir como tabela por índice. Cada fase declara seus limites; o
motor aplica um padrão conservador quando a fase não declara. Assim, uma fase nova não nasce
com a personagem andando na parede.

*Alternativa considerada:* derivar os limites do desenho da cena. Rejeitada: exigiria que
cada função de cena devolvesse geometria, acoplando desenho e regra de movimento.

### 3. Versão de conteúdo comparada por igualdade estrita

O progresso guarda a versão declarada no arquivo de conteúdo. Ao carregar, versão diferente
significa progresso descartado, com aviso. É mais duro do que uma migração campo a campo,
mas é previsível, cabe em poucas linhas, e o custo para o jogador é rejogar uma temporada
curta — muito menor do que ver uma fase marcada como concluída sem ter sido.

*Alternativa considerada:* casar por identificador de pergunta em vez de por posição, para
preservar o progresso mesmo com a lista alterada. É melhor e vale como evolução futura; fica
fora desta change para não misturar a mudança de formato com mudança de semântica do
progresso salvo.

### 4. Conferência de conteúdo como função pura, chamada ao configurar a temporada

Uma função recebe o conteúdo declarado e devolve a lista de problemas encontrados; o motor
registra cada um no console e segue em frente. Sendo pura, é testável direto pelo teste de
fumaça de `adicionar-base-de-qualidade`, sem precisar rodar o jogo.

### 5. Migração da T1 sem mudar o que o jogador vê

A T1 passa a declarar exatamente os valores que hoje estão no array `interact` e em
`LEVEL_BOUNDS`. Nenhum número muda nesta change — ela move dados de lugar. Qualquer ajuste
de posição ou de trilha é assunto para depois, e assim qualquer diferença visível é sinal
de erro na migração.

## Risks / Trade-offs

- **Migração da T1 alterar posições sem querer** → os valores são transcritos um a um e
  conferidos percorrendo a temporada inteira antes e depois, comparando as telas.
- **Jogador perder progresso na atualização** → a versão do conteúdo da T1 só muda se o
  conteúdo mudar de verdade; mover dados de lugar preserva a versão e, com ela, o progresso.
- **Registro de cenas virar lista esquecida** → a conferência de conteúdo acusa fase que
  cita cena não registrada, com o nome da fase.
- **Comentários em português se desatualizarem** → os dois arquivos de conteúdo passam a
  seguir a mesma estrutura, o que torna a divergência visível na revisão.

## Open Questions

- Preservar progresso casando por identificador de pergunta, em vez de descartar por versão,
  é uma evolução desejável depois desta change? A resposta não muda nada do que está
  especificado aqui: o comportamento atual é "descartar com aviso", e refiná-lo depois seria
  uma change própria.
