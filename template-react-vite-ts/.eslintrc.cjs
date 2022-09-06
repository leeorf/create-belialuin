module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  plugins: ['prettier'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'tests/**',
          '**/jest.config.ts',
          '**/.eslintrc.cjs',
          'vite.config.ts',
        ],
      },
    ],

    'import/prefer-default-export': 'off',

    'react/react-in-jsx-scope': 'off',

    'react/function-component-definition': 'off',

    'prettier/prettier': 'error',
  },
};
