## Why

O jogo é um presente que se entrega por link. Hoje esse link tem duas fraquezas:

1. **Compartilhar não mostra nada.** Nenhuma das páginas tem `<meta name="description">`
   nem metadados de prévia, então mandar o link no WhatsApp resulta numa mensagem crua, sem
   imagem nem descrição — para um jogo que é declaração de amor, isso é metade da entrega.
2. **Precisa de internet e some no meio da conversa.** Não há manifesto nem cache offline:
   o jogo não pode ser instalado na tela inicial do celular e não abre sem rede, mesmo sendo
   inteiramente estático e com a arte desenhada em código.

Depois que o carregamento for otimizado e as páginas legadas saírem, o jogo inteiro cabe
folgadamente num cache offline — a oportunidade fica barata.

## What Changes

- O jogo ganha um manifesto de aplicativo web: nome, ícones, cor de tema e abertura em tela
  cheia, ficando instalável na tela inicial de celular e desktop.
- Um service worker guarda os arquivos do jogo, que passa a abrir e ser jogável **sem
  internet** a partir da segunda visita.
- Atualizações publicadas chegam a quem já instalou, sem deixar o jogador preso numa versão
  antiga em cache.
- As duas páginas ganham descrição e metadados de prévia, de modo que compartilhar o link
  mostre título, descrição e imagem.
- O progresso salvo continua sendo do jogador e não é afetado por atualização de versão.

## Capabilities

### New Capabilities

- `instalacao-e-compartilhamento`: instalação na tela inicial, funcionamento offline,
  atualização da versão em cache e apresentação do jogo quando o link é compartilhado.

### Modified Capabilities

Nenhuma — não há specs arquivadas ainda.

## Impact

- Novos arquivos: manifesto do aplicativo, service worker, ícones e imagem de prévia.
- `index.html` e a página do jogo — metadados, link do manifesto e registro do service
  worker.
- Depende de `otimizar-carregamento-de-midia` e `unificar-entrada-do-jogo`: a lista de
  arquivos a cachear só é estável depois das duas.
- Nenhuma mudança de regra do jogo, de conteúdo ou do formato de progresso salvo.
