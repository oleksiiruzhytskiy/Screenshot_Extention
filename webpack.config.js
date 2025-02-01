const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup.ts',       
    background: './src/background.ts',  
    editor: './src/editor.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'editor.html', to: 'editor.html' },  // Копируем editor.html
        { from: "src/libs/cropper.min.js", to: "libs/cropper.min.js" },  // Копируем cropper.min.js
        { from: 'src/styles/editor.css', to: 'styles/editor.css' },  // Копируем editor.css
      ],
    }),
  ],
  mode: 'development',
  devtool: 'source-map',
};
