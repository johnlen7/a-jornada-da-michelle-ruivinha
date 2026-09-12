## Purpose

Define o contrato entre os arquivos de conteúdo editável das temporadas e o motor do jogo:
o que uma temporada precisa declarar para ser jogável, o que o motor garante
independentemente da quantidade de fases, e como conteúdo inválido ou progresso salvo
incompatível é tratado.

## ADDED Requirements

### Requirement: Conteúdo declarado inteiramente nos arquivos de dados

Cada temporada SHALL declarar no seu arquivo de conteúdo tudo o que define suas fases —
nome, tipo, ponto de interação, objeto interativo, trilha e posição de entrada da
personagem — sem que o motor precise conhecer nenhuma temporada em particular.

#### Scenario: Nenhuma temporada é especial no motor

- **WHEN** o código do motor é inspecionado em busca de dados de fase
- **THEN** nenhum nome de fase, ponto de interação, objeto ou trilha de uma temporada específica aparece nele

#### Scenario: Editar uma trilha pelo conteúdo

- **WHEN** a trilha declarada para uma fase é alterada no arquivo de conteúdo e a página é recarregada
- **THEN** a fase passa a tocar a nova trilha

#### Scenario: Editar um ponto de interação pelo conteúdo

- **WHEN** o ponto de interação declarado para uma fase é alterado no arquivo de conteúdo e a página é recarregada
- **THEN** a dica de interação passa a aparecer na nova posição

### Requirement: Número livre de fases e perguntas

O jogo SHALL funcionar com qualquer quantidade de fases e de perguntas por temporada, sem
limite fixo no motor.

#### Scenario: Acrescentar uma fase

- **WHEN** uma nova fase com sua pergunta e seu ponto no mapa é acrescentada ao arquivo de conteúdo de uma temporada
- **THEN** o mapa exibe o novo ponto
- **AND** a nova fase é jogável
- **AND** a progressão desbloqueia os pontos na ordem declarada até o final

#### Scenario: Remover uma fase

- **WHEN** uma fase e seu ponto no mapa são removidos do arquivo de conteúdo
- **THEN** a temporada continua jogável do início ao final
- **AND** nenhum erro aparece no console

#### Scenario: Temporada com uma fase só

- **WHEN** uma temporada declara apenas a fase do momento final
- **THEN** essa fase fica desbloqueada desde o início e a temporada pode ser concluída

### Requirement: Movimentação limitada por declaração da fase

Os limites de movimentação da personagem dentro de uma fase SHALL vir da declaração daquela
fase, com um limite padrão aplicado quando a fase não declara nenhum.

#### Scenario: Fase declara seus limites

- **WHEN** uma fase declara limites de movimentação e o jogador tenta atravessá-los
- **THEN** a personagem é contida nos limites declarados

#### Scenario: Fase sem limites declarados

- **WHEN** uma fase não declara limites de movimentação
- **THEN** o limite padrão é aplicado
- **AND** a personagem permanece dentro da área visível da cena

### Requirement: Conteúdo conferido ao carregar

Ao carregar uma temporada, o jogo SHALL conferir a consistência do conteúdo declarado e
SHALL registrar um aviso descritivo para cada problema encontrado, nomeando a temporada, a
fase e o campo envolvido, sem impedir que o resto do jogo seja jogado.

#### Scenario: Fase aponta para pergunta inexistente

- **WHEN** uma temporada com uma fase apontando para pergunta inexistente é carregada
- **THEN** um aviso nomeando a temporada, a fase e o identificador é registrado no console

#### Scenario: Quantidade de pontos do mapa não bate com a de fases

- **WHEN** uma temporada declara uma quantidade de pontos no mapa diferente da de fases
- **THEN** um aviso descrevendo a divergência é registrado no console

#### Scenario: Fase de pergunta sem ponto de interação

- **WHEN** uma fase do tipo pergunta não declara ponto de interação
- **THEN** um aviso nomeando a fase e o campo ausente é registrado no console

#### Scenario: Conteúdo válido não gera aviso

- **WHEN** uma temporada com conteúdo consistente é carregada
- **THEN** nenhum aviso de conteúdo é registrado

### Requirement: Progresso salvo tratado por versão

O jogo SHALL registrar a versão do conteúdo junto do progresso salvo e SHALL comparar essa
versão ao carregar, aplicando o progresso apenas quando ele for compatível com o conteúdo
atual e descartando-o com aviso quando não for.

#### Scenario: Progresso compatível

- **WHEN** o jogador reabre o jogo e o progresso salvo corresponde à versão do conteúdo atual
- **THEN** as fases concluídas e os pontos desbloqueados são restaurados

#### Scenario: Progresso de versão incompatível

- **WHEN** o progresso salvo pertence a uma versão de conteúdo incompatível com a atual
- **THEN** o progresso é descartado
- **AND** um aviso é registrado no console
- **AND** a temporada recomeça com apenas o primeiro ponto desbloqueado

#### Scenario: Progresso salvo corrompido

- **WHEN** o progresso salvo não pode ser interpretado
- **THEN** o jogo inicia a temporada do começo sem erro visível ao jogador

#### Scenario: Progresso de uma temporada não afeta a outra

- **WHEN** o progresso de uma temporada é descartado por incompatibilidade
- **THEN** o progresso da outra temporada permanece intacto
