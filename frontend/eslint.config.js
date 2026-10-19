import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import vitest from 'eslint-plugin-vitest'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // 2. הגדרות ייעודיות לקובצי הבדיקות של Vitest
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/tests/**'],
    plugins: {
      vitest,
    },
    extends: [
      vitest.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...vitest.environments.env.globals, // מאפשר שימוש ב-describe, test, expect וכו'
      },
    },
  },
])
