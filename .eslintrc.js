module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: ['plugin:vue/recommended', '@vue/standard'],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'comma-dangle': [
      'error',
      'never'
    ],
    'space-before-function-paren': 'off',
    'padded-blocks': 'off',
    'no-unused-vars': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          'void': 'always',
          normal: 'never',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    'vue/no-unused-vars': 'off'
  },

  'extends': [
    'plugin:vue/recommended',
    '@vue/standard'
  ]
}
