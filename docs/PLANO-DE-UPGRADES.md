# 🚀 Plano de Upgrades — A Jornada da Michelle Ruivinha

Plano derivado da [auditoria](AUDITORIA.md). Cada frente virou uma **change do OpenSpec**,
com proposta, specs de comportamento, decisões de desenho e lista de tarefas — implementada,
verificada e arquivada em `openspec/changes/archive/`. As specs de comportamento continuam
vivas em `openspec/specs/`, agora como o contrato vigente do jogo.

> ✅ **Status: as sete changes foram implementadas.** Veja a tabela de métricas no fim
> deste documento para o resultado medido de cada uma.

---

## Princípios do plano

1. **O jogo tem que abrir.** Nada importa mais do que o primeiro carregamento no celular.
2. **Nada quebra o que já funciona.** O progresso salvo das duas temporadas é preservado.
3. **Quem edita conteúdo não programa.** Cada mudança mantém (ou melhora) a edição de
   perguntas e textos em `src/data/`.
4. **Sem build obrigatório.** O jogo continua abrindo com um duplo-clique / servidor
   estático simples. Ferramentas de qualidade são opcionais para jogar.

---

## Ondas

### 🌊 Onda 1 — Fazer o jogo abrir rápido *(bloqueia o resto)*

| Change | Entrega | Achados |
| --- | --- | --- |
| `otimizar-carregamento-de-midia` | Derruba os 28 MB de áudio por carregamento e remove os 31 MB de PNGs mortos | A1, A2 |

**Resultado esperado:** primeiro carregamento abaixo de 1 MB, contra ~28 MB hoje.
É o maior ganho do plano e o mais barato de executar.

### 🌊 Onda 2 — Consertar o que está quebrado

| Change | Entrega | Achados |
| --- | --- | --- |
| `corrigir-fluxo-das-fases` | Saída da fase de obstáculos no celular; fase com `questionId` órfão deixa de travar; música pausa em segundo plano | A3, M1, M6, B1, B2 |
| `tornar-dialogos-acessiveis` | Foco, focus trap, ESC para fechar, anúncios de leitor de tela corretos e `prefers-reduced-motion` | M2, B7 |

### 🌊 Onda 3 — Arrumar a casa

| Change | Entrega | Achados |
| --- | --- | --- |
| `unificar-entrada-do-jogo` | Uma única porta de entrada; 213 KB de HTML legado e o CSS morto saem do repositório; fonte deixa de depender de CDN | M3, M4, M5 |
| `adicionar-base-de-qualidade` | `package.json`, lint, teste de fumaça automatizado, CI e LICENSE | B6 |

### 🌊 Onda 4 — Upgrades de verdade

| Change | Entrega | Achados |
| --- | --- | --- |
| `habilitar-pwa-e-compartilhamento` | Instalável na tela inicial, jogável offline, link com prévia bonita no WhatsApp | B5 |
| `expandir-conteudo-orientado-a-dados` | Temporada 1 vira orientada a dados como a 2; número livre de fases e perguntas; migração de progresso versionada | B3, B4 |

---

## Ordem recomendada e dependências

```txt
otimizar-carregamento-de-midia
        │
        ├──> corrigir-fluxo-das-fases ─────┐
        │                                  │
        ├──> tornar-dialogos-acessiveis ───┤
        │                                  │
        └──> unificar-entrada-do-jogo ─────┤
                     │                     │
                     ├──> adicionar-base-de-qualidade
                     │
                     └──> habilitar-pwa-e-compartilhamento

expandir-conteudo-orientado-a-dados  (independente; depois de corrigir-fluxo-das-fases)
```

- `unificar-entrada-do-jogo` vem depois da otimização de mídia para que a limpeza de
  arquivos aconteça uma vez só.
- `adicionar-base-de-qualidade` vem depois da unificação porque o teste de fumaça precisa
  saber qual é a página oficial.
- `habilitar-pwa-e-compartilhamento` precisa da lista final de arquivos para o cache
  offline — ou seja, depois da limpeza e da otimização.
- `expandir-conteudo-orientado-a-dados` toca `normalizeSeason1`, o mesmo trecho que
  `corrigir-fluxo-das-fases` ajusta; fazer na ordem evita conflito.

---

## Como trabalhar uma change (referência para a próxima)

As sete changes deste plano já foram implementadas e arquivadas — não há nenhuma em
aberto. Para uma próxima rodada de upgrades, o caminho é o mesmo:

```bash
# propor uma change nova (cria proposal, specs, design e tasks)
npx @fission-ai/openspec@1 new change "nome-da-mudanca"

# ver tudo que está em aberto
npx @fission-ai/openspec@1 list

# ler uma proposta específica
npx @fission-ai/openspec@1 show nome-da-mudanca

# validar antes de implementar
npx @fission-ai/openspec@1 validate --all --strict

# depois de implementar, arquivar (as specs viram o contrato oficial em openspec/specs/)
npx @fission-ai/openspec@1 archive nome-da-mudanca
```

Dentro do Claude Code, os fluxos `/opsx:propose`, `/opsx:apply` e `/opsx:archive` fazem o
mesmo caminho de forma guiada. As specs já arquivadas de cada capacidade do jogo (áudio,
progressão de fases, acessibilidade, entrega, PWA, conteúdo das temporadas) estão em
`openspec/specs/` e servem de referência de comportamento para qualquer mudança futura.

---

## Fora de escopo (por ora)

Ideias boas que **não** entraram no plano, para não inflar o projeto:

- **Álbum de memórias / galeria de fotos** — depende de material que não está no repo.
- **Placar e ranking do runner** — exigiria backend; o jogo é estático de propósito.
- **Tradução / i18n** — o jogo é escrito para uma pessoa específica, em português.
- **Migrar para um framework ou bundler** — o JS vanilla com scripts globais está
  adequado ao tamanho do projeto e mantém o "abre com duplo-clique".
- **Reescrever a arte em PNG** — a pixel-art em código é mais leve e já tem cache.

---

## Como saber se deu certo

| Métrica | Antes | Meta | **Depois de implementado** |
| --- | --- | --- | --- |
| Bytes baixados no primeiro carregamento | ~28 MB | < 1 MB | **~169 KB** (medido, Playwright) |
| Tamanho do repositório (sem `.git`/`node_modules`) | ~45 MB | < 5 MB | **~3,6 MB** |
| Arquivos HTML na raiz | 11 | 2 | **2** (`index.html`, `jogo.html`) |
| Formas de sair da fase de obstáculos no celular | 0 | ≥ 1 | **2** (botão 🚪 Sair com confirmação, e ESC no teclado) |
| Diálogo navegável só por teclado | não | sim | **sim** — foco entra, Tab fica contido, ESC fecha o dispensável |
| Jogável sem internet | não | sim | **sim** — instalável (PWA) e offline a partir da 2ª visita |
| Erros de JavaScript no console | 0 | 0 (mantido) | **0** |
| Taxa de quadros | 60 fps | 60 fps (mantido) | **60 fps** |
| Conteúdo mal configurado trava o jogo | sim (silenciosamente) | não | **não** — avisa no console, fase fica sem interação, resto do jogo funciona |
| Nº de fases por temporada assumido pelo motor | fixo (4) | livre | **livre** — testado com 5 fases numa temporada |
| Testes automatizados | 0 | ≥ 1 suíte | **15 testes** (`tests/smoke.spec.js`), rodando em CI a cada push |

Todas as linhas acima têm verificação automatizada em `npm test` (Playwright) ou foram
medidas diretamente durante a implementação — nenhum número é estimado.
