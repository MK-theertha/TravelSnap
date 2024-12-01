import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist', 'node_modules'] }, // Ignore unnecessary directories
  {
    files: ['**/*.js'], // Only target JavaScript files
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node, // Include Node.js globals
      },
      parserOptions: {
        sourceType: 'module', // Support ES modules
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules, // Recommended JavaScript rules

      // Import-related rules
      'import/no-unresolved': 'error', // Prevent unresolved imports
      'import/named': 'error', // Ensure named imports are correctly defined
      'import/default': 'error', // Ensure default imports are valid
      'import/no-extraneous-dependencies': 'error', // Ensure dependencies are in package.json
      'import/no-cycle': 'error', // Prevent import cycles
      'import/order': ['error', { 'newlines-between': 'always' }], // Enforce import order

      // Node.js best practices
      'no-console': 'warn', // Allow but warn on console statements
      'no-process-env': 'off', // Allow usage of `process.env`
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore unused arguments starting with "_"
      'no-underscore-dangle': 'off', // Allow underscores in variable names (common in MongoDB IDs)
    },
  },
];
