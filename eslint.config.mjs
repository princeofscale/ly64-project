import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

const OFF = 'off';
const WARN = 'warn';
const ERROR = 'error';

const JS_GLOBS = ['**/*.{js,cjs,mjs,jsx}'];
const TS_GLOBS = ['**/*.{ts,tsx,mts,cts}'];

export default tseslint.config(
  // --------------------
  // 0) Ignores
  // --------------------
  {
    ignores: [
      '**/eslint.config.*',
      '**/.eslintrc.*',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/.cache/**',
      '**/*.min.*',
      '**/*.snap',
      '**/generated/**',
    ],
  },

  // --------------------
  // 1) Base JS recommended (для JS файлов)
  // --------------------
  js.configs.recommended,

  // --------------------
  // 2) TS recommended БЕЗ type-aware (без project) — безопасно для всего
  // --------------------
  ...tseslint.configs.recommended,

  // --------------------
  // 3) Общие настройки для всего
  // --------------------
  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx,mts,cts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // --------------------
  // 4) Import / unused-imports (для всего)
  // --------------------
  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx,mts,cts}'],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            './backend/tsconfig.eslint.json',
            './frontend/tsconfig.eslint.json',
            './shared/tsconfig.eslint.json',
          ],
        },
      },
    },
    rules: {
      'unused-imports/no-unused-imports': ERROR,
      'unused-imports/no-unused-vars': [
        WARN,
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'import/order': [
        WARN,
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/newline-after-import': WARN,
      'import/no-duplicates': WARN,

      'import/no-unresolved': OFF,
      'import/named': OFF,
      'import/namespace': OFF,
      'import/default': OFF,
    },
  },

  // --------------------
  // 5) BACKEND (Node) — JS/TS
  // --------------------
  {
    files: ['backend/**/*.{js,cjs,mjs,ts,mts,cts}', 'scripts/**/*.{js,cjs,mjs,ts,mts,cts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': OFF,
    },
  },

  // --------------------
  // 6) FRONTEND (React) — JS/TS/TSX/JSX
  // --------------------
  {
    files: ['frontend/**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': OFF,
    },
  },

  // --------------------
  // 7) SHARED — универсально
  // --------------------
  {
    files: ['shared/**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // --------------------
  // 8) TYPED LINT — ТОЛЬКО ДЛЯ TS/TSX, с project
  // --------------------
  {
    files: TS_GLOBS,
    languageOptions: {
      parserOptions: {
        // multi-project: нормально для монорепы
        project: [
          './backend/tsconfig.eslint.json',
          './frontend/tsconfig.eslint.json',
          './shared/tsconfig.eslint.json',
        ],
        tsconfigRootDir: import.meta.dirname,
        // чтобы убрать предупреждение про multiple projects:
        // (это именно warning typescript-eslint)
        noWarnOnMultipleProjects: true,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': ERROR,
      '@typescript-eslint/await-thenable': ERROR,
      '@typescript-eslint/no-misused-promises': ERROR,
      '@typescript-eslint/unbound-method': WARN,

      '@typescript-eslint/no-explicit-any': WARN,
      '@typescript-eslint/consistent-type-imports': [
        WARN,
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // конфликтует с unused-imports/no-unused-vars
      '@typescript-eslint/no-unused-vars': OFF,
      'no-unused-vars': OFF,
    },
  },

  // --------------------
  // 9) Prettier-last
  // --------------------
  prettier
);
