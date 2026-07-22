import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // Standar dasar ESLint
  eslint.configs.recommended,
  // Standar dasar TypeScript
  ...tseslint.configs.recommended,
  // Integrasi Prettier untuk mematikan aturan formatting yang bentrok
  eslintPluginPrettierRecommended,
  {
    ignores: ['src/generated/**'],
  },
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'require-await': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
    },
  },
);