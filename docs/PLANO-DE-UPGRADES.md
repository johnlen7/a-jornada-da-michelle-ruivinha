# 🚀 Plano de Upgrades — A Jornada da Michelle Ruivinha

Plano derivado da [auditoria](AUDITORIA.md). Cada frente virou uma **change do OpenSpec**
em `openspec/changes/`, com proposta, specs de comportamento e lista de tarefas prontas
para implementar.

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

## Como trabalhar cada change

```bash
# ver tudo que está em aberto
npx @fission-ai/openspec@1 list

# ler uma proposta específica
npx @fission-ai/openspec@1 show otimizar-carregamento-de-midia

# validar antes de implementar
npx @fission-ai/openspec@1 validate --all --strict

# depois de implementar, arquivar (as specs viram o contrato oficial em openspec/specs/)
npx @fission-ai/openspec@1 archive otimizar-carregamento-de-midia
```

Dentro do Claude Code, os fluxos `/opsx:propose`, `/opsx:apply` e `/opsx:archive` fazem o
mesmo caminho de forma guiada.

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

| Métrica | Hoje | Meta |
| --- | --- | --- |
| Bytes baixados no primeiro carregamento | ~28 MB | < 1 MB |
| Tamanho do repositório | ~45 MB | < 5 MB |
| Arquivos HTML na raiz | 11 | 2 |
| Formas de sair da fase de obstáculos no celular | 0 | ≥ 1 |
| Diálogo navegável só por teclado | não | sim |
| Jogável sem internet | não | sim |
| Erros de JavaScript no console | 0 | 0 (mantido) |
| Taxa de quadros | 60 fps | 60 fps (mantido) |
