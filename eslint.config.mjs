import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'generated/',
      'public/',
      '*.config.*',
      '.superpowers/',
      '.playwright-mcp/',
      '.worktrees/',
      '.tmp/',
    ],
  },
];

export default eslintConfig;
