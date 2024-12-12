import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';
import fastGlob from 'fast-glob';
import process from 'node:process';
import CopyWebpackPlugin from 'copy-webpack-plugin';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Шукаємо всі Pug-шаблони у папці src/pug/pages/
const pages = fastGlob.sync('./src/pug/pages/*.pug');

const config = {
  entry: './src/index.js', // Якщо вам потрібен JS для основного entry
  output: {
    path: path.resolve(__dirname, 'dist'), // Куди зберігати результат
    filename: '[name].js', // Це для JS, якщо він потрібен
    clean: true,
  },
  cache: false,
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',
  devServer: {
    open: true,
    host: 'localhost',
    hot: true,
    port: 3000,
    watchFiles: ['./src/**/*'],
    static: {
      directory: path.resolve('src/static'), // Serve files from the build folder
    },
  },
  plugins: [
    
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('src/static/'), // Source folder for static files
          to: path.resolve('dist/static'), // Destination in the build folder
          noErrorOnMissing: true,
        },
      ],
    }),

    // Перевіряємо, чи правильно підключаємо HtmlWebpackPlugin для кожного шаблону
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, page),  // Шлях до Pug-шаблону
          filename: path.basename(page, '.pug') + '.html',  // Генерація HTML з ім'ям сторінки
          // inject: false,  // Якщо потрібно вручну вставити скрипти та стилі
        })
    ),
    new MiniCssExtractPlugin({
      filename: 'styles.css', // Збираємо CSS в окремий файл
    }),
    isProduction && new GenerateSW(), // Для прогресивного кешування
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      {
        test: /\.pug$/, 
        loader: 'pug-loader', 
      },
    ],
  },
};

export default () => config;
