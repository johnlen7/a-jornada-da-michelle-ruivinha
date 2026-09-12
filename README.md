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

## ✏️ Como editar o conteúdo

Todo o conteúdo editável fica em arquivos de dados separados do código, **no
mesmo formato nas duas temporadas**:

- **Temporada 1:** `src/data/gameData.js`
- **Temporada 2:** `src/data/season2Data.js` — perguntas, opções, respostas corretas, textos do final e dificuldade da fase de obstáculos, tudo comentado em português.

Depois de editar, é só salvar e recarregar a página. O motor (`src/game.js`)
não tem nada específico de nenhuma das duas temporadas — só lê o que está
declarado nesses arquivos — então dá para ter qualquer número de fases e de
perguntas.

### Como acrescentar uma fase nova

1. Em `levels`, copie um bloco existente e ajuste os campos:
   - `id`, `name`: identificador e nome exibido.
   - `kind`: `'question'` (pergunta), `'final'` (o grande momento) ou
     `'runner'` (fase de obstáculos — só faz sentido ter uma por temporada).
   - `questionId`: para `kind: 'question'`, o `id` da pergunta em `questions`.
   - `scene`: o nome de uma cena já desenhada em `src/scenes.js` e registrada
     em `SceneRenderer.SCENES` (veja a lista no fim desse arquivo). Cenários
     novos exigem escrever a função de desenho em código — isso não dá para
     fazer só editando os dados.
   - `interactX`/`interactY`: onde fica o ponto de interação dentro da fase.
   - `music`: a chave da trilha da cena (uma faixa em arquivo como
     `'hogwarts'`, ou qualquer outra chave — toca a melodia sintética
     correspondente, ou uma genérica se a chave não for reconhecida).
   - `bounds` (opcional): limite de onde a personagem pode andar dentro da
     fase; omita para usar o limite padrão.
2. Se for uma fase de pergunta, acrescente a pergunta correspondente em
   `questions` (mesmo `id` usado em `questionId` acima).
3. Acrescente um ponto correspondente em `mapLocations`, na **mesma posição**
   da lista — as duas listas (`levels` e `mapLocations`) precisam ter o
   mesmo tamanho e a mesma ordem, porque o mapa desbloqueia um ponto de cada
   vez, na ordem em que aparecem.
4. Salve e recarregue. Se algo não bater — um `questionId` sem pergunta
   correspondente, uma `scene` que não existe, as duas listas com tamanhos
   diferentes — o jogo avisa no console do navegador (F12), aponta a fase e o
   campo, e segue jogável no resto; corrija e recarregue de novo.

Remover uma fase é o mesmo processo ao contrário: apague o bloco de `levels`
e o ponto correspondente de `mapLocations` (mantendo os dois na mesma ordem).

## 🎮 Como jogar

1. Abra `index.html` no navegador.
2. Clique em **Começar a Jornada**.
3. Pressione qualquer tecla/toque e escolha a temporada.
4. No desktop, use **↑ ↓ ← →** ou **WASD** para mover e **ESPAÇO/ENTER** para interagir.
5. No celular/tablet, use o **D-pad** e o botão **AÇÃO**.
6. Na fase de obstáculos, desvie com as setas — ESC ou o botão 🚪 Sair (com confirmação) voltam ao mapa.
7. Para zerar o progresso das duas temporadas: `resetMichelleProgress()` no console.

## 📲 Instalar e jogar offline

O jogo é um PWA (Progressive Web App): no navegador aparece a opção de instalar
("Adicionar à tela inicial"), e a partir da segunda visita ele abre e é
jogável sem internet — um service worker (`sw.js`) guarda os arquivos do jogo.
As trilhas MP3 continuam sendo buscadas sob demanda (não entram nesse
pré-cache, de propósito); sem elas em cache e sem rede, a melodia sintética
assume, então nunca fica em silêncio. Compartilhar o link também mostra
título, descrição e uma prévia visual gerada a partir da própria arte do jogo.

## 🛠️ Tecnologias utilizadas

- HTML5 Canvas (pixel-art 100% desenhada em código)
- CSS3 responsivo
- JavaScript Vanilla
- Web Audio API (trilhas sintéticas + MP3 com fallback)
- `localStorage` para progresso por temporada
- Service worker + Web App Manifest (instalável, jogável offline)

## 📁 Estrutura principal

```txt
index.html                  # Página inicial/launcher
jogo.html                   # Entrada oficial do jogo
manifest.webmanifest        # Manifesto do PWA (instalação)
sw.js                       # Service worker (cache e modo offline)

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
  audio/                    # Trilhas MP3 (recomprimidas, carregadas sob demanda)
  fonts/                    # Pixelify Sans (OFL), hospedada no projeto — sem CDN
  icons/                    # Ícones do PWA e imagem de prévia de compartilhamento
```

> As dez versões anteriores do jogo (`game_*.html` e `jogo_*.html` legados) e o
> `css/styles.css` (código morto — os estilos vivem embutidos nas duas páginas) foram
> removidos do repositório por não terem mais uso; a entrada oficial e única é `jogo.html`.
> As artes originais em PNG (`assets/images/`) também foram removidas, por serem código
> morto desde que a arte passou a ser pixel-art desenhada em código. Tudo isso segue
> recuperável no histórico do git, a partir do commit `24f1ae9` (branch
> `claude/auditoria-upgrades-plano-ygde0c`).

## 🔍 Auditoria e histórico de upgrades

O projeto passou por uma auditoria técnica e um plano de evolução em sete frentes — todas
já implementadas, testadas e arquivadas:

- [`docs/AUDITORIA.md`](docs/AUDITORIA.md) — achados verificados com o jogo rodando
  (desempenho, bugs, acessibilidade e estrutura), com evidências. Registro histórico do
  estado do projeto antes desta rodada de upgrades.
- [`docs/PLANO-DE-UPGRADES.md`](docs/PLANO-DE-UPGRADES.md) — o plano priorizado em ondas,
  com as metas de cada frente e os números medidos depois de implementadas.

Cada frente foi especificada e arquivada com [OpenSpec](https://github.com/Fission-AI/OpenSpec).
As specs de comportamento resultantes — o contrato vigente do jogo — vivem em
`openspec/specs/` (carregamento de mídia, progressão de fases, fase de obstáculos,
diálogos acessíveis, entrega do jogo, instalação/compartilhamento, conteúdo das
temporadas); o histórico de cada change implementada está em
`openspec/changes/archive/`:

```bash
npx @fission-ai/openspec@1 list --specs                 # capacidades especificadas
npx @fission-ai/openspec@1 show <nome-da-capacidade> --type spec  # ler uma spec
npx @fission-ai/openspec@1 validate --all --strict       # conferir as specs
```

## 🚀 Como executar

### Opção simples

Abra `index.html` no navegador.

### Opção recomendada em servidor local

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## 🧪 Desenvolvimento

O jogo em si não precisa de nada disso — ele abre direto no navegador (veja "Como
executar" acima). Estas ferramentas existem só para quem for mexer no código:

```bash
npm install                 # instala lint e o executor de testes (uma vez só)
npm run lint                # ESLint sobre src/
npx playwright install --with-deps chromium   # baixa o navegador de teste (uma vez só)
npm test                    # sobe o jogo e roda o teste de fumaça (Playwright)
```

O teste de fumaça (`tests/smoke.spec.js`) é o contrato executável de
`docs/AUDITORIA.md`: verifica que o jogo carrega sem erro, que o primeiro
carregamento fica abaixo de 1 MB, que não há requisição a domínio de terceiros,
que as duas temporadas chegam ao mapa, que a fase de obstáculos tem saída, que
conteúdo mal configurado não trava o jogo e que os diálogos são navegáveis por
teclado. Roda automaticamente em CI (`.github/workflows/ci.yml`) a cada push e
pull request.

**Sobre o service worker durante o desenvolvimento:** depois de abrir o jogo
uma vez, o navegador passa a servir os arquivos do cache do service worker
(veja "Instalar e jogar offline" acima). Para garantir que você está vendo a
versão mais recente ao editar `jogo.html`/`index.html`, use a aba de rede das
ferramentas de desenvolvedor com "Disable cache" ativado, ou desregistre o
service worker em `chrome://serviceworker-internals` (ou o equivalente do seu
navegador) e recarregue.

## 🎨 Créditos

Desenvolvido com ❤️ para contar a história da Michelle Ruivinha — da jornada mágica ao caminho do altar.

Fonte pixelada [Pixelify Sans](https://github.com/eifetx/Pixelify-Sans), licenciada em
SIL Open Font License 1.1 (veja `assets/fonts/OFL.txt`).

---

*"A magia está em toda parte, você só precisa saber onde procurar!"* ✨
