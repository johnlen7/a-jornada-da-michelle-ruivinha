## Why

Os diálogos do jogo — perguntas, momento final, desfechos da fase de obstáculos — declaram
`role="dialog"` e `aria-modal="true"`, mas não se comportam como modais. Medido com o jogo
rodando: o foco **continua no `<body>`** quando o diálogo abre, o `Tab` passeia pelos
controles atrás dele, e `ESC` não fecha. Além disso, `#ui` inteiro está marcado com
`aria-live="polite"`, então o indicador de fase e o HUD são anunciados repetidamente em vez
de apenas as mensagens que importam.

Na prática: quem joga só com teclado precisa adivinhar onde está o foco, e quem usa leitor
de tela recebe um fluxo de anúncios irrelevantes enquanto a pergunta que deveria ser lida
passa despercebida. O jogo também ignora `prefers-reduced-motion`, embora tenha botão
pulsando, fogos de artifício, pétalas e brilhos constantes.

## What Changes

- Ao abrir um diálogo, o foco vai para dentro dele e fica preso ali até ele fechar.
- `ESC` fecha os diálogos que podem ser dispensados, devolvendo o foco a quem o tinha.
- O anúncio para leitor de tela passa a cobrir só o conteúdo relevante (título, pergunta e
  resultado), em vez do `#ui` inteiro.
- Mudanças de fase e resultados de resposta são anunciados uma vez, no momento certo.
- O jogo passa a respeitar `prefers-reduced-motion`, reduzindo animações decorativas sem
  tirar nada do conteúdo.
- Todos os controles interativos ganham indicação de foco visível.

## Capabilities

### New Capabilities

- `dialogos-acessiveis`: comportamento de foco, teclado, anúncio para leitores de tela e
  respeito a preferências de movimento em todas as janelas modais do jogo.

### Modified Capabilities

Nenhuma — não há specs arquivadas ainda.

## Impact

- `game_atualizado.html` — atributos ARIA, `tabindex`, estilos de foco e blocos de
  `prefers-reduced-motion`.
- `src/game.js` — `showDialog()`, `hideDialog()`, `showEpilogue()`, `setupInput()`,
  `updateLevelIndicator()`.
- `index.html` — indicação de foco e preferência de movimento na página inicial.
- Nenhuma mudança de regra do jogo, de conteúdo ou de progresso salvo.
