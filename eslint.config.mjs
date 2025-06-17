// import js from '@eslint/js';
// import react from 'eslint-plugin-react';
// import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefresh from 'eslint-plugin-react-refresh';
// import globals from 'globals';
// import eslintPluginUnicorn from 'eslint-plugin-unicorn';
// import tseslint from 'typescript-eslint'

// export default [
//   js.configs.recommended,
//   react.configs.flat.recommended,
//   react.configs.flat['jsx-runtime'],
//   ...tseslint.configs.recommended,
//   {
//     plugins: {
//       'react-hooks': reactHooks,
//       'react-refresh': reactRefresh,
//       unicorn: eslintPluginUnicorn,
//     },
//     rules: {
//       ...reactHooks.configs.recommended.rules,
//       'react-refresh/only-export-components': [
//         'warn',
//         { allowConstantExport: true },
//       ],
//       'react/prop-types': 'off',
//       'unicorn/prefer-node-protocol': 'warn',
//     },
//     settings: {
//       react: {
//         version: 'detect',
//       },
//     },
//   },
//   {
//     files: ['**/*.{js,jsx,ts,tsx}'],
//     languageOptions: {
//       ecmaVersion: 2020,
//       sourceType: 'module',
//       globals: {
//         ...globals.node,
//         ...globals.browser,
//         ...globals.webextensions,
//       },
//       parserOptions: {
//         ecmaFeatures: {
//           jsx: true,
//         },
//       },
//     },
//   },
//   {
//     ignores: ['dist', 'lib', 'build', 'node_modules'],
//   },
// ];

/* ------------------------------------------------------ */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      unicorn: eslintPluginUnicorn,
      react: react,
    },
    rules: {
      'unicorn/prefer-node-protocol': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      // 'react/jsx-uses-react': 'off',
      // 'react/react-in-jsx-scope': 'off',
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.webextensions,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['dist', 'build', 'node_modules'],
  }
);
