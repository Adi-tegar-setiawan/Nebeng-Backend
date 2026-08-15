// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'generated/**',
      'node_modules/**',
    ],
  },

  // ESLint recommended
  eslint.configs.recommended,

  // TypeScript recommended tanpa type-checking
  ...tseslint.configs.recommended,

  // Prettier
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      sourceType: 'commonjs',
    },
  },

  {
    rules: {
      // =========================
      // TypeScript
      // =========================

      // Boleh menggunakan any jika memang diperlukan.
      '@typescript-eslint/no-explicit-any': 'off',

      // Unused variable hanya warning.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // =========================
      // Prettier
      // =========================

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
);