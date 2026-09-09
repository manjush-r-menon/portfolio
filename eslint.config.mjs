import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.log',
      // Dropped-in reference project (see components/gallery-lab) — its own
      // package.json/eslint setup, not source this repo maintains.
      'reference/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js, react: pluginReact, 'react-hooks': pluginReactHooks },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    // react-three-fiber renders three.js scene-graph properties as JSX
    // props (e.g. <mesh args={...} attach="..." />) — these aren't DOM
    // attributes, so react/no-unknown-property doesn't recognize them by
    // default. Scoped to the gallery-lab R3F port rather than the whole
    // repo since nothing else uses R3F.
    files: ['components/gallery-lab/**/*.{ts,tsx}'],
    rules: {
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            'args',
            'attach',
            'object',
            'dispose',
            'visible',
            'transparent',
            'depthWrite',
            'renderOrder',
            'uTexture',
            'uTime',
            'uOpacity',
            'uActive',
          ],
        },
      ],
    },
  },
]);
