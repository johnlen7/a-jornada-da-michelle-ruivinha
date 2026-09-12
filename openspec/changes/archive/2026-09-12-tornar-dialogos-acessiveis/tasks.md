## 1. Registrar o estado atual

- [x] 1.1 Registrar, com o jogo rodando, que o foco permanece no `body` ao abrir o diálogo e que `ESC` não o fecha
- [x] 1.2 Listar todos os diálogos do jogo (pergunta, momento final, epílogo, vitória e derrota da corrida) e classificar cada um como dispensável ou exigindo escolha

## 2. Gestão de foco

- [x] 2.1 Guardar o elemento focado antes de abrir o diálogo e mover o foco para o primeiro controle, verificando o `activeElement` após a abertura
- [x] 2.2 Implementar a contenção de foco com `Tab` e `Shift+Tab` e verificar que o ciclo não escapa para o botão de som nem para os controles de toque
- [x] 2.3 Devolver o foco ao elemento anterior ao fechar o diálogo, verificando o `activeElement` após o fechamento

## 3. Teclado

- [x] 3.1 Fechar com `ESC` os diálogos classificados como dispensáveis, verificando que a pergunta continua pendente e reabrível
- [x] 3.2 Manter abertos com `ESC` os diálogos que exigem escolha, verificando o diálogo de derrota da corrida
- [x] 3.3 Verificar que `ESC` na fase de obstáculos continua saindo da fase e não conflita com o fechamento de diálogos

## 4. Leitores de tela

- [x] 4.1 Remover o `aria-live` do contêiner geral da interface e aplicá-lo apenas às regiões de conteúdo relevante, verificando que mover a personagem pelo mapa não gera anúncios
- [x] 4.2 Ligar título e texto do diálogo ao rótulo e à descrição acessível da janela modal, verificando que a pergunta é anunciada ao abrir
- [x] 4.3 Anunciar o resultado da resposta uma única vez, verificando que repetir a mesma resposta errada não empilha anúncios
- [x] 4.4 Anunciar o nome da fase ao entrar nela, verificando que o anúncio acontece uma vez por entrada

## 5. Foco visível e movimento reduzido

- [x] 5.1 Garantir indicação visual de foco em todos os controles das duas páginas, percorrendo cada tela inteira com `Tab`
- [x] 5.2 Adicionar o bloco de movimento reduzido suprimindo pulsação, brilhos e partículas decorativas, verificando com a preferência simulada no navegador
- [x] 5.3 Verificar que com movimento reduzido ativo a fase de obstáculos continua jogável e o conteúdo todo permanece visível

## 6. Verificação final

- [x] 6.1 Concluir uma temporada inteira usando apenas o teclado, do início ao epílogo
- [x] 6.2 Percorrer as duas páginas com um leitor de tela e confirmar que os anúncios correspondem ao que está acontecendo
- [x] 6.3 Confirmar que mouse e toque continuam funcionando exatamente como antes
