## Context

Ver `proposal.md — Why`. Restrições relevantes:

- `handleInteraction()` (`src/game.js:451-487`) é o funil de toda interação e já começa com
  `if (this.gameState.interactionActive || this.gameState.screen === 'runner') return;`.
  Esse retorno existe por um bom motivo: durante a corrida, o botão AÇÃO não pode abrir
  diálogo de fase.
- Durante a corrida, a classe `runner-mode` já esconde o painel de instruções
  (`game_atualizado.html:345-347`), então existe espaço livre no topo à esquerda.
- O índice `-1` de `findIndex` é lido em dois lugares (`src/game.js:479` e `910`), sempre
  seguido de um acesso a `questionsAnswered[qIndex]`.
- `AudioManager` controla duas coisas distintas que precisam pausar juntas: o elemento
  `Audio` (`currentAudio`) e o `setInterval` da melodia sintética (`musicInterval`).

## Goals / Non-Goals

**Goals:**

- Saída da corrida em qualquer dispositivo, sem sobrecarregar o botão AÇÃO.
- Conteúdo mal configurado falha alto no console e silencioso na tela, nunca ao contrário.
- Áudio que não continua tocando numa aba que ninguém está olhando.

**Non-Goals:**

- Mudar a dificuldade, a física ou o visual da corrida.
- Pausar a corrida (só sair dela) — pausa é outro requisito, não pedido aqui.
- Validar o conteúdo inteiro ao carregar; isso é escopo de
  `expandir-conteudo-orientado-a-dados`.

## Decisions

### 1. Botão de sair dedicado, e não o botão AÇÃO

A saída da corrida ganha um botão próprio, visível só durante a fase, no canto oposto aos
controles de movimento. O botão AÇÃO continua inerte na corrida.

*Alternativa considerada:* fazer o botão AÇÃO sair da fase enquanto a corrida roda.
Rejeitada: é o botão que o jogador aperta por reflexo o tempo todo; virar "desistir" é a
receita para perder a corrida sem querer. Um botão separado, deliberadamente fora do alcance
do polegar que joga, é mais seguro.

### 2. Confirmação antes de sair

Acionar a saída abre o mesmo diálogo de escolha já usado na derrota ("voltar ao mapa" /
"continuar"), em vez de abandonar na hora. Reaproveita `showDialog()` e protege contra
toque acidental.

*Alternativa considerada:* sair direto. Rejeitada: um toque errado jogaria fora uma corrida
inteira, e o custo da confirmação é um toque.

### 3. Resolução de pergunta num único ponto, devolvendo ausência explícita

Um método passa a resolver "fase → pergunta", devolvendo a pergunta e o índice, ou nada.
Os dois chamadores passam a tratar a ausência de forma explícita. O `-1` deixa de circular.

*Alternativa considerada:* validar o conteúdo na carga e abortar. Rejeitada: derrubar o
jogo inteiro por causa de uma fase mal configurada é pior do que degradar aquela fase — e a
validação completa já está planejada em `expandir-conteudo-orientado-a-dados`.

### 4. Aviso uma vez por fase, não por quadro

`updateHint()` roda a cada quadro; registrar o aviso ali encheria o console de milhares de
linhas. O aviso sai na entrada da fase e é memorizado por fase.

### 5. Pausa por visibilidade dentro do `AudioManager`

O ouvinte de `visibilitychange` fica no `AudioManager`, que já é dono de `currentAudio` e de
`musicInterval`. Ao voltar, o `GameManager` é consultado sobre a cena atual pelo caminho que
já existe (`playMusicForCurrentScreen()`), respeitando `soundEnabled`.

*Alternativa considerada:* pausar o loop do jogo inteiro. Rejeitada: `requestAnimationFrame`
já é suspenso pelo navegador em aba oculta; só o `setInterval` do áudio escapa.

## Risks / Trade-offs

- **Botão de sair atrapalhando a corrida em tela pequena** → posicionado no lado oposto ao
  D-pad e verificado em retrato e paisagem antes de fechar a tarefa.
- **Diálogo de confirmação congelando a corrida** → `updateRunner()` já retorna cedo quando
  há diálogo ativo (`interactionActive`); o comportamento é o mesmo da derrota.
- **Retomada de áudio duplicando trilha** → a retomada passa por `stopBackgroundMusic()`,
  que já limpa elemento e intervalo antes de começar.
- **Aviso de fase mal configurada passar despercebido** → a mensagem nomeia temporada, fase
  e identificador, para ser pesquisável por quem editou o conteúdo.
