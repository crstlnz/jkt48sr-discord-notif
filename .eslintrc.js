module.exports = {
  env: {
    es2021: true
  },
  extends: '@antfu',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'comma-dangle': ['error', 'never'],
    '@typescript-eslint/comma-dangle': 'off',
    'antfu/if-newline': 'off',
    'curly': ['error', 'multi-line'],
    'space-before-blocks': 'error'
  }
}
