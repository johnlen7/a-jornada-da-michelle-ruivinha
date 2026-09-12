## Why

A auditoria encontrou dois defeitos que deixam o jogo sem saída, os dois confirmados com o
jogo rodando:

1. **A fase de obstáculos prende quem joga no celular.** A única forma de abandoná-la sem
   perder as três vidas é a tecla `ESC`, que não existe em telefone; o botão AÇÃO não serve
   porque `handleInteraction()` retorna logo no início quando a tela é a de corrida. Como o
   celular é o alvo principal do jogo, quem trava precisa recarregar a página.
2. **Uma pergunta com `id` digitado errado quebra a fase em silêncio.** A busca devolve
   `-1`, o estado lido vira `undefined`, a dica de interação fica piscando para sempre e a
   fase nunca conclui. É exatamente o erro que `src/data/season2Data.js` convida o usuário
   não-programador a cometer ao adicionar perguntas.

Junto vai um incômodo menor: a melodia sintética continua tocando com a aba em segundo
plano, porque o `setInterval` que a agenda nunca é pausado.

## What Changes

- A fase de obstáculos ganha uma forma de desistir que funciona **em qualquer dispositivo**,
  além do `ESC` que já existe.
- Uma fase cuja pergunta não é encontrada passa a **falhar de forma visível e recuperável**:
  o jogo avisa no console, não mostra dica de interação enganosa e não deixa a progressão
  travada.
- O áudio pausa quando a aba perde visibilidade e retoma quando ela volta, respeitando o
  botão de som.
- Limpeza dos ruídos vizinhos: o parâmetro ignorado de `startRunner()` e o índice não usado
  em `markNextLocation()`.

## Capabilities

### New Capabilities

- `fase-de-obstaculos`: regras da fase "Caminho do Altar" — entrada, saída, vidas,
  conclusão e o que acontece em cada desfecho.
- `progressao-de-fases`: como o jogo liga fases a perguntas, decide o que está concluído,
  desbloqueia o próximo ponto do mapa e se comporta quando o conteúdo está mal configurado.

### Modified Capabilities

Nenhuma — não há specs arquivadas ainda.

## Impact

- `src/game.js` — `handleInteraction()`, `updateHint()`, `isLevelComplete()`,
  `startRunner()`, `quitRunner()`, `markNextLocation()`, `setupInput()`.
- `src/audio.js` — pausa e retomada por visibilidade da aba.
- `game_atualizado.html` — o controle de saída da fase de obstáculos precisa existir na
  interface.
- Sem mudança no formato do progresso salvo nem nos arquivos de conteúdo.
