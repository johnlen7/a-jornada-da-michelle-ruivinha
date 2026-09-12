// Teste de fumaça: o contrato executável da auditoria (docs/AUDITORIA.md).
// Cada bloco corresponde a um achado real, medido com o jogo rodando de
// verdade — não é teste unitário de função isolada.
const { test, expect } = require('@playwright/test');

// Orçamento do primeiro carregamento (docs/PLANO-DE-UPGRADES.md e a spec
// carregamento-de-midia). Ajuste conscientemente se o jogo crescer de propósito.
const FIRST_LOAD_BYTE_BUDGET = 1024 * 1024; // 1 MB

// Clica em "Iniciar" e escolhe uma temporada, esperando a troca de tela
// terminar antes de cada clique — sem isso, o clique seguinte pode chegar
// antes do elemento ficar visível (mudança de `display` via JS).
async function startAndPickSeason(page, season) {
  await page.click('#startGameBtn', { force: true });
  await expect(page.locator('#seasonSelect')).toBeVisible();
  await page.click(season === 's1' ? '#season1Btn' : '#season2Btn', { force: true });
}

test.describe('Carregamento e orçamento de bytes', () => {
  test('a página do jogo carrega sem erro de console', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);

    expect(errors).toEqual([]);
  });

  test('menos de 1 MB é transferido até a escolha de temporada', async ({ page }) => {
    let totalBytes = 0;
    page.on('response', async (response) => {
      if (response.url().startsWith('data:')) return;
      try {
        totalBytes += (await response.body()).length;
      } catch {
        // resposta sem corpo (redirect, 304 etc.) — não conta bytes.
      }
    });

    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await page.click('#startGameBtn', { force: true });
    await expect(page.locator('#seasonSelect')).toBeVisible();

    expect(totalBytes).toBeLessThan(FIRST_LOAD_BYTE_BUDGET);
  });

  test('nenhuma requisição a domínio de terceiros é feita na abertura', async ({ page }) => {
    const thirdParty = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') thirdParty.push(req.url());
    });

    await page.goto('/index.html');
    await page.waitForTimeout(300);
    await page.click('.play-button');
    await page.waitForFunction(() => window.game && !window.game.isLoading);

    expect(thirdParty).toEqual([]);
  });

  test('a tipografia do jogo carrega mesmo sem qualquer acesso externo', async ({ page }) => {
    await page.route('**://fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**://fonts.gstatic.com/**', (route) => route.abort());

    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return Array.from(document.fonts).some((f) => f.family.includes('Pixelify') && f.status === 'loaded');
    });

    expect(loaded).toBe(true);
  });
});

test.describe('Fluxo até o mapa', () => {
  for (const season of ['s1', 's2']) {
    test(`temporada ${season} chega ao mapa`, async ({ page }) => {
      await page.goto('/jogo.html');
      await page.waitForFunction(() => window.game && !window.game.isLoading);
      await startAndPickSeason(page, season);

      await expect.poll(() => page.evaluate(() => window.game.gameState.screen)).toBe('map');
    });
  }
});

test.describe('Fase de obstáculos', () => {
  test('tem uma saída utilizável por toque, sem perder o progresso', async ({ page }) => {
    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await startAndPickSeason(page, 's2');
    await page.evaluate(() => window.game.enterLevel(2)); // Caminho do Altar

    await expect.poll(() => page.evaluate(() => window.game.gameState.screen)).toBe('runner');
    await expect(page.locator('#runnerExitBtn')).toBeVisible();

    await page.click('#runnerExitBtn', { force: true });
    await expect(page.locator('#questionDialog')).toBeVisible();
    const buttons = page.locator('#questionOptions .option-btn');
    await buttons.first().click(); // "Sim, sair"

    await expect.poll(() => page.evaluate(() => window.game.gameState.screen)).toBe('map');
    const stillLocked = await page.evaluate(() => !window.game.season.mapLocations[3].unlocked);
    expect(stillLocked).toBe(true);
  });
});

test.describe('Conteúdo mal configurado não trava o jogo', () => {
  test('fase com questionId inexistente fica sem interação, sem quebrar a navegação', async ({ page }) => {
    const warnings = [];
    page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });

    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await startAndPickSeason(page, 's1');
    await page.evaluate(() => {
      window.game.season.levels[0].questionId = 'id-que-nao-existe';
      window.game.enterLevel(0);
      const lvl = window.game.season.levels[0];
      window.game.gameState.playerX = lvl.interactX;
      window.game.gameState.playerY = lvl.interactY;
    });
    await page.waitForTimeout(200);

    await expect(page.locator('#interactionHint')).toBeHidden();
    expect(warnings.some((w) => w.includes('id-que-nao-existe'))).toBe(true);

    const backToMap = await page.evaluate(() => {
      window.game.exitLevel();
      return window.game.gameState.screen === 'map';
    });
    expect(backToMap).toBe(true);
  });
});

test.describe('Conteúdo orientado a dados', () => {
  test('o motor não assume um número fixo de fases por temporada', async ({ page }) => {
    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await page.evaluate(() => {
      window.GameData.levels.push({
        id: 'fase-extra-de-teste',
        name: 'Fase Extra de Teste',
        kind: 'question',
        questionId: 'pergunta-extra-de-teste',
        scene: 'hogwarts-room',
        interactX: 400,
        interactY: 400,
        music: 'hogwarts',
        bounds: { minX: 24, maxX: 776, minY: 300, maxY: 580 }
      });
      window.GameData.questions.push({
        id: 'pergunta-extra-de-teste', title: 'Teste', text: 'Isto é um teste?', options: ['Sim', 'Não'], correct: 0
      });
      window.GameData.mapLocations.push({
        id: 'fase-extra-de-teste', name: 'Fase Extra', x: 700, y: 450, unlocked: true, color: '#fff', houseColor: '#ccc'
      });
    });
    await page.evaluate(() => { window.game.selectSeason('s1'); });

    const fifthPhasePlayable = await page.evaluate(() => {
      const g = window.game;
      g.enterLevel(4);
      const lvl = g.season.levels[4];
      g.gameState.playerX = lvl.interactX;
      g.gameState.playerY = lvl.interactY;
      g.handleInteraction();
      return document.getElementById('questionDialog').style.display === 'block';
    });
    expect(fifthPhasePlayable).toBe(true);
  });

  test('progresso salvo de uma versão de conteúdo incompatível é descartado com aviso', async ({ page }) => {
    const warnings = [];
    page.on('console', (m) => { if (m.type() === 'warning') warnings.push(m.text()); });

    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await page.evaluate(() => {
      window.localStorage.setItem('michelleGameProgress.v1', JSON.stringify({
        version: 'versao-de-teste-incompativel',
        questionsAnswered: [true, true, true],
        unlockedLocations: [true, true, true, true],
        runnerDone: false,
        finalAccepted: false
      }));
      window.game.selectSeason('s1');
    });

    const discarded = await page.evaluate(() => window.game.gameState.questionsAnswered.every((v) => v === false));
    expect(discarded).toBe(true);
    expect(warnings.some((w) => w.includes('versao-de-teste-incompativel'))).toBe(true);
  });
});

test.describe('Instalação e offline', () => {
  test('o manifesto é servido e aponta para os ícones certos', async ({ page }) => {
    await page.goto('/index.html');
    const href = await page.getAttribute('link[rel="manifest"]', 'href');
    const response = await page.goto(`/${href}`);
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('o service worker não pré-carrega as trilhas MP3 na instalação', async ({ page }) => {
    const mp3Requests = [];
    page.on('request', (req) => { if (req.url().endsWith('.mp3')) mp3Requests.push(req.url()); });

    await page.goto('/index.html');
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!(reg && reg.active);
    });
    await page.waitForTimeout(300);

    expect(mp3Requests).toEqual([]);
  });

  test('o jogo carrega e chega ao mapa sem conexão, na segunda visita', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!(reg && reg.active);
    });

    await page.context().setOffline(true);
    await page.goto('/jogo.html', { waitUntil: 'load' });
    await page.waitForFunction(() => window.game && !window.game.isLoading);

    await page.evaluate(() => {
      window.game.toSeasonSelect();
      window.game.selectSeason('s1');
    });
    await expect.poll(() => page.evaluate(() => window.game.gameState.screen)).toBe('map');

    await page.context().setOffline(false);
  });
});

test.describe('Diálogos acessíveis', () => {
  test('o foco entra no diálogo e Tab não escapa dele', async ({ page }) => {
    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await startAndPickSeason(page, 's1');
    await page.evaluate(() => {
      window.game.enterLevel(0);
      const lvl = window.game.season.levels[0];
      window.game.gameState.playerX = lvl.interactX;
      window.game.gameState.playerY = lvl.interactY;
      window.game.handleInteraction();
    });
    await expect(page.locator('#questionDialog')).toBeVisible();

    const focusInside = await page.evaluate(() =>
      document.getElementById('questionDialog').contains(document.activeElement)
    );
    expect(focusInside).toBe(true);

    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    const stillInside = await page.evaluate(() =>
      document.getElementById('questionDialog').contains(document.activeElement)
    );
    expect(stillInside).toBe(true);
  });

  test('ESC fecha um diálogo dispensável sem responder a pergunta', async ({ page }) => {
    await page.goto('/jogo.html');
    await page.waitForFunction(() => window.game && !window.game.isLoading);
    await startAndPickSeason(page, 's1');
    await page.evaluate(() => {
      window.game.enterLevel(0);
      const lvl = window.game.season.levels[0];
      window.game.gameState.playerX = lvl.interactX;
      window.game.gameState.playerY = lvl.interactY;
      window.game.handleInteraction();
    });
    await expect(page.locator('#questionDialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#questionDialog')).toBeHidden();
    const stillPending = await page.evaluate(() => !window.game.gameState.questionsAnswered[0]);
    expect(stillPending).toBe(true);
  });
});
