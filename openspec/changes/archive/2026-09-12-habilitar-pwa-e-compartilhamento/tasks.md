## 1. Pré-requisitos

- [x] 1.1 Confirmar que `otimizar-carregamento-de-midia` e `unificar-entrada-do-jogo` já foram aplicadas, e levantar a lista definitiva de arquivos que o jogo carrega
- [x] 1.2 Gerar os ícones e a imagem de prévia a partir da tela inicial do jogo, verificando que cada ícone fica abaixo de 50 KB e a prévia abaixo de 200 KB

## 2. Manifesto e instalação

- [x] 2.1 Criar o manifesto com nome, ícones, cor de tema e modo de exibição, e ligá-lo às duas páginas; verificar que o navegador oferece a instalação
- [x] 2.2 Instalar o jogo num celular e verificar que ele abre sem barra de endereços, com ícone e nome corretos
- [x] 2.3 Verificar que o layout em tela cheia continua correto em retrato e paisagem no aplicativo instalado

## 3. Funcionamento offline

- [x] 3.1 Criar o service worker com lista explícita de arquivos e constante de versão do cache, verificando na primeira visita que todos os arquivos são armazenados
- [x] 3.2 Aplicar cache-first aos recursos e network-first ao documento, verificando as duas estratégias no painel de rede
- [x] 3.3 Registrar o service worker com verificação de suporte e falha tratada, verificando que abrir o jogo por `file://` continua funcionando sem erro no console
- [x] 3.4 Verificar, com a rede desligada, que o jogo abre e que as duas temporadas podem ser percorridas até o final
- [x] 3.5 Verificar que há trilha sonora nas cenas sem rede, seja do cache, seja sintética
- [x] 3.6 Verificar que derrubar a conexão no meio de uma partida não gera erro visível ao jogador

## 4. Atualização de versão

- [x] 4.1 Descartar na ativação todo cache que não seja o da versão corrente, verificando a lista de caches após uma troca de versão
- [x] 4.2 Publicar uma alteração visível, reabrir o jogo com conexão e verificar que a versão nova está em uso na abertura seguinte
- [x] 4.3 Verificar que o progresso salvo e a preferência de som sobrevivem à atualização, concluindo uma temporada antes de atualizar

## 5. Compartilhamento

- [x] 5.1 Adicionar descrição, título de compartilhamento e imagem de prévia às duas páginas, verificando os metadados no código-fonte servido
- [x] 5.2 Verificar a prévia gerada ao colar o link num aplicativo de mensagem e numa ferramenta de inspeção de prévia

## 6. Verificação final

- [x] 6.1 Verificar que o progresso é o mesmo entre o aplicativo instalado e o navegador na mesma origem
- [x] 6.2 Documentar no README como desregistrar o service worker durante o desenvolvimento
- [x] 6.3 Confirmar console sem erros, 60 fps mantidos e orçamento de bytes do primeiro carregamento ainda respeitado
