const path = require("path"); // Подключаем модуль для работы с путями файловой системы
const CopyPlugin = require("copy-webpack-plugin"); // Плагин для копирования файлов в итоговую папку
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // Плагин для очистки папки dist перед сборкой
const Dotenv = require("dotenv-webpack");
const isDevelopment = process.env.NODE_ENV === "development"; // Определяем, в каком режиме работает сборка (разработка или продакшн)

module.exports = {
  // Устанавливаем режим работы сборки: "development" или "production"
  mode: isDevelopment ? "development" : "production",

  // Точки входа для разных частей расширения
  entry: {
    popup: "./src/popup.ts", // Точка входа для всплывающего окна
    background: "./src/background.ts", // Точка входа для фонового скрипта
    editor: "./src/editor.ts", // Точка входа для редактора
    off_screen: "./src/off_screen.ts", // Точка входа для оффлайн-режима
    utils: "./src/utils/logger.ts", // Точка входа для утилитных функций
  },

  // Конфигурация для вывода собранных файлов
  output: {
    path: path.resolve(__dirname, "dist"), // Папка для вывода собранных файлов
    filename: "[name].js", // Имя файлов будет соответствовать именам точек входа (popup.js, background.js и т. д.)
  },

  // Настройка для работы с различными типами файлов
  module: {
    rules: [
      {
        // Правило для обработки CSS файлов
        test: /\.css$/i,
        use: ["style-loader", "css-loader"], // Используем loaders для обработки CSS
      },
      {
        // Правило для обработки TypeScript файлов
        test: /\.ts$/,
        use: [
          {
            loader: "babel-loader", // Используем Babel для транспиляции современных JS
            options: {
              presets: ["@babel/preset-env"], // Пресет для поддержки современных функций JS
            },
          },
          "ts-loader", // Используем ts-loader для трансляции TypeScript
        ],
        exclude: /node_modules/, // Исключаем папку node_modules
      },
    ],
  },

  // Указываем расширения файлов, которые можно не указывать при импорте
  resolve: {
    extensions: [".ts", ".js", ".css"], // Указываем расширения для TypeScript, JS и CSS
  },

  // Плагины для работы с проектом
  plugins: [
    new CopyPlugin({
      // Плагин для копирования файлов в папку dist
      patterns: [
        { from: "layouts/editor.html", to: "editor.html" }, // Копируем HTML-файл редактора
        { from: "src/styles/editor.css", to: "styles/editor.css" }, // Копируем стили для редактора
        { from: "layouts/popup.html", to: "popup.html" }, // Копируем HTML-файл для popup
        { from: "src/styles/popup.css", to: "styles/popup.css" }, // Копируем стили для popup
        { from: "src/libs/cropper.min.js", to: "libs/cropper.min.js" }, // Копируем библиотеку для обрезки изображений
        { from: "src/styles/cropper.css", to: "styles/cropper.css" }, // Копируем стили для обрезки
        { from: "manifest.json", to: "manifest.json" }, // Копируем манифест расширения
        { from: "icons", to: "icons" }, // Копируем иконки
        { from: "layouts/off_screen.html", to: "off_screen.html" }, // Копируем HTML-файл для оффлайн-режима
      ],
    }),
    new CleanWebpackPlugin(), // Очищаем папку dist перед новой сборкой
    new Dotenv(), // Загружает переменные из .env файла в process.env
  ],

  // Генерация карты исходников для отладки
  devtool: "source-map", // Используется для генерации карт исходников для отладки
};
