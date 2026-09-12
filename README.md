# A Jornada da Michelle Ruivinha 🧙‍♀️💒

Um jogo interativo em HTML5 Canvas, CSS3 e JavaScript Vanilla que conta a história da Michelle em **duas temporadas**: a jornada mágica do pedido de casamento e o caminho (cheio de obstáculos) até o altar.

## 📖 Sobre o projeto

Jogo de aventura 2D em pixel-art com foco narrativo/afetivo. Toda a arte é desenhada em código (sem imagens pesadas), com cenários animados, personagens com animação de caminhada e trilhas sonoras por cenário.

### 💕 Temporada 1 — A Jornada

- Quarto Hogwarts
- Central Perk
- Caminho para o Forte
- Forte de Copacabana (o pedido 💍)

### 💒 Temporada 2 — O Caminho do Casamento

- Salão de Festas (escolha do local)
- Ateliê da Noiva (o vestido)
- **Caminho do Altar** — fase de obstáculos: desvie de caixas, bolos, pombos e buquês, colete corações e alianças até chegar ao altar
- Altar do Jardim (o grande momento)

## ✏️ Como editar as perguntas

Todo o conteúdo editável fica em arquivos de dados separados do código:

- **Temporada 1:** `src/data/gameData.js`
- **Temporada 2:** `src/data/season2Data.js` — perguntas, opções, respostas corretas, textos do final e dificuldade da fase de obstáculos, tudo comentado em português.

Depois de editar, é só salvar e recarregar a página.

## 🎮 Como jogar

1. Abra `index.html` no navegador.
2. Clique em **Começar a Jornada**.
3. Pressione qualquer tecla/toque e escolha a temporada.
4. No desktop, use **↑ ↓ ← →** ou **WASD** para mover e **ESPAÇO/ENTER** para interagir.
5. No celular/tablet, use o **D-pad** e o botão **AÇÃO**.
6. Na fase de obstáculos, desvie com as setas (ESC volta ao mapa).
7. Para zerar o progresso das duas temporadas: `resetMichelleProgress()` no console.

## 🛠️ Tecnologias utilizadas

- HTML5 Canvas (pixel-art 100% desenhada em código)
- CSS3 responsivo
- JavaScript Vanilla
- Web Audio API (trilhas sintéticas + MP3 com fallback)
- `localStorage` para progresso por temporada

## 📁 Estrutura principal

```txt
index.html                  # Página inicial/launcher
game_atualizado.html        # Entrada oficial do jogo

src/
  sprites.js                # Pixel-art: personagens, objetos e obstáculos
  scenes.js                 # Renderização dos cenários (T1, T2 e runner)
  game.js                   # Motor principal (temporadas, fases, runner)
  audio.js                  # Sistema de áudio e trilhas por cena
  loading.js                # Tela de carregamento
  main.js                   # Inicialização única
  data/
    gameData.js             # ✏️ Conteúdo da Temporada 1 (editável)
    season2Data.js          # ✏️ Conteúdo da Temporada 2 (editável)

assets/
  audio/                    # Trilhas MP3
  images/                   # Artes originais (legado)
```

> Os arquivos `game_*.html` e `jogo_*.html` antigos são versões legadas mantidas apenas para histórico; a entrada oficial é `game_atualizado.html`.

## 🔍 Auditoria e próximos passos

O projeto passou por uma auditoria técnica e tem um plano de evolução registrado:

- [`docs/AUDITORIA.md`](docs/AUDITORIA.md) — achados verificados com o jogo rodando
  (desempenho, bugs, acessibilidade e estrutura), com evidências.
- [`docs/PLANO-DE-UPGRADES.md`](docs/PLANO-DE-UPGRADES.md) — o plano priorizado em ondas,
  com as dependências entre as frentes e as metas de cada uma.

As frentes de trabalho estão especificadas com [OpenSpec](https://github.com/Fission-AI/OpenSpec)
em `openspec/changes/`, cada uma com proposta, specs de comportamento, decisões de desenho e
lista de tarefas:

```bash
npx @fission-ai/openspec@1 list                    # frentes em aberto
npx @fission-ai/openspec@1 show <nome-da-change>   # ler uma proposta
npx @fission-ai/openspec@1 validate --all --strict # conferir as specs
```

## 🚀 Como executar

### Opção simples

Abra `index.html` no navegador.

### Opção recomendada em servidor local

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## 🎨 Créditos

Desenvolvido com ❤️ para contar a história da Michelle Ruivinha — da jornada mágica ao caminho do altar.

---

*"A magia está em toda parte, você só precisa saber onde procurar!"* ✨
