const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const isDevelopment = process.env.NODE_ENV  === "development";

module.exports = {
   mode: isDevelopment ? "development" : "production",
  entry: {
    popup: "./src/popup.ts",
    background: "./src/background.ts",
    editor: "./src/editor.ts",
    off_screen: "./src/off_screen.ts",
    utils: "./src/utils/logger.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
          "ts-loader",
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".scss"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "layouts/editor.html", to: "editor.html" },
        { from: "src/styles/editor.css", to: "styles/editor.css" },
        { from: "layouts/popup.html", to: "popup.html" },
        { from: "src/styles/popup.css", to: "styles/popup.css" },
        { from: "src/libs/cropper.min.js", to: "libs/cropper.min.js" },
        { from: "src/styles/cropper.css", to: "styles/cropper.css" },
        { from: "manifest.json", to: "manifest.json" },
        { from: "icons", to: "icons" },
        { from: "layouts/off_screen.html", to: "off_screen.html" },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
  devtool: "source-map",
};
