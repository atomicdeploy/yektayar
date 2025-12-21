import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/android/**',
      '**/ios/**',
      '**/capacitor.config.ts',
      '**/*.min.js',
      '**/scripts/**'
    ]
  },
  // Base JavaScript/TypeScript configuration
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Custom rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      globals: {
        // Node.js globals for backend
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },
  // Vue files configuration
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        // Browser globals (alphabetically ordered)
        alert: 'readonly',
        AnimationEvent: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        confirm: 'readonly',
        console: 'readonly',
        CSSStyleDeclaration: 'readonly',
        CustomEvent: 'readonly',
        customElements: 'readonly',
        document: 'readonly',
        Event: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLImageElement: 'readonly',
        Image: 'readonly',
        IntersectionObserver: 'readonly',
        IntersectionObserverEntry: 'readonly',
        KeyboardEvent: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        ResizeObserver: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        TransitionEvent: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'vue/multi-word-component-names': 'warn',
      'vue/no-deprecated-slot-attribute': 'warn',
      // Allow attributes on the same line (not forcing multiline)
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off'
    }
  },
  // Shared package files - need both browser and Node.js globals
  {
    files: ['**/packages/shared/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        window: 'readonly',
        document: 'readonly',
        Image: 'readonly',
        CustomEvent: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn'
    }
  },
  // Backend files - add Node.js and Bun globals
  {
    files: ['**/packages/backend/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        Bun: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn'
    }
  },
  // Exception for logger.ts file - allow console usage
  {
    files: ['**/packages/shared/src/utils/logger.ts'],
    rules: {
      'no-console': 'off'
    }
  },
  // Exception for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.js'],
    languageOptions: {
      globals: {
        Request: 'readonly',
        Response: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  // Exception for example files
  {
    files: ['**/examples/**/*.ts', '**/usage.ts'],
    rules: {
      'no-console': 'warn'
    }
  }
]
