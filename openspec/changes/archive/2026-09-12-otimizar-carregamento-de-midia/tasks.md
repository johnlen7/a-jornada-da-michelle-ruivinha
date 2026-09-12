## 1. Medir o ponto de partida

- [x] 1.1 Registrar o total de bytes de rede do primeiro carregamento com cache vazio (Chromium headless + servidor estático local) e confirmar o valor de referência de ~28 MB
- [x] 1.2 Listar cada arquivo sob `assets/` e o consumidor em tempo de execução de cada um; confirmar por busca no código que `assets/images/` não tem nenhum

## 2. Unificar as instâncias de áudio

- [x] 2.1 Tornar o `AudioManager` o dono único dos objetos `Audio`, com consulta por chave de faixa, e verificar que cada arquivo tem exatamente uma instância viva
- [x] 2.2 Fazer `LoadingScreen` consultar o `AudioManager` em vez de criar seus próprios elementos `Audio`, e verificar no painel de rede que cada MP3 é requisitado no máximo uma vez
- [x] 2.3 Trocar `preload="auto"` por `preload="none"` em todas as faixas e verificar que abrir a página não dispara nenhuma requisição de MP3

## 3. Carregar a trilha sob demanda

- [x] 3.1 Disparar a busca do arquivo da trilha dentro de `playBackgroundMusic(key)`, no momento da entrada na cena, e verificar que a requisição só aparece ao entrar na fase
- [x] 3.2 Tocar a melodia sintética da cena imediatamente e trocar pela trilha em arquivo quando ela ficar pronta; verificar em rede lenta simulada que não há silêncio na transição
- [x] 3.3 Garantir que nenhuma faixa é buscada com o som desligado, verificando o painel de rede com o botão de som em MUDO
- [x] 3.4 Percorrer a Temporada 2 inteira e verificar que nenhum MP3 da Temporada 1 é transferido

## 4. Ajustar a tela de carregamento

- [x] 4.1 Recalcular o progresso a partir da preparação do jogo em vez do download das faixas, verificando que a barra chega a 100% sem depender da rede
- [x] 4.2 Garantir conclusão em no máximo 3 segundos mesmo com as faixas indisponíveis, verificando com as requisições de áudio bloqueadas
- [x] 4.3 Confirmar que a tela de carregamento não depende de mídia para concluir (o fallback sonoro passou a ser garantia do próprio `AudioManager`, verificada na tarefa 3.2), ajustando a spec do requisito correspondente para refletir essa divisão de responsabilidade

## 5. Enxugar as mídias

- [x] 5.1 Recomprimir `hogwarts.mp3` (mono, 56 kbps, 12,1 MB → 2,1 MB) e `centralperk.mp3` (mono, 96 kbps, 1,8 MB → 540 KB) sem cortar a duração de nenhuma das duas, verificando a integridade da faixa pelo `ffprobe` antes de substituir os arquivos originais
- [x] 5.2 Remover `assets/images/` e o bloco `assets.images` de `src/data/gameData.js`, verificando que o jogo carrega sem nenhum erro de recurso não encontrado no console
- [x] 5.3 Anotar no README que as artes originais seguem recuperáveis no histórico do git, citando o commit de remoção

## 6. Verificação final

- [x] 6.1 Medir de novo os bytes do primeiro carregamento com cache vazio e verificar que o total ficou abaixo de 1 MB
- [x] 6.2 Percorrer as duas temporadas do início ao fim (incluindo a fase de obstáculos) verificando trilha em todas as cenas, 60 fps e console sem erros
- [x] 6.3 Verificar o tamanho do repositório após a limpeza e registrar o número final no relatório de auditoria
