## Context

Ver `proposal.md — Why` para a motivação. Restrições que moldam o desenho:

- O jogo não tem build. O service worker precisa ser um arquivo servido direto, sem geração
  automática de lista de arquivos por ferramenta.
- Service worker exige origem segura: funciona em `https://` e em `localhost`, mas **não**
  ao abrir o arquivo com duplo-clique (`file://`). O jogo precisa continuar funcionando nesse
  modo, só que sem os recursos de instalação e offline.
- O conjunto de arquivos é pequeno e estável: duas páginas, seis scripts, uma fonte e duas
  trilhas — mas só depois que `unificar-entrada-do-jogo` e `otimizar-carregamento-de-midia`
  estiverem aplicadas. Por isso esta change vem depois das duas.
- O progresso vive em `localStorage`, que não é afetado por cache de service worker.

## Goals / Non-Goals

**Goals:**

- Abrir e jogar sem rede a partir da segunda visita.
- Publicar uma versão nova sem deixar ninguém preso na antiga.
- Prévia de link decente em aplicativo de mensagem.

**Non-Goals:**

- Sincronizar progresso entre dispositivos (exigiria backend; o jogo é estático de
  propósito).
- Notificações push, atalhos de aplicativo ou compartilhamento de resultado.
- Adicionar biblioteca de service worker ou gerador de manifesto.
- Fazer o modo `file://` ter offline — ele já é offline por natureza.

## Decisions

### 1. Service worker escrito à mão, com lista de arquivos explícita e versionada

A lista de arquivos a cachear fica declarada no próprio service worker, junto de uma
constante de versão do cache. Publicar uma versão nova significa mudar essa constante.

*Alternativa considerada:* Workbox com geração automática da lista. Rejeitada: traria
dependência de build a um projeto cujo valor é abrir sem build. Com um punhado de arquivos,
a lista manual é menor que a configuração da ferramenta.

### 2. Estratégia *cache-first* para os arquivos do jogo, *network-first* para o documento

Scripts, fonte e áudio vêm do cache quando existem: são imutáveis dentro de uma versão. O
documento HTML é buscado na rede primeiro, com o cache como alternativa, para que uma
publicação nova seja notada assim que houver conexão.

*Alternativa considerada:* cache-first para tudo. Rejeitada: é a receita clássica de jogador
preso numa versão antiga, exatamente o que o requisito de atualização proíbe.

### 3. Ativação imediata da nova versão, com limpeza dos caches antigos

Ao ativar, o service worker apaga todo cache cujo nome não seja o da versão corrente e
assume o controle das páginas abertas. O requisito admite que a troca se complete "no mais
tardar na abertura seguinte", então não é preciso recarregar a página do jogador no meio de
uma partida.

*Alternativa considerada:* forçar recarga assim que a nova versão ativa. Rejeitada: pode
interromper uma partida da fase de obstáculos.

### 4. Degradação silenciosa onde não há suporte

O registro do service worker fica atrás de verificação de disponibilidade e de falha
tratada. Em `file://`, em navegador sem suporte ou com o registro recusado, o jogo carrega
normalmente — só sem instalação e sem offline. Nada disso vira mensagem de erro para o
jogador.

### 5. Imagem de prévia gerada a partir da arte do próprio jogo

A imagem de compartilhamento e os ícones saem de uma captura da tela inicial do jogo, para
não reintroduzir PNGs pesados sem relação com o que está na tela. Alvo: ícones abaixo de
50 KB cada e imagem de prévia abaixo de 200 KB.

*Alternativa considerada:* reaproveitar alguma das artes de `assets/images/`. Rejeitada:
elas foram removidas por serem órfãs e pesarem 1–2 MB cada.

## Risks / Trade-offs

- **Cache servindo versão velha** → versão explícita no nome do cache, limpeza na ativação e
  documento buscado na rede primeiro; verificado publicando uma alteração visível e
  reabrindo.
- **Service worker atrapalhar o desenvolvimento local** → documentar no README como
  desregistrá-lo e usar a opção de ignorar cache do navegador durante a edição.
- **Lista de arquivos ficar desatualizada ao adicionar um script novo** → o teste de fumaça
  de `adicionar-base-de-qualidade` pode comparar os arquivos referenciados pelas páginas com
  a lista do service worker.
- **Ícone e prévia envelhecerem junto com a arte** → são gerados da tela inicial; regerar
  faz parte de qualquer mudança visual grande.
