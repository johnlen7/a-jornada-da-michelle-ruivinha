## 1. Medir o ponto de partida

- [ ] 1.1 Registrar o total de bytes de rede do primeiro carregamento com cache vazio (Chromium headless + servidor estático local) e confirmar o valor de referência de ~28 MB
- [ ] 1.2 Listar cada arquivo sob `assets/` e o consumidor em tempo de execução de cada um; confirmar por busca no código que `assets/images/` não tem nenhum

## 2. Unificar as instâncias de áudio

- [ ] 2.1 Tornar o `AudioManager` o dono único dos objetos `Audio`, com consulta por chave de faixa, e verificar que cada arquivo tem exatamente uma instância viva
- [ ] 2.2 Fazer `LoadingScreen` consultar o `AudioManager` em vez de criar seus próprios elementos `Audio`, e verificar no painel de rede que cada MP3 é requisitado no máximo uma vez
- [ ] 2.3 Trocar `preload="auto"` por `preload="none"` em todas as faixas e verificar que abrir a página não dispara nenhuma requisição de MP3

## 3. Carregar a trilha sob demanda

- [ ] 3.1 Disparar a busca do arquivo da trilha dentro de `playBackgroundMusic(key)`, no momento da entrada na cena, e verificar que a requisição só aparece ao entrar na fase
- [ ] 3.2 Tocar a melodia sintética da cena imediatamente e trocar pela trilha em arquivo quando ela ficar pronta; verificar em rede lenta simulada que não há silêncio na transição
- [ ] 3.3 Garantir que nenhuma faixa é buscada com o som desligado, verificando o painel de rede com o botão de som em MUDO
- [ ] 3.4 Percorrer a Temporada 2 inteira e verificar que nenhum MP3 da Temporada 1 é transferido

## 4. Ajustar a tela de carregamento

- [ ] 4.1 Recalcular o progresso a partir da preparação do jogo em vez do download das faixas, verificando que a barra chega a 100% sem depender da rede
- [ ] 4.2 Garantir conclusão em no máximo 3 segundos mesmo com as faixas indisponíveis, verificando com as requisições de áudio bloqueadas
- [ ] 4.3 Manter a mensagem de trilha alternativa quando alguma faixa falhar, verificando o texto exibido com a rede de áudio bloqueada

## 5. Enxugar as mídias

- [ ] 5.1 Recomprimir `hogwarts.mp3` e `centralperk.mp3` para mono ~96 kbps, verificando que cada arquivo final fica abaixo de 700 KB e ouvindo os dois loops antes de commitar
- [ ] 5.2 Remover `assets/images/` e o bloco `assets.images` de `src/data/gameData.js`, verificando que o jogo carrega sem nenhum erro de recurso não encontrado no console
- [ ] 5.3 Anotar no README que as artes originais seguem recuperáveis no histórico do git, citando o commit de remoção

## 6. Verificação final

- [ ] 6.1 Medir de novo os bytes do primeiro carregamento com cache vazio e verificar que o total ficou abaixo de 1 MB
- [ ] 6.2 Percorrer as duas temporadas do início ao fim (incluindo a fase de obstáculos) verificando trilha em todas as cenas, 60 fps e console sem erros
- [ ] 6.3 Verificar o tamanho do repositório após a limpeza e registrar o número final no relatório de auditoria
