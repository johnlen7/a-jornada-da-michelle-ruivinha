# dialogos-acessiveis Specification

## Purpose
Define como as janelas modais do jogo se comportam para quem joga por teclado, com leitor de
tela ou com sensibilidade a movimento, de modo que perguntas, momento final e desfechos da
corrida sejam utilizáveis sem depender de enxergar a tela ou de usar o mouse.

## Requirements

### Requirement: Foco entra no diálogo ao abrir

Ao exibir um diálogo, o jogo SHALL mover o foco do teclado para dentro dele, posicionando-o
no primeiro controle acionável.

#### Scenario: Diálogo de pergunta abre

- **WHEN** o jogador aciona a interação junto ao objeto de uma fase de pergunta
- **THEN** o diálogo é exibido
- **AND** o foco do teclado está no primeiro botão de opção

#### Scenario: Diálogo do momento final abre

- **WHEN** o diálogo do momento final é exibido
- **THEN** o foco do teclado está na primeira opção de resposta

### Requirement: Foco fica contido no diálogo

Enquanto um diálogo estiver aberto, a navegação por `Tab` e `Shift+Tab` SHALL circular
apenas entre os controles do próprio diálogo.

#### Scenario: Tab circula dentro do diálogo

- **WHEN** o jogador pressiona `Tab` repetidamente com um diálogo aberto
- **THEN** o foco percorre apenas os controles do diálogo
- **AND** após o último controle o foco volta ao primeiro

#### Scenario: Controles de fundo não recebem foco

- **WHEN** um diálogo está aberto
- **THEN** o botão de som, os controles de toque e demais elementos fora do diálogo não recebem foco por teclado

### Requirement: Diálogo dispensável fecha com ESC

Um diálogo que pode ser dispensado sem escolha SHALL fechar ao pressionar `ESC`, devolvendo
o foco ao elemento que o tinha antes da abertura e devolvendo o controle da personagem ao
jogador.

#### Scenario: Fechar pergunta com ESC

- **WHEN** o jogador pressiona `ESC` com o diálogo de pergunta aberto
- **THEN** o diálogo fecha
- **AND** o jogador volta a controlar a personagem na fase
- **AND** a pergunta continua pendente e pode ser aberta de novo

#### Scenario: Diálogo de desfecho exige escolha

- **WHEN** o jogador pressiona `ESC` num diálogo que exige uma escolha para prosseguir
- **THEN** o diálogo permanece aberto

### Requirement: Anúncio dirigido para leitores de tela

O jogo SHALL anunciar a leitores de tela apenas o conteúdo relevante do momento — título e
texto do diálogo, resultado de uma resposta e mudança de fase — e SHALL evitar anunciar
repetidamente elementos de interface que não mudaram de significado.

#### Scenario: Pergunta é anunciada ao abrir

- **WHEN** um diálogo de pergunta é exibido
- **THEN** o título e o texto da pergunta são anunciados

#### Scenario: Resultado da resposta é anunciado

- **WHEN** o jogador escolhe uma opção e o jogo mostra o resultado
- **THEN** o texto do resultado é anunciado uma vez

#### Scenario: HUD não é anunciado continuamente

- **WHEN** o jogador movimenta a personagem pelo mapa sem abrir diálogo algum
- **THEN** nenhum anúncio é emitido por causa do HUD ou do indicador de fase

#### Scenario: Mudança de fase é anunciada

- **WHEN** o jogador entra numa fase
- **THEN** o nome da fase é anunciado uma vez

### Requirement: Foco sempre visível

Todo controle acionável do jogo SHALL apresentar indicação visual de foco perceptível
quando alcançado pelo teclado.

#### Scenario: Percorrer a tela inicial por teclado

- **WHEN** o jogador percorre os controles da tela de escolha de temporada usando `Tab`
- **THEN** cada controle alcançado exibe indicação visual de foco

#### Scenario: Percorrer as opções de uma pergunta

- **WHEN** o jogador percorre os botões de opção de um diálogo usando `Tab`
- **THEN** cada opção alcançada exibe indicação visual de foco

### Requirement: Respeito a preferência de movimento reduzido

Quando o sistema do jogador indica preferência por movimento reduzido, o jogo SHALL suprimir
ou atenuar as animações decorativas, mantendo intactos o conteúdo, a jogabilidade e os
elementos que comunicam estado.

#### Scenario: Preferência de movimento reduzido ativa

- **WHEN** o jogador abre o jogo com preferência de movimento reduzido ativa
- **THEN** as animações decorativas de pulsação, brilho e partículas não são executadas
- **AND** todos os textos, botões e cenas continuam visíveis e acionáveis

#### Scenario: Jogabilidade preservada

- **WHEN** o jogador joga a fase de obstáculos com preferência de movimento reduzido ativa
- **THEN** os obstáculos, os itens e a personagem continuam se movendo normalmente
