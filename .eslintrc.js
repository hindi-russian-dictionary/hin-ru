module.exports = {
    extends: ['react-app', 'prettier', 'plugin:import/typescript'],
    parser: '@typescript-eslint/parser',
    plugins: ['react', 'react-hooks', 'import', '@typescript-eslint'],
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    parserOptions: {
        ecmaFeatures: {jsx: true},
        sourceType: 'module',
    },
    globals: {},
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        quotes: ['error', 'single', {avoidEscape: true}],
        'object-curly-spacing': 'error',
    }
};
