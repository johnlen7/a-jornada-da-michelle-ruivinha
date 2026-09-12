// Lint para o estilo já praticado no jogo: scripts globais de navegador
// (window.X), sem módulos e sem bundler. As únicas regras como erro são as
// que a auditoria (docs/AUDITORIA.md) encontrou de verdade — variável e
// parâmetro não utilizados. O resto entra como aviso, para o lint não virar
// obstáculo num código que já funciona.
'use strict';

module.exports = [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        Audio: 'readonly',
        AudioContext: 'readonly',
        webkitAudioContext: 'readonly',
        module: 'writable',
        // Globais que os próprios scripts do jogo publicam em window.
        GameManager: 'writable',
        AudioManager: 'writable',
        SceneRenderer: 'writable',
        LoadingScreen: 'writable',
        PixelSprites: 'writable',
        GameData: 'writable',
        Season2Data: 'writable'
      }
    },
    rules: {
      // Os dois padrões que a auditoria encontrou de verdade.
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Avisos: úteis, mas não travam uma primeira execução do lint.
      'no-undef': 'warn',
      eqeqeq: 'warn',
      'no-console': 'off'
    }
  }
];
