const path = require('path');
const Html = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Copy = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCss = require('mini-css-extract-plugin');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

const isDevelop = process.env.NODE_ENV === 'development';
const isProduct = !isDevelop;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
  };
  if (isProduct) {
    config.minimizer = [
      new TerserPlugin(),
      new OptimizeCssAssetsPlugin(),
    ];
  }
  return config;
};

module.exports = {
  entry: {
    index: ['@babel/polyfill', './index.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new Html({
      template: './index.html',
      minify: {
        collapseWhitespace: isProduct,
      },
    }),
    new CleanWebpackPlugin(),
    new Copy({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/'),
          to: path.resolve(__dirname, 'dist/assets/'),
        },
      ],
    }),
    new MiniCss({
      filename: 'style.css',
    }),
  ],
  context: path.resolve(__dirname, 'src'),
  optimization: optimization(),
  devServer: {
    port: 4300,
    hot: isDevelop,
  },
  devtool: isDevelop ? 'source-map' : '',
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: [
          {
            loader: MiniCss.loader,
            options: {
              hmr: isDevelop,
              reloadAll: true,
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/,
        loader: [
          {
            loader: MiniCss.loader,
            options: {
              hmr: isDevelop,
              reloadAll: true,
            },
          },
          'css-loader',
          {
            loader: 'postcss-loader', // Run post css actions
            options: {
              plugins() { // post css plugins, can be exported to postcss.config.js
                return [
                  precss,
                  autoprefixer,
                ];
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'file-loader',
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
          },
        },
      },
    ],
  },
};
