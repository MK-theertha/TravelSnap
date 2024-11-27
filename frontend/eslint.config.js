import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import'; // Add the import plugin

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: '18.3' },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Import-related rules
      'import/no-unresolved': 'error', // Prevent imports from unresolved modules
      'import/named': 'error', // Ensure named imports correspond to a named export
      'import/default': 'error', // Ensure default imports correspond to a default export
      'import/no-named-as-default': 'error', // Prevent named exports as default
      'import/no-extraneous-dependencies': 'error', // Ensure dependencies are correctly listed in package.json
      'import/no-cycle': 'error', // Prevent import cycles
      'import/order': ['error', { 'newlines-between': 'always' }], // Enforce a consistent order of imports
    },
  },
];
