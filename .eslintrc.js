module.exports = {
    parser: 'babel-eslint',
    plugins: [
        'eslint-plugin-flowtype'
    ],
    extends: [
        'eslint-config-airbnb-base',
        'plugin:flowtype/recommended',
        'eslint-config-prettier'
    ],
    rules: {
        "no-else-return": 0
    }
};
