module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['plugin:node/recommended', 'airbnb', 'airbnb/hooks', 'airbnb-typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json',
  },
  rules: {
    // Flag usages of ECMAScript that our Node.js version isn't compatible with
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: ['modules'],
      },
    ],
    // Allow importing devDependencies like ethers in non-test files
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    // Disable flagging missing imports
    'node/no-missing-import': ['off'],
    // Warn when lines are >120 characters
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreUrls: true,
      },
    ],
    // Allow multi-line strings (we don't care about older versions before ES5)
    'no-multi-str': ['off'],
    // Flag prettier warnings in ESLint
    'prettier/prettier': ['warn'],
  },
};
