## 1. Base do projeto

- [x] 1.1 Criar `package.json` apenas com dependências de desenvolvimento e scripts de lint e teste, verificando que `npm install` conclui sem avisos de vulnerabilidade
- [x] 1.2 Confirmar que o jogo continua abrindo por servidor estático sem nenhum passo de build ou instalação
- [x] 1.3 Atualizar `.gitignore` com as pastas de dependências e artefatos de teste, verificando que `git status` fica limpo após instalar e rodar os testes

## 2. Lint

- [x] 2.1 Configurar o lint para o estilo já praticado (scripts globais, ambiente de navegador, sem módulos), verificando que ele reconhece `window.GameManager` e afins sem falso positivo
- [x] 2.2 Rodar o lint sobre `src/` e corrigir apenas os apontamentos reais, verificando que a execução termina sem erros
- [x] 2.3 Registrar como regra de erro os padrões que a auditoria encontrou (variável não utilizada, parâmetro não utilizado) e verificar que eles seriam apontados

## 3. Teste de fumaça

- [x] 3.1 Configurar o navegador headless e um servidor estático para os testes, verificando que a página do jogo abre no ambiente de teste
- [x] 3.2 Testar que o jogo carrega, sai da tela de carregamento e chega à escolha de temporada sem erro no console
- [x] 3.3 Testar o fluxo até o mapa nas duas temporadas, verificando o estado de tela resultante
- [x] 3.4 Testar que o total de bytes transferidos no primeiro carregamento fica abaixo do orçamento definido, falhando o teste se passar
- [x] 3.5 Testar que nenhuma requisição a domínio de terceiros é feita na abertura

## 4. Integração contínua

- [x] 4.1 Criar o workflow do GitHub Actions rodando lint e teste de fumaça em push e pull request, verificando a primeira execução verde
- [x] 4.2 Forçar uma falha proposital (erro de lint e depois erro de console) e verificar que a CI fica vermelha nos dois casos, revertendo em seguida

## 5. Licença e documentação

- [x] 5.1 Adicionar o arquivo `LICENSE` com a licença escolhida pelo autor
- [x] 5.2 Adicionar ao README uma seção curta de desenvolvimento com os comandos de lint e teste, verificando que seguir os passos funciona numa cópia limpa do repositório
