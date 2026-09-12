## 1. Reproduzir os defeitos

- [ ] 1.1 Reproduzir a prisão na fase de obstáculos em viewport de celular e registrar que nenhum controle na tela sai da fase
- [ ] 1.2 Reproduzir a fase travada apontando uma fase para um `questionId` inexistente e registrar que a dica de interação fica visível para sempre

## 2. Saída da fase de obstáculos

- [ ] 2.1 Adicionar à interface um controle de saída visível durante a fase de obstáculos e verificar que ele aparece em viewport de celular, retrato e paisagem
- [ ] 2.2 Ligar esse controle à saída da fase e verificar por toque que o jogo volta ao mapa sem recarregar a página
- [ ] 2.3 Verificar que desistir deixa a fase pendente e o ponto seguinte do mapa bloqueado, reabrindo o jogo para confirmar
- [ ] 2.4 Verificar que a tecla `ESC` continua saindo da fase no computador

## 3. Fase com conteúdo mal configurado

- [ ] 3.1 Centralizar a resolução de fase para pergunta num único ponto que devolve ausência explícita, e verificar que nenhum chamador usa mais índice `-1`
- [ ] 3.2 Registrar aviso no console nomeando a fase e o identificador não encontrado, e verificar a mensagem com um `questionId` inválido
- [ ] 3.3 Suprimir a dica de interação e o diálogo nessa situação, verificando que aproximar-se do ponto não mostra nada e que acionar a interação não abre diálogo
- [ ] 3.4 Verificar que sair pela porta e navegar pelas outras fases continua funcionando com a fase quebrada presente

## 4. Áudio em segundo plano

- [ ] 4.1 Pausar trilha e agenda de notas sintéticas quando a aba fica oculta, verificando que nenhuma nota nova é agendada com a aba em segundo plano
- [ ] 4.2 Retomar a trilha da cena atual ao voltar para a aba, verificando também que nada volta a tocar com o som desligado

## 5. Limpeza dos ruídos vizinhos

- [ ] 5.1 Remover o parâmetro ignorado de `startRunner()` e ajustar os chamadores, verificando que a fase de obstáculos continua iniciando pelos dois caminhos (mapa e tentar de novo)
- [ ] 5.2 Remover o índice não utilizado em `markNextLocation()` e verificar que o destaque do próximo ponto do mapa continua correto

## 6. Verificação final

- [ ] 6.1 Percorrer a Temporada 2 inteira em viewport de celular, entrando e desistindo da fase de obstáculos ao menos uma vez antes de vencê-la
- [ ] 6.2 Verificar que o progresso salvo das duas temporadas continua sendo lido corretamente após as mudanças
- [ ] 6.3 Confirmar console sem erros e 60 fps mantidos ao fim da passagem completa
