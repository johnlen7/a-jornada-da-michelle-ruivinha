# instalacao-e-compartilhamento Specification

## Purpose
Define como o jogo é instalado, atualizado e apresentado fora do navegador: presença na tela
inicial do celular, funcionamento sem internet, chegada de novas versões a quem já instalou
e o que aparece quando alguém compartilha o link.

## Requirements

### Requirement: Jogo instalável na tela inicial

O jogo SHALL declarar nome, ícones, cor de tema e modo de exibição suficientes para o
navegador oferecer a instalação na tela inicial.

#### Scenario: Oferta de instalação

- **WHEN** o jogador abre o jogo num navegador com suporte a instalação
- **THEN** o navegador oferece adicionar o jogo à tela inicial

#### Scenario: Aparência após instalar

- **WHEN** o jogador abre o jogo pelo ícone instalado
- **THEN** o jogo abre sem a barra de endereços do navegador
- **AND** o ícone e o nome exibidos são os do jogo

### Requirement: Jogável sem internet

A partir da primeira visita completa, o jogo SHALL carregar e ser jogável do início ao fim
sem conexão de rede.

#### Scenario: Segunda abertura sem rede

- **WHEN** o jogador abre o jogo sem conexão, depois de já tê-lo aberto uma vez com conexão
- **THEN** a página do jogo carrega
- **AND** as duas temporadas podem ser percorridas até o final

#### Scenario: Perda de conexão durante a partida

- **WHEN** a conexão cai durante uma partida
- **THEN** o jogo continua funcionando sem erro visível ao jogador

#### Scenario: Som sem rede

- **WHEN** o jogador entra numa fase sem conexão e com o som ligado
- **THEN** há trilha sonora na cena, seja do arquivo em cache, seja a melodia sintética

### Requirement: Atualização alcança quem já instalou

Quando uma nova versão do jogo é publicada, o jogador SHALL recebê-la sem precisar limpar
dados do navegador ou reinstalar.

#### Scenario: Nova versão publicada

- **WHEN** uma nova versão é publicada e o jogador abre o jogo com conexão
- **THEN** a nova versão é obtida
- **AND** a versão nova está em uso na abertura seguinte, no mais tardar

#### Scenario: Arquivos antigos não sobrevivem à atualização

- **WHEN** o jogo passa a usar uma nova versão
- **THEN** os arquivos em cache da versão anterior são descartados

### Requirement: Progresso preservado entre versões

A instalação, a atualização e o funcionamento offline SHALL preservar o progresso salvo das
temporadas e a preferência de som do jogador.

#### Scenario: Progresso após atualização

- **WHEN** o jogador concluiu uma temporada e o jogo é atualizado para uma nova versão
- **THEN** a temporada continua marcada como concluída na tela de escolha

#### Scenario: Progresso entre navegador e aplicativo instalado

- **WHEN** o jogador avança no jogo instalado e depois abre a mesma origem no navegador
- **THEN** o progresso salvo é o mesmo

### Requirement: Link compartilhado mostra prévia

As páginas publicadas SHALL declarar título, descrição e imagem de prévia, de modo que
compartilhar o endereço em aplicativos de mensagem e redes sociais exiba uma apresentação do
jogo.

#### Scenario: Compartilhar em aplicativo de mensagem

- **WHEN** o endereço da página inicial é colado num aplicativo que gera prévia de link
- **THEN** a prévia mostra o título do jogo, uma descrição e uma imagem

#### Scenario: Descrição presente nas duas páginas

- **WHEN** os metadados da página inicial e da página do jogo são inspecionados
- **THEN** as duas declaram descrição, título de compartilhamento e imagem de prévia
