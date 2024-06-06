// Rename this file to babel.config.cjs
module.exports = {
  presets: [
      [
          '@babel/preset-env',
          {
              targets: {
                  node: 'current',
              },
          },
      ],
      '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
};
