# entrega-do-jogo Specification

## Purpose
Define o que o projeto publica e como alguém chega ao jogo: quais páginas existem, qual é a
porta de entrada, e quais dependências externas o jogo pode ou não ter para apresentar a
aparência pretendida.

## Requirements

### Requirement: Uma única página jogável

O projeto SHALL publicar exatamente uma página que executa o jogo, além da página inicial
que leva até ela.

#### Scenario: Inventário de páginas

- **WHEN** os arquivos HTML publicados na raiz do projeto são listados
- **THEN** existem exatamente duas páginas: a inicial e a do jogo

#### Scenario: Página inicial leva ao jogo

- **WHEN** o jogador abre a página inicial e aciona o botão de começar
- **THEN** a página do jogo é carregada
- **AND** o jogo inicia na tela de carregamento

### Requirement: Nome estável da página do jogo

O nome do arquivo da página do jogo SHALL ser descritivo e independente de versão,
sem termos como "atualizado", "final", "corrigido" ou "funcionando".

#### Scenario: Nome da página

- **WHEN** o nome do arquivo da página do jogo é inspecionado
- **THEN** ele identifica o jogo sem indicar versão, estado de correção ou revisão

### Requirement: Projeto sem arquivos órfãos

O repositório SHALL conter apenas arquivos de código, estilo e marcação que sejam
carregados pela página inicial ou pela página do jogo, direta ou indiretamente.

#### Scenario: Auditoria de arquivos

- **WHEN** cada arquivo HTML, CSS e JavaScript do projeto é confrontado com as referências a partir das duas páginas publicadas
- **THEN** todo arquivo presente é alcançável a partir de uma delas

#### Scenario: Versões antigas não são publicadas

- **WHEN** o projeto é servido por um servidor estático
- **THEN** nenhuma versão anterior do jogo está acessível por URL

### Requirement: Aparência independente de serviços externos

O jogo SHALL apresentar a tipografia pretendida sem depender de requisição a domínio de
terceiros, e SHALL permanecer legível caso a fonte não possa ser carregada.

#### Scenario: Abertura sem acesso a serviços externos

- **WHEN** o jogo é aberto com todo o acesso a domínios de terceiros bloqueado
- **THEN** a tipografia pretendida é aplicada
- **AND** nenhuma requisição a domínio de terceiros é feita

#### Scenario: Fonte indisponível

- **WHEN** o arquivo de fonte do projeto não pode ser carregado
- **THEN** o jogo usa a pilha de fontes alternativa declarada
- **AND** todos os textos continuam legíveis e contidos em seus elementos

### Requirement: Documentação corresponde ao que existe

O README SHALL descrever a estrutura de arquivos e o modo de executar que correspondem ao
estado real do projeto.

#### Scenario: Conferência do README

- **WHEN** a estrutura descrita no README é comparada com os arquivos do projeto
- **THEN** todo arquivo citado existe
- **AND** nenhum arquivo publicado relevante deixa de ser citado
- **AND** as instruções de execução levam ao jogo funcionando
