## 1. Confirmar o que é legado

- [x] 1.1 Confirmar, arquivo por arquivo, que nenhuma das páginas legadas é referenciada por `index.html` ou pela página oficial, e registrar a lista final de remoção
- [x] 1.2 Confirmar que `css/styles.css` não é referenciado por nenhum HTML do projeto

## 2. Unificar a entrada

- [x] 2.1 Renomear a página oficial do jogo para um nome estável e sem termo de versão, verificando que a página abre e o jogo inicia
- [x] 2.2 Atualizar o link da página inicial e verificar que o botão de começar leva ao jogo
- [x] 2.3 Remover as páginas legadas e `css/styles.css`, verificando que a página inicial e a do jogo continuam funcionando com o servidor estático local
- [x] 2.4 Verificar que nenhuma URL de versão antiga responde com conteúdo pelo servidor estático

## 3. Fonte servida pelo projeto

- [x] 3.1 Adicionar o arquivo da fonte ao projeto sob `assets/`, com a licença de uso registrada, verificando o tamanho final do arquivo
- [x] 3.2 Substituir o `@import` do CDN pela declaração local nas duas páginas, verificando que nenhuma requisição a domínio de terceiros é feita na abertura
- [x] 3.3 Declarar a pilha de fontes alternativa e verificar, com o arquivo de fonte bloqueado, que os textos continuam legíveis e contidos nos seus elementos
- [x] 3.4 Verificar que a tipografia pretendida aparece com todo o acesso externo bloqueado

## 4. Documentação

- [x] 4.1 Atualizar a seção de estrutura do README para refletir os arquivos que restaram
- [x] 4.2 Atualizar as instruções de execução e verificar que seguir o README leva ao jogo funcionando
- [x] 4.3 Registrar no README que as versões antigas seguem recuperáveis pelo histórico do git

## 5. Verificação final

- [x] 5.1 Percorrer as duas temporadas na página renomeada e confirmar que tudo funciona como antes
- [x] 5.2 Confirmar em viewport de celular, retrato e paisagem, que o layout continua correto
- [x] 5.3 Confirmar que o console permanece sem erros e sem requisições falhas
