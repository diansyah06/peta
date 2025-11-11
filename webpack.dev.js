const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
    devMiddleware: {
      writeToDisk: (filePath) => {
        // Hanya tulis sw.bundle.js ke disk, file lain tetap di memori
        return /sw\.bundle\.js$/.test(filePath);
      },
    },
    proxy: [
      {
        context: ['/v1'],
        target: 'https://story-api.dicoding.dev/',
        changeOrigin: true,
      },
    ],
  },
});
