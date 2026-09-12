## Context

Ver `proposal.md — Why`. Restrições que definem o que é aceitável aqui:

- O valor do projeto é abrir sem build. Qualquer ferramenta adicionada tem que ser opcional
  para **jogar** e obrigatória apenas para **desenvolver**.
- O código usa scripts globais e `window.X`, sem módulos nem `import`. Lint configurado por
  padrão para módulos ES produziria dezenas de falsos positivos.
- Os defeitos que a auditoria encontrou não são pegáveis por análise estática: prisão na
  fase de obstáculos, foco que não entra no diálogo, 28 MB de áudio. Todos exigem abrir o
  jogo num navegador de verdade.
- O ambiente de execução destes testes já tem Chromium disponível.

## Goals / Non-Goals

**Goals:**

- Impedir que os defeitos já encontrados voltem sem ninguém perceber.
- Manter o jogo abrindo com duplo-clique, sem `npm install`.
- Tempo de CI curto o bastante para ninguém querer pular.

**Non-Goals:**

- Cobertura de testes por porcentagem, ou teste unitário de cada função.
- Testes de regressão visual ou comparação de imagens.
- Formatador automático de código — o estilo atual é consistente e não é fonte de atrito.
- Publicação automatizada ou pipeline de deploy.

## Decisions

### 1. `package.json` com `devDependencies` apenas, sem `dependencies`

O campo `dependencies` fica vazio: nada do que o jogo carrega vem do npm. Quem só quer
jogar, ignora o arquivo. Quem vai desenvolver, roda `npm install` e ganha lint e testes.

### 2. Lint configurado para navegador e scripts globais

Ambiente de navegador, sem módulos, com os globais do projeto (`GameManager`,
`AudioManager`, `SceneRenderer`, `LoadingScreen`, `PixelSprites`, `GameData`,
`Season2Data`) declarados. Apenas duas regras entram como erro de imediato — variável e
parâmetro não utilizados — porque foram exatamente os padrões apontados na auditoria. O
resto entra como aviso, para o lint não virar obstáculo logo na primeira execução.

*Alternativa considerada:* adotar um preset rigoroso de imediato. Rejeitada: geraria uma
enxurrada de apontamentos de estilo num código que funciona, e o primeiro reflexo seria
desligar o lint.

### 3. O teste de fumaça é o contrato executável da auditoria

Cada verificação do teste corresponde a um achado do relatório: carrega sem erro no console,
chega ao mapa nas duas temporadas, respeita o orçamento de bytes, não requisita domínio de
terceiros. É o mesmo roteiro que a auditoria fez à mão, agora automatizado.

*Alternativa considerada:* testes unitários das funções de `game.js`. Rejeitadas como foco
inicial: o código é fortemente acoplado ao DOM e ao canvas, e o custo de destrinchá-lo para
teste unitário é maior do que o de rodar o jogo de verdade.

### 4. O orçamento de bytes é uma asserção, não um relatório

O teste falha quando o total transferido no primeiro carregamento passa do limite. Sem isso,
os 28 MB voltam na primeira vez que alguém acrescentar uma trilha nova, e ninguém fica
sabendo até um celular travar.

### 5. CI em dois passos, sem matriz

Um único job: lint, depois teste de fumaça, em Chromium. Nada de matriz de sistemas
operacionais ou de versões de Node — o alvo é um jogo estático, e um job rápido é um job que
as pessoas esperam terminar.

## Risks / Trade-offs

- **Teste de navegador instável na CI** → o único fluxo assíncrono é a tela de carregamento;
  a espera é por condição observável, nunca por tempo fixo.
- **Orçamento de bytes gerando falha chata** → o limite é declarado num ponto único e
  comentado, para ser ajustado conscientemente quando a mudança for intencional.
- **Lint permissivo demais para ter valor** → as duas regras estritas cobrem o que a
  auditoria achou de fato; a régua sobe depois, com o código já limpo.
- **`npm install` virar pré-requisito para jogar** → verificado explicitamente na tarefa
  1.2, abrindo o jogo numa cópia sem dependências instaladas.
