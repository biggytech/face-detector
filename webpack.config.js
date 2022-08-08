const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/client/script.ts'),
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
            loader: 'ts-loader',
            options: {
                configFile:  path.resolve(__dirname, "./src/client/tsconfig.json")
            }
        }],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false // ignore face-api.js missing 'fs' warning
    }
  },
  output: {
    filename: 'script.js',
    path: path.resolve(__dirname, './dist/public'),
  },
};