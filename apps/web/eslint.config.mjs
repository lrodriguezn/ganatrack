import js from '@eslint/js'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  // Next.js core-web-vitals (includes React, JSX a11y, import, TypeScript parser base)
  ...nextCoreWebVitals,

  // Base JavaScript recommended
  js.configs.recommended,

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // React flat config recommended
  react.configs.flat.recommended,

  // React Hooks flat config recommended
  reactHooks.configs.flat.recommended,

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        React: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',

      // React Hooks — kept as warn while legacy code is migrated
      'react-hooks/rules-of-hooks': 'warn', // TODO: tighten to error once legacy conditional hook usage is fixed
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn', // TODO: tighten to error once legacy setState-in-effect patterns are refactored
      'react-hooks/preserve-manual-memoization': 'warn', // TODO: tighten to error once manual memoization is aligned with React Compiler
      'react-hooks/incompatible-library': 'warn', // TODO: tighten to error once incompatible library usages are resolved
      'react-hooks/purity': 'warn', // TODO: tighten to error once impure render patterns are fixed
      'react-hooks/refs': 'warn', // TODO: tighten to error once ref-during-render patterns are fixed

      // TypeScript strict additions
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // TODO: tighten to error once legacy unused vars are cleaned up
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars

      '@typescript-eslint/no-explicit-any': 'warn', // TODO: tighten to error once legacy any usage is cleaned up
      'no-explicit-any': 'off',

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ], // TODO: tighten to error once legacy imports are migrated to type-only

      '@typescript-eslint/no-empty-object-type': 'warn', // TODO: tighten to error once empty object types are refactored

      'react/display-name': 'warn', // TODO: tighten to error once test components have explicit display names
      'react/no-unescaped-entities': 'warn', // TODO: tighten to error once JSX entities are escaped

      'prefer-const': 'warn', // TODO: tighten to error once legacy let declarations are migrated
    },
  },

  // Allow console in test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'no-console': 'off',
    },
  },

  // Global ignores
  {
    ignores: [
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'next-env.d.ts',
    ],
  },
]
