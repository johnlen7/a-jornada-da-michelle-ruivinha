## Purpose

Define como o jogo baixa, prepara e degrada mídia — em especial as trilhas sonoras — de
forma que a primeira abertura seja rápida em rede móvel e que falha de mídia nunca impeça
alguém de jogar.

## ADDED Requirements

### Requirement: Orçamento de bytes do primeiro carregamento

O jogo SHALL transferir menos de 1 MB de recursos entre a abertura da página e o momento em
que a tela de escolha de temporada fica utilizável, contando todas as requisições de rede.

#### Scenario: Abertura em rede limpa

- **WHEN** a página oficial do jogo é aberta com cache vazio e o jogo chega à tela de escolha de temporada
- **THEN** a soma dos bytes de resposta de todas as requisições de rede é menor que 1 MB

#### Scenario: Nenhuma faixa é baixada por inteiro antes de ser necessária

- **WHEN** a página é aberta com cache vazio e nenhuma fase foi iniciada
- **THEN** nenhum arquivo de trilha sonora é transferido integralmente

### Requirement: Instância única por faixa de áudio

O jogo SHALL manter no máximo um objeto de mídia por arquivo de trilha sonora, compartilhado
entre a tela de carregamento e o sistema de áudio, de modo que o mesmo arquivo nunca seja
requisitado em paralelo por dois consumidores.

#### Scenario: Tela de carregamento e sistema de áudio usam a mesma faixa

- **WHEN** o jogo é aberto e em seguida entra na fase que usa a trilha de Hogwarts
- **THEN** o arquivo `hogwarts.mp3` é requisitado por no máximo um consumidor por vez
- **AND** a faixa que toca na fase é a mesma instância que a tela de carregamento verificou

### Requirement: Trilha carregada sob demanda

O jogo SHALL iniciar a transferência do arquivo de uma trilha apenas quando a cena que a usa
começar, ou quando o jogador der um gesto que indique que aquela cena vai começar.

#### Scenario: Temporada 2 não baixa trilhas da Temporada 1

- **WHEN** o jogador abre o jogo, escolhe a Temporada 2 e percorre suas fases até o altar
- **THEN** nenhum arquivo de trilha exclusivo da Temporada 1 é transferido

#### Scenario: Entrar na fase busca a trilha

- **WHEN** o jogador entra numa fase cuja trilha é um arquivo de áudio ainda não baixado
- **THEN** o jogo inicia a transferência daquele arquivo naquele momento

### Requirement: Carregamento nunca bloqueia por causa de mídia

A tela de carregamento SHALL entregar o jogo jogável mesmo quando um recurso de mídia
demora, falha ou é bloqueado pelo navegador, sem exigir ação do jogador.

#### Scenario: Arquivo de áudio indisponível

- **WHEN** um arquivo de trilha responde com erro ou não responde
- **THEN** a tela de carregamento conclui mesmo assim
- **AND** o jogo fica jogável
- **AND** a tela indica que a trilha alternativa será usada

#### Scenario: Tempo máximo da tela de carregamento

- **WHEN** a página é aberta com rede lenta
- **THEN** a tela de carregamento conclui em no máximo 3 segundos

### Requirement: Degradação sonora sem silêncio

O jogo SHALL tocar a melodia sintética equivalente sempre que a trilha em arquivo de uma
cena não puder ser reproduzida, inclusive quando a falha acontece depois do carregamento
inicial.

#### Scenario: Falha de rede no meio da partida

- **WHEN** o jogador entra numa fase cuja trilha em arquivo falha ao ser buscada durante a partida
- **THEN** a melodia sintética daquela cena começa a tocar
- **AND** nenhuma mensagem de erro é mostrada ao jogador

#### Scenario: Som desligado é respeitado

- **WHEN** o jogador está com o som desligado e entra numa fase
- **THEN** nenhum arquivo de trilha é transferido
- **AND** nenhuma melodia sintética é tocada

### Requirement: Repositório sem mídia órfã

O repositório SHALL conter apenas arquivos de mídia que algum código do jogo carrega em
tempo de execução.

#### Scenario: Auditoria de mídia

- **WHEN** cada arquivo sob `assets/` é confrontado com as referências do código de execução
- **THEN** todo arquivo presente tem ao menos um consumidor em tempo de execução

#### Scenario: Jogo segue idêntico após a remoção

- **WHEN** as duas temporadas são percorridas do início ao fim depois da remoção das mídias órfãs
- **THEN** todas as cenas, personagens e objetos são desenhados como antes
- **AND** nenhum erro de recurso não encontrado aparece no console
