# A Jornada da Michelle Ruivinha 🧙‍♀️

Um jogo interativo em HTML5 Canvas, CSS3 e JavaScript Vanilla que conta a história da Michelle em uma aventura mágica por Hogwarts, Central Perk, o caminho para o Forte e o Forte de Copacabana.

## 📖 Sobre o projeto

Este é um jogo de aventura 2D com foco narrativo/afetivo. O jogador controla Michelle, explora o mapa, entra em cenários temáticos, responde perguntas e desbloqueia a próxima etapa da jornada.

Cenários principais:

- Quarto Hogwarts
- Central Perk
- Caminho para o Forte
- Forte de Copacabana

## 🎮 Como jogar

1. Abra `index.html` no navegador.
2. Clique em **Começar a Jornada**.
3. No jogo, pressione **Iniciar Jornada** ou qualquer tecla para sair da tela inicial.
4. No desktop, use **↑ ↓ ← →** ou **WASD** para mover e **ESPAÇO/ENTER** para interagir.
5. No celular/tablet, use o **D-pad** e o botão **AÇÃO**.
6. Interaja com locais/personagens para responder perguntas e desbloquear novas áreas.

## ✅ Melhorias implementadas

Esta versão estabiliza a base do projeto:

- Entrada oficial única em `game_atualizado.html`, responsiva para desktop e mobile.
- Páginas mobile antigas redirecionam para a versão unificada.
- Remoção da senha hardcoded do `index.html`.
- Manifesto central de dados em `src/data/gameData.js`.
- Fluxo único de inicialização via `src/main.js`.
- Camada de estabilização em `src/stabilize.js` para:
  - iniciar o jogo por teclado, botão ou toque;
  - aplicar dados centralizados;
  - salvar/carregar progresso no `localStorage`;
  - debouncer de interação;
  - mapa com renderização única, sem overrides inline nos HTMLs.
- Loading orientado pelo manifesto de assets, com fallback quando imagem/áudio não carrega.
- `AudioManager` simplificado, com preferência de som persistida e fallback sintético.

## 🛠️ Tecnologias utilizadas

- HTML5 Canvas
- CSS3 responsivo
- JavaScript Vanilla
- Web Audio API
- Sprites, imagens e áudio personalizados
- `localStorage` para progresso local

## 📁 Estrutura principal

```txt
index.html                         # Página inicial/launcher

game_atualizado.html                # Entrada oficial do jogo

game_mobile_otimizado.html          # Redirect legado para a versão oficial

game_mobile_final_funcionando.html  # Redirect legado para a versão oficial

src/
  audio.js                          # Sistema de áudio
  game.js                           # Classe principal do jogo
  loading.js                        # Tela de carregamento
  main.js                           # Inicialização única
  scenes.js                         # Renderização de cenários
  stabilize.js                      # Correções estruturais e fluxo unificado
  data/
    gameData.js                     # Manifesto de assets, mapa, fases e perguntas

assets/
  images/                           # Sprites e cenários
  audio/                            # Trilhas e efeitos
```

## 🚀 Como executar

### Opção simples

Abra `index.html` no navegador.

### Opção recomendada em servidor local

Alguns navegadores restringem áudio e carregamento de arquivos quando o jogo é aberto via `file://`. Para testar com comportamento mais próximo da publicação:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## 🧭 Próximos passos sugeridos

- Migrar para módulos ES ou Vite para facilitar imports e build.
- Separar `GameManager`, input, renderização, dados e UI em classes menores.
- Adicionar colisões por cenário.
- Criar sprite sheet com animações por direção.
- Adicionar testes para progressão, desbloqueio de fases e input.
- Adicionar um botão visual para reiniciar progresso chamando `resetMichelleProgress()`.

## 🎨 Créditos

Desenvolvido com ❤️ para contar a história da Michelle Ruivinha em sua jornada mágica.

---

*"A magia está em toda parte, você só precisa saber onde procurar!"* ✨
