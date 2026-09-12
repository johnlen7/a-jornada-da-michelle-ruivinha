## Context

Ver `proposal.md — Why`. O que molda o desenho:

- Todos os diálogos passam por `showDialog()` / `hideDialog()` (`src/game.js:516-541`), que
  já centralizam exibição, montagem dos botões e bloqueio do movimento
  (`gameState.canMove = false`). Existe um único ponto de entrada para instrumentar.
- Os botões de opção são criados a cada abertura (`document.createElement('button')`), então
  a lista de elementos focáveis é sempre conhecida no momento da abertura.
- `ESC` já tem uso: sair da fase de obstáculos (`src/game.js:297-300`). Os dois
  comportamentos precisam conviver.
- O epílogo (`#finalMessage`) é um segundo contêiner, separado de `#questionDialog`, com
  botões próprios.
- O jogo nasce numa tela que exige gesto do jogador, então mover o foco na primeira abertura
  não é interrupção inesperada.

## Goals / Non-Goals

**Goals:**

- Jogar a campanha inteira só com o teclado.
- Leitor de tela anunciando pergunta, resultado e mudança de fase — e nada além disso.
- Respeitar `prefers-reduced-motion` sem tirar conteúdo de ninguém.

**Non-Goals:**

- Tornar a fase de obstáculos jogável sem visão — é uma fase de reflexo visual.
- Auditoria formal de contraste ou conformidade WCAG completa.
- Traduzir ou reescrever os textos do jogo.

## Decisions

### 1. Foco e contenção implementados em `showDialog()` / `hideDialog()`

Como todo diálogo passa por esses dois métodos, a gestão de foco vive ali: guardar o
elemento ativo, mover o foco para o primeiro botão, instalar o ouvinte de `Tab` enquanto
aberto, e restaurar na saída. O epílogo é encaixado no mesmo caminho.

*Alternativa considerada:* usar `<dialog>` nativo com `showModal()`, que traz foco, contenção
e `ESC` de graça. Rejeitada por ora: mudaria a pilha de empilhamento e o posicionamento de
todos os diálogos sobre o canvas, que hoje é ajustado à mão por resolução e orientação — o
risco de regressão no layout do celular supera o ganho. Fica anotada como evolução.

### 2. Classificação explícita de dispensável

`showDialog()` passa a receber se o diálogo pode ser dispensado. Perguntas e o momento final
são dispensáveis (o jogador pode se afastar e voltar); derrota e vitória da corrida e o
epílogo exigem escolha, porque o jogo precisa saber para onde ir depois.

### 3. `ESC` resolvido por precedência, não por disputa

O tratamento de `ESC` passa a seguir uma ordem única: havendo diálogo dispensável aberto,
fecha o diálogo; senão, estando na corrida, sai da fase. Assim o `ESC` nunca faz as duas
coisas nem fica ambíguo com o diálogo de confirmação de saída.

### 4. `aria-live` em regiões pequenas, não no contêiner da interface

O `aria-live` sai de `#ui` e passa a valer para duas regiões: o resultado da resposta e o
indicador de fase. Título e texto do diálogo não precisam de `aria-live` — são anunciados
pelo próprio foco no modal, via `aria-labelledby` e `aria-describedby`.

*Alternativa considerada:* uma única região de anúncio para tudo. Rejeitada: obrigaria a
montar textos artificiais de anúncio em vez de usar o conteúdo que já está na tela.

### 5. Movimento reduzido tratado só no CSS

Um bloco `@media (prefers-reduced-motion: reduce)` zera as animações decorativas (pulso do
botão, dica piscando, brilhos, pétalas em CSS). O canvas não é tocado: a animação das cenas e
dos obstáculos é jogabilidade, não decoração, e o requisito preserva isso explicitamente.

*Alternativa considerada:* reduzir também a animação do canvas. Rejeitada: tornaria a fase
de obstáculos injogável ou incoerente.

## Risks / Trade-offs

- **Contenção de foco prendendo o jogador se algo falhar** → `ESC` fecha os dispensáveis, e a
  restauração de foco acontece em `hideDialog()`, que já é chamado por todos os caminhos de
  fechamento.
- **Foco automático incomodando quem joga com mouse** → o indicador de foco aparece pelo
  estilo de foco visível, que só destaca fortemente na navegação por teclado.
- **Regressão de layout nos diálogos** → nenhuma mudança estrutural de posicionamento nesta
  change; as verificações repetem retrato e paisagem.
- **Anúncios duplicados ao repetir resposta errada** → o texto do resultado é limpo antes de
  ser reescrito, e a verificação inclui responder errado duas vezes seguidas.
