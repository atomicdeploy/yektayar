import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';

// Helper function to convert all error rules to warnings
function downgradeErrorsToWarnings(config) {
  if (Array.isArray(config)) {
    return config.map(downgradeErrorsToWarnings);
  }
  
  if (config && typeof config === 'object' && config.rules) {
    const newRules = {};
    for (const [key, value] of Object.entries(config.rules)) {
      if (value === 'error' || value === 2) {
        newRules[key] = 'warn';
      } else if (Array.isArray(value) && (value[0] === 'error' || value[0] === 2)) {
        newRules[key] = ['warn', ...value.slice(1)];
      } else {
        newRules[key] = value;
      }
    }
    return { ...config, rules: newRules };
  }
  
  return config;
}

const configs = [
  // Apply recommended configs first
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  // Override with custom settings
  {
    files: ['**/*.vue', '**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Allow attributes on the same line (not forcing multiline)
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'android/**', 'scripts/**', '.gitignore'],
  }
];

// Convert all errors to warnings
export default downgradeErrorsToWarnings(configs);
