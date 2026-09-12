## Purpose

Define como o jogo liga cada fase ao seu conteúdo, decide o que já foi concluído,
desbloqueia os pontos do mapa e se comporta quando os arquivos de conteúdo estão mal
configurados por quem edita perguntas e textos.

## ADDED Requirements

### Requirement: Fase com pergunta inexistente falha de forma visível

Quando uma fase referencia uma pergunta que não existe no conteúdo da temporada, o jogo
SHALL registrar um aviso identificando a fase e o identificador não encontrado, e SHALL
tratar a fase como não interativa em vez de exibir uma dica de interação que não leva a
nada.

#### Scenario: Identificador de pergunta digitado errado

- **WHEN** uma fase do tipo pergunta aponta para um identificador que não existe na lista de perguntas e o jogador entra nessa fase
- **THEN** um aviso identificando a fase e o identificador é registrado no console
- **AND** a dica de interação não é exibida ao se aproximar do ponto de interação
- **AND** acionar a interação não abre diálogo algum

#### Scenario: Progressão não trava

- **WHEN** o jogador está numa fase cuja pergunta não existe
- **THEN** sair da fase pela porta continua funcionando
- **AND** as demais fases já desbloqueadas continuam acessíveis pelo mapa

### Requirement: Conclusão de fase é derivada do conteúdo existente

O jogo SHALL considerar concluída apenas a fase cujo objetivo foi de fato cumprido —
pergunta respondida corretamente, corrida vencida ou momento final aceito — e SHALL tratar
como pendente qualquer fase cujo objetivo não possa ser avaliado.

#### Scenario: Fase sem objetivo avaliável

- **WHEN** o objetivo de uma fase não pode ser avaliado por falta de conteúdo correspondente
- **THEN** a fase é tratada como pendente
- **AND** o marcador de objetivo pendente da fase não é desenhado como concluído

#### Scenario: Pergunta respondida corretamente

- **WHEN** o jogador escolhe a opção correta de uma pergunta
- **THEN** a fase é marcada como concluída
- **AND** o ponto seguinte do mapa é desbloqueado
- **AND** o progresso é salvo

### Requirement: Desbloqueio sequencial do mapa

O jogo SHALL manter desbloqueado o primeiro ponto do mapa de cada temporada e SHALL
desbloquear cada ponto seguinte somente quando a fase anterior for concluída, destacando o
próximo ponto pendente.

#### Scenario: Primeira abertura de uma temporada

- **WHEN** o jogador escolhe uma temporada sem progresso salvo
- **THEN** apenas o primeiro ponto do mapa está desbloqueado
- **AND** o primeiro ponto aparece destacado como próximo objetivo

#### Scenario: Destaque avança com a conclusão

- **WHEN** o jogador conclui a fase de um ponto do mapa
- **THEN** o destaque de próximo objetivo passa para o ponto seguinte desbloqueado

#### Scenario: Ponto bloqueado não abre

- **WHEN** o jogador se aproxima de um ponto do mapa ainda bloqueado e aciona a interação
- **THEN** nenhuma fase é aberta
- **AND** nenhuma dica de interação é exibida para aquele ponto

### Requirement: Áudio pausa em segundo plano

O jogo SHALL interromper a reprodução de trilha e a agenda de notas sintéticas enquanto a
aba estiver oculta, e SHALL retomá-la ao voltar, respeitando a preferência de som do
jogador.

#### Scenario: Trocar de aba durante a partida

- **WHEN** o jogador troca de aba com uma trilha tocando
- **THEN** a trilha para e nenhuma nota nova é agendada

#### Scenario: Voltar à aba

- **WHEN** o jogador volta para a aba do jogo com o som ligado
- **THEN** a trilha da cena atual volta a tocar

#### Scenario: Voltar à aba com som desligado

- **WHEN** o jogador volta para a aba do jogo com o som desligado
- **THEN** nenhuma trilha volta a tocar
