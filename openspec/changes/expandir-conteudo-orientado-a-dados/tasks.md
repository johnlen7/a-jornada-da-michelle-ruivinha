## 1. Registrar o comportamento atual

- [ ] 1.1 Percorrer as duas temporadas registrando, por fase, o ponto de interação, a trilha, a posição de entrada e os limites de movimentação observados, para servir de referência da migração
- [ ] 1.2 Confirmar que acrescentar uma quinta fase à Temporada 1 hoje quebra, e registrar o erro obtido

## 2. Registro de cenas

- [ ] 2.1 Criar o registro que liga identificador de cena à função de desenho e verificar que todas as cenas existentes estão registradas
- [ ] 2.2 Substituir a escolha de cena por índice pela busca no registro, verificando que cada fase das duas temporadas desenha a mesma cena de antes

## 3. Formato único de conteúdo

- [ ] 3.1 Passar a Temporada 1 para o formato completo em `src/data/gameData.js`, transcrevendo os valores registrados na tarefa 1.1 sem alterar nenhum deles
- [ ] 3.2 Remover do motor o array de pontos de interação da Temporada 1 e a decisão de tipo de fase por posição, verificando que nenhum dado de temporada resta no motor
- [ ] 3.3 Mover os limites de movimentação para a declaração de cada fase, com padrão no motor, verificando fase a fase que a personagem é contida como antes
- [ ] 3.4 Percorrer as duas temporadas comparando cada tela com a referência da tarefa 1.1 e confirmar que nada mudou visualmente

## 4. Quantidade livre de fases

- [ ] 4.1 Remover as suposições de quatro fases por temporada, verificando com uma temporada de teste de duas fases que o mapa, a progressão e o final funcionam
- [ ] 4.2 Acrescentar temporariamente uma quinta fase à Temporada 1 e verificar que ela aparece no mapa, é jogável e desbloqueia o final; remover depois do teste
- [ ] 4.3 Verificar que uma temporada declarando apenas a fase final é jogável do início ao fim

## 5. Conferência de conteúdo

- [ ] 5.1 Escrever a função pura de conferência de conteúdo e verificar que ela aponta pergunta inexistente, ponto de interação ausente, cena não registrada e divergência entre número de fases e de pontos do mapa
- [ ] 5.2 Chamar a conferência ao configurar a temporada, registrando cada problema com temporada, fase e campo, e verificar as mensagens com conteúdo propositalmente inválido
- [ ] 5.3 Verificar que conteúdo válido não gera aviso nenhum no console

## 6. Progresso por versão

- [ ] 6.1 Ler a versão do conteúdo ao carregar o progresso e descartar o progresso incompatível com aviso, verificando com uma versão alterada à mão no armazenamento do navegador
- [ ] 6.2 Verificar que progresso compatível continua sendo restaurado, incluindo o progresso já salvo por quem jogou antes desta change
- [ ] 6.3 Verificar que progresso corrompido faz a temporada começar do zero sem erro visível
- [ ] 6.4 Verificar que descartar o progresso de uma temporada não afeta a outra

## 7. Documentação

- [ ] 7.1 Levar para `src/data/gameData.js` os mesmos comentários em português de `season2Data.js`, verificando que os dois arquivos seguem a mesma estrutura
- [ ] 7.2 Documentar no README como acrescentar uma fase nova, e verificar seguindo o passo a passo numa cópia limpa
