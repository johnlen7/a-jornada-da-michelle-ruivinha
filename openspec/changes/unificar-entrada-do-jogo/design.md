## Context

Ver `proposal.md — Why`. O que pesa nas decisões:

- Esta é a única change do plano que **apaga** arquivos publicados. Se alguém tiver salvo
  um link antigo, ele para de funcionar.
- `game_atualizado.html` é referenciado pelo botão de `index.html` e pelo README. São os
  dois únicos pontos a atualizar no repositório — mas não os únicos no mundo.
- A fonte Pixelify Sans é licenciada como SIL Open Font License, o que permite hospedar o
  arquivo no próprio projeto.
- `Pixelify Sans` é uma fonte pixelada e não tem substituto decente em sistema nenhum. O
  `cursive` genérico declarado hoje é uma escolha ruim: em muitos sistemas resulta numa
  fonte manuscrita, o oposto da intenção.

## Goals / Non-Goals

**Goals:**

- Uma porta de entrada só, com nome que não envelhece.
- Zero requisição a terceiros para o jogo ter a aparência certa.
- Repositório em que dá para saber, olhando, qual arquivo é o jogo.

**Non-Goals:**

- Preservar as URLs antigas funcionando (redirecionamento, páginas-ponte).
- Reorganizar `src/`, `assets/` ou o CSS restante em arquivos separados.
- Trocar a fonte por outra.

## Decisions

### 1. As páginas legadas são apagadas, sem redirecionamento

Nada de páginas-ponte com `<meta refresh>`. O jogo é um presente compartilhado por link
direto entre pouquíssimas pessoas, e o histórico do git preserva tudo. Manter dez arquivos
como redirecionadores só trocaria 213 KB de código morto por dez arquivos de manutenção.

*Alternativa considerada:* mover para uma pasta `legacy/` em vez de apagar. Rejeitada: seria
o mesmo problema com outro nome, e o git já é o lugar do histórico.

### 2. `jogo.html` como nome da página oficial

Descritivo, em português como o resto do projeto, e imune à esteira
"atualizado → final → corrigido → funcionando" que produziu os dez arquivos legados.

*Alternativa considerada:* mover o jogo para o próprio `index.html` e eliminar a página
inicial. Rejeitada: a tela inicial com o botão "Começar a Jornada" é parte da apresentação
do presente e dá ao navegador o gesto de usuário que o áudio precisa.

### 3. Fonte hospedada no projeto, com pilha de fallback honesta

O arquivo `.woff2` entra em `assets/fonts/`, declarado por `@font-face` com
`font-display: swap`, e o arquivo de licença fica ao lado. A pilha de alternativas passa a
ser de fontes monoespaçadas — mais próximas do espírito pixelado do que `cursive` — com
`monospace` no fim.

*Alternativa considerada:* manter o Google Fonts e só acrescentar `<link rel="preconnect">`.
Rejeitada: acelera, mas não resolve nem o offline, nem a dependência de terceiros, nem a
prevista tarefa de cache do service worker em `habilitar-pwa-e-compartilhamento`.

### 4. Só o subconjunto de caracteres usado

A fonte é subconjuntada para latino básico mais os acentos do português. Um `.woff2` assim
fica na casa de dezenas de KB, cabendo confortavelmente no orçamento de 1 MB fixado em
`otimizar-carregamento-de-midia`.

### 5. O CSS continua embutido nas páginas

`css/styles.css` sai por ser código morto, mas os estilos que existem hoje continuam inline
nas duas páginas. Extraí-los para arquivo é uma refatoração de gosto, sem ganho mensurável
em duas páginas, e acrescentaria requisição numa change cujo objetivo é diminuí-las.

## Risks / Trade-offs

- **Alguém com o link antigo salvo** → o link antigo para de funcionar; o autor avisa quem
  tiver, e o `index.html` continua no mesmo lugar de sempre.
- **Uma página legada conter algo que o jogo atual não tem** → antes de apagar, cada arquivo
  é conferido contra a lista da tarefa 1.1; o que for único é anotado, não perdido.
- **Licença da fonte** → o arquivo de licença acompanha a fonte no repositório, conforme a
  SIL OFL exige.
- **Subconjunto agressivo demais cortar um emoji ou acento** → os emojis vêm da fonte do
  sistema, não da Pixelify Sans; a verificação percorre as duas temporadas procurando
  caractere faltando.
