## Why

A raiz do repositório tem **onze arquivos HTML**, dos quais dez são versões antigas do jogo
somando 213 KB — `game_hogwarts_final.html`, `game_mobile_corrigido.html`,
`game_mobile_final_funcionando.html`, `jogo_desktop.html` e companhia. Cada um carrega uma
cópia divergente da lógica, e `jogo_desktop.html` (81 KB) sequer usa o motor atual. O README
já os declara legado, mas eles continuam publicados: qualquer pessoa com o link antigo
joga uma versão errada, e quem abre o repositório não tem como saber qual arquivo é o jogo.

Some-se a isso `css/styles.css`, com 423 linhas que **nenhum HTML referencia**, e o nome
`game_atualizado.html` para a página oficial — um nome que já foi "o atualizado" três vezes.

Por fim, a fonte do jogo vem por `@import` do Google Fonts. Medido: sem acesso ao CDN a
requisição falha e o jogo cai para o `cursive` do sistema, com visual completamente
diferente do pretendido — numa página que fora isso é inteiramente autossuficiente.

## What Changes

- **BREAKING:** as dez páginas legadas são removidas do repositório. Links antigos deixam de
  funcionar; o histórico do git preserva tudo.
- A página oficial do jogo passa a ter um nome estável, que não envelhece.
- `index.html` continua sendo a porta de entrada e aponta para a página oficial.
- `css/styles.css` é removido por ser código morto.
- A fonte do jogo passa a ser servida pelo próprio projeto, com pilha de fallback
  declarada, e o jogo deixa de depender de CDN de terceiros para ter a aparência certa.
- README atualizado para descrever a estrutura resultante.

## Capabilities

### New Capabilities

- `entrega-do-jogo`: o que o projeto publica — quais páginas existem, qual é a porta de
  entrada, e o que o jogo precisa carregar de fora para ter a aparência pretendida.

### Modified Capabilities

Nenhuma — não há specs arquivadas ainda.

## Impact

- Remoção de `game_hogwarts_final.html`, `game_mobile_corrigido.html`,
  `game_mobile_final.html`, `game_mobile_final_funcionando.html`,
  `game_mobile_funcionando.html`, `game_mobile_otimizado.html`, `jogo_desktop.html`,
  `jogo_mobile.html`, `jogo_organizado.html` e `css/styles.css`.
- Renomeação de `game_atualizado.html` e ajuste do link em `index.html`.
- Adição do arquivo de fonte sob `assets/` e troca do `@import` por declaração local nos
  dois HTMLs.
- `README.md` — seção de estrutura e de como executar.
- Nenhuma mudança de regra do jogo, de conteúdo ou de progresso salvo.
