# fase-de-obstaculos Specification

## Purpose
Define as regras da fase "Caminho do Altar" — a fase de corrida com obstáculos da
Temporada 2 — cobrindo como se entra, como se sai, o que acontece ao vencer ou perder e
quais saídas precisam existir em cada tipo de dispositivo.

## Requirements

### Requirement: Saída disponível em qualquer dispositivo

A fase de obstáculos SHALL oferecer ao menos uma forma de desistir e voltar ao mapa que
funcione sem teclado físico, disponível durante toda a fase.

#### Scenario: Desistir usando apenas toque

- **WHEN** o jogador está na fase de obstáculos num dispositivo sem teclado e aciona o controle de saída na tela
- **THEN** a fase termina
- **AND** o jogo volta ao mapa da temporada
- **AND** o progresso das fases já concluídas permanece intacto

#### Scenario: Tecla ESC continua funcionando

- **WHEN** o jogador está na fase de obstáculos num computador e pressiona `ESC`
- **THEN** a fase termina e o jogo volta ao mapa da temporada

#### Scenario: Controle de saída visível durante a corrida

- **WHEN** a fase de obstáculos está em andamento num dispositivo de toque
- **THEN** o controle de saída está visível e acionável na tela

### Requirement: Desistir não conclui a fase

Desistir da fase de obstáculos SHALL deixar a fase como não concluída, sem desbloquear o
próximo ponto do mapa.

#### Scenario: Mapa após desistência

- **WHEN** o jogador desiste da fase de obstáculos antes de alcançar a distância do objetivo
- **THEN** a fase segue marcada como pendente no mapa
- **AND** o ponto seguinte do mapa continua bloqueado
- **AND** entrar na fase de novo recomeça a corrida do início, com todas as vidas

### Requirement: Perder todas as vidas oferece recomeço ou saída

Quando as vidas acabam, o jogo SHALL apresentar ao jogador a escolha entre tentar de novo e
voltar ao mapa, sem fechar o jogo nem avançar a progressão.

#### Scenario: Vidas esgotadas

- **WHEN** o jogador perde a última vida
- **THEN** a corrida para
- **AND** aparece um diálogo com as opções de tentar de novo e de voltar ao mapa
- **AND** escolher tentar de novo recomeça a corrida com todas as vidas

### Requirement: Concluir a fase desbloqueia o próximo ponto

Alcançar a distância do objetivo SHALL marcar a fase como concluída, salvar o progresso e
desbloquear o ponto seguinte do mapa.

#### Scenario: Chegar ao altar

- **WHEN** a distância percorrida alcança a distância do objetivo configurada
- **THEN** a fase é marcada como concluída
- **AND** o progresso é salvo
- **AND** o ponto seguinte do mapa fica desbloqueado
- **AND** reabrir o jogo mantém a fase concluída

### Requirement: Estado da corrida vem da configuração da temporada

A fase SHALL obter distância do objetivo, velocidades, intervalo de surgimento de
obstáculos, número de vidas e tempo de invulnerabilidade da configuração de conteúdo da
temporada, sem valores de dificuldade fixos no motor do jogo.

#### Scenario: Ajuste de dificuldade pelo arquivo de conteúdo

- **WHEN** o número de vidas ou a distância do objetivo é alterado no arquivo de conteúdo da temporada e a página é recarregada
- **THEN** a fase passa a usar os novos valores
