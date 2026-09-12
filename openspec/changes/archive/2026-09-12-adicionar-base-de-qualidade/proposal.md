## Why

O projeto não tem `package.json`, lint, teste, CI nem licença. Hoje isso é sustentável
porque o jogo é pequeno e tem um único autor, mas a auditoria só encontrou os defeitos
principais rodando o jogo num navegador de verdade — manualmente, uma vez. Nada impede que
a próxima edição de `season2Data.js` ou o próximo ajuste em `game.js` volte a quebrar
silenciosamente, e ninguém ficaria sabendo.

As mudanças planejadas nas outras frentes (remover 31 MB de imagens, apagar dez páginas
legadas, mexer no carregamento de áudio) são exatamente o tipo de alteração que pede uma
rede de proteção automática antes de acontecer.

## What Changes

- `package.json` apenas com ferramentas de desenvolvimento: o jogo continua abrindo sem
  nenhum passo de build, instalação ou empacotamento.
- Lint de JavaScript configurado para o estilo já praticado no código (scripts globais,
  `window.X`, sem módulos).
- Teste de fumaça automatizado que abre o jogo num navegador headless e verifica o que a
  auditoria verificou à mão: o jogo carrega, o console fica sem erros, o fluxo até o mapa
  funciona e o orçamento de bytes do primeiro carregamento é respeitado.
- CI no GitHub Actions rodando lint e teste de fumaça a cada push e pull request.
- `LICENSE` e uma seção de contribuição mínima no README.

## Capabilities

### New Capabilities

Nenhuma — esta change é só ferramental, licença e documentação. Nenhum comportamento
observável do jogo muda, então nenhuma spec muda. A change declara `skip_specs: true`.

### Modified Capabilities

Nenhuma.

## Impact

- Novos arquivos: `package.json`, configuração do lint, testes sob `tests/`, workflow em
  `.github/workflows/`, `LICENSE`.
- `.gitignore` — entradas de dependências e artefatos de teste.
- `README.md` — seção de desenvolvimento.
- Nenhum arquivo de `src/`, nenhum HTML do jogo e nenhum conteúdo é alterado por esta
  change; o jogo continua abrindo direto do arquivo, sem `npm install`.
