import js from '@eslint/js';
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
  // Override with custom settings
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  }
];

// Convert all errors to warnings
export default downgradeErrorsToWarnings(configs);
