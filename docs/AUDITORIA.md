# 🔍 Auditoria — A Jornada da Michelle Ruivinha

**Data:** 12/09/2026
**Revisão:** commit `503969f` (branch `master`)
**Escopo:** código-fonte (`src/`, `index.html`, `game_atualizado.html`), assets, estrutura do repositório e comportamento em execução.

> ✅ **Status: todos os achados foram corrigidos.** As sete changes do
> [plano de upgrades](PLANO-DE-UPGRADES.md) que endereçam este relatório foram
> implementadas, verificadas com testes automatizados reais (Playwright) e
> arquivadas em `openspec/specs/`, que agora é o contrato de comportamento
> vigente do jogo. Este documento permanece como registro histórico do estado
> anterior — os números "hoje" abaixo descrevem o projeto **antes** da
> implementação. Veja o resultado final na tabela de métricas do plano.

Os achados marcados com **[medido]** foram verificados com o jogo rodando de verdade
(Chromium headless + servidor local), não apenas por leitura de código.

---

## 📊 Resumo

| Severidade | Qtd | Tema |
| --- | --- | --- |
| 🔴 Alta | 3 | Peso de download, assets mortos, saída travada na fase de obstáculos |
| 🟡 Média | 6 | Bug de conteúdo, acessibilidade dos diálogos, dependência de fonte externa, arquivos legados |
| 🔵 Baixa | 7 | Ruídos de código, metadados, infraestrutura de projeto |

**O que está bom:** a arquitetura atual é sólida para o tamanho do projeto. A separação
`data / sprites / scenes / audio / game` é clara, a pixel-art gerada em código com cache
em canvas offscreen (`charCache` / `objCache`) é uma decisão acertada, o loop roda a
**60 fps [medido]** e o conteúdo editável está isolado em `src/data/`, com comentários em
português para quem não programa. Os problemas abaixo são de entrega e de borda, não de
concepção.

---

## 🔴 Alta severidade

### A1 — O jogo baixa 28 MB de áudio a cada abertura **[medido]**

`27.980.672 bytes` requisitados só de MP3 num carregamento limpo.

A causa é duplicação: `LoadingScreen.preloadAssets()` (`src/loading.js:34-54`) cria um
`Audio` por faixa para medir o progresso, e o construtor de `AudioManager`
(`src/audio.js:14-17`) cria **outro** par para tocar. Os quatro elementos usam
`preload="auto"`, então cada MP3 é baixado duas vezes:

| Arquivo | Tamanho | Downloads por carregamento |
| --- | --- | --- |
| `assets/audio/hogwarts.mp3` | 12,1 MB | 2 |
| `assets/audio/centralperk.mp3` | 1,8 MB | 2 |

Pior: `hogwarts.mp3` só é usado na **primeira fase** da Temporada 1, e
`centralperk.mp3` na segunda — mas as duas faixas são baixadas por inteiro antes da
tela de seleção de temporada, inclusive para quem vai jogar a Temporada 2, que não usa
nenhum MP3. Num celular em rede móvel, isso é a diferença entre abrir o presente em
segundos e desistir da tela de carregamento.

**Correções:** eliminar a duplicação, trocar `preload="auto"` por `metadata`/`none`,
carregar a faixa sob demanda ao entrar na cena e recomprimir os MP3 (12 MB para uma
trilha em loop é ~20× acima do necessário).

### A2 — 31 MB de imagens não usadas no repositório **[verificado]**

`assets/images/` tem 20 PNGs somando 31 MB (vários com 1–2 MB cada, incluindo um
`favicon.ico` de 1,4 MB). Nenhum é carregado pelo jogo: a busca por consumidores de
`GameData.assets.images` retorna zero — só `assets.audio` é lido (em `src/audio.js:13` e
`src/loading.js:25`). Toda a arte atual é desenhada em código (`src/sprites.js`,
`src/scenes.js`), como o próprio README diz.

Resultado: o repositório pesa ~45 MB para entregar ~150 KB de jogo. Clone, deploy e
qualquer CI pagam esse custo sem contrapartida.

### A3 — Não dá para abandonar a fase de obstáculos no celular **[medido]**

A única saída do "Caminho do Altar" sem perder as três vidas é a tecla **ESC**
(`src/game.js:297-300`) — que não existe em celular. O botão AÇÃO não resolve:
`handleInteraction()` retorna logo no início quando `screen === 'runner'`
(`src/game.js:456`). Confirmado em teste: com o jogo no runner, chamar a interação
mantém `screen === "runner"`.

Como o mobile é o alvo principal (há D-pad, botão AÇÃO e todo um bloco de CSS
landscape), quem trava na fase precisa recarregar a página.

---

## 🟡 Média severidade

### M1 — `questionId` sem par deixa a fase impossível de concluir **[medido]**

Em `updateHint()` (`src/game.js:910-911`) e em `handleInteraction()`
(`src/game.js:479`), o índice vem de
`questions.findIndex(q => q.id === level.questionId)`. Quando não há pergunta com aquele
id, `findIndex` devolve `-1`, `questionsAnswered[-1]` é `undefined`, e
`!undefined === true`: a dica "Pressione ESPAÇO para interagir" pisca para sempre e a
interação nunca abre pergunta nenhuma. Sem erro no console, sem pista do que houve.

Isso importa porque `src/data/season2Data.js:102-103` **convida** o usuário não-programador
a exatamente esse erro: *"Quer MAIS perguntas? Copie um bloco acima, troque o `id`, e ligue
ele a uma fase em `levels` pelo campo `questionId`"*. Um id digitado errado produz uma fase
silenciosamente quebrada.

### M2 — Diálogos não são acessíveis por teclado/leitor de tela **[medido]**

`#questionDialog` declara `role="dialog"` e `aria-modal="true"`, mas:

- o foco **continua no `<body>`** quando o diálogo abre (medido: `activeElement` = `BODY`
  antes e depois da abertura);
- não há focus trap — o Tab passeia pelos controles atrás do modal;
- **ESC não fecha** o diálogo (medido: permanece visível);
- `#ui` inteiro tem `aria-live="polite"`, então indicador de fase e HUD são anunciados
  em looping em vez de só as mensagens relevantes.

### M3 — A fonte do jogo depende de CDN e quebra offline **[medido]**

`Pixelify Sans` entra por `@import` do Google Fonts dentro do `<style>`
(`game_atualizado.html:8`, `index.html:8`). No teste sem acesso à rede externa, a
requisição falhou (`ERR_CONNECTION_RESET`) e o jogo caiu para o `cursive` genérico do
sistema — visual completamente diferente do pretendido. Além disso, `@import` dentro de
CSS inline é render-blocking e serializa o download, e é uma dependência de terceiros
para um jogo que fora isso é 100% autossuficiente.

### M4 — Oito arquivos HTML legados confundem o repositório

`game_atualizado.html`, `game_hogwarts_final.html`, `game_mobile_corrigido.html`,
`game_mobile_final.html`, `game_mobile_final_funcionando.html`,
`game_mobile_funcionando.html`, `game_mobile_otimizado.html`, `jogo_desktop.html`,
`jogo_mobile.html`, `jogo_organizado.html` somam **213 KB** de versões antigas com
cópias divergentes da lógica do jogo. O README já os declara legado, mas eles continuam
publicados e acessíveis por URL, e `jogo_desktop.html` (81 KB) sequer usa o `GameManager`
atual. Quem abre o repositório pela primeira vez não tem como saber qual arquivo é o jogo.

### M5 — `css/styles.css` é código morto

423 linhas que **nenhum HTML referencia** (verificado). Os estilos de verdade estão
duplicados inline em `index.html` e `game_atualizado.html`.

### M6 — Música sintética continua tocando com a aba em segundo plano

`playSyntheticMusic()` agenda um `setInterval` (`src/audio.js:215`) que nunca é pausado.
Não há tratamento de `visibilitychange`: trocar de aba mantém a trilha e os
`AudioContext` ativos.

---

## 🔵 Baixa severidade

| # | Achado | Onde |
| --- | --- | --- |
| B1 | `startRunner(level)` recebe um parâmetro e o ignora por completo (a config vem de `this.season.runner`) | `src/game.js:676` |
| B2 | `markNextLocation()` usa `forEach((loc, i))` com `i` não utilizado | `src/game.js:178-180` |
| B3 | `normalizeSeason1()` casa `clone.levels` com um array `interact` fixo de 4 posições por índice — acrescentar uma 5ª fase na T1 quebra com `undefined` | `src/game.js:111-127` |
| B4 | O campo `version` gravado no `localStorage` nunca é lido; não há migração de progresso entre versões | `src/game.js:218, 230-251` |
| B5 | Sem `<meta name="description">` nem Open Graph — compartilhar o link no WhatsApp não gera prévia, o que pesa para um jogo que é presente | `index.html`, `game_atualizado.html` |
| B6 | Sem `package.json`, lint, testes, CI ou LICENSE | raiz |
| B7 | Sem respeito a `prefers-reduced-motion` (botão pulsando, fogos, pétalas, brilhos) | CSS dos dois HTMLs |

### Nota de segurança (informativa)

O histórico do git contém a "senha mágica" da tela inicial, removida no commit `a2a4d8d`.
Não é uma credencial real nem dá acesso a nada além do próprio jogo, mas em repositório
público vale saber que ela continua recuperável pelo histórico. Nenhuma ação obrigatória.

---

## ✅ O que foi verificado em execução

| Verificação | Resultado |
| --- | --- |
| Boot do jogo, `window.game` criado, loading conclui | OK |
| Fluxo início → seleção de temporada → mapa (T2) | OK |
| Taxa de quadros no loop principal | 60 fps |
| Erros de JavaScript no console | Nenhum |
| Bytes de MP3 por carregamento | 27,98 MB |
| Saída do runner via botão AÇÃO (caminho mobile) | Falha — permanece na fase |
| Foco ao abrir o diálogo de pergunta | Permanece no `body` |
| ESC fechando o diálogo | Não fecha |
| Dica de interação com `questionId` inexistente | Fica visível permanentemente |
| Layout em 390×844 (retrato) e 844×390 (paisagem) | Sem scroll horizontal, controles visíveis |
| Carregamento da fonte Pixelify Sans sem CDN | Falha, cai para `cursive` |

---

## 🎯 Conclusão

Nenhum dos problemas exige reescrever o jogo. A arquitetura aguenta tudo o que está
proposto no [plano de upgrades](PLANO-DE-UPGRADES.md), e o item de maior retorno é o mais
barato: derrubar os 28 MB de áudio e os 31 MB de imagens mortas resolve, sozinho, a pior
experiência que uma pessoa pode ter com este jogo — a de nunca conseguir abri-lo.
