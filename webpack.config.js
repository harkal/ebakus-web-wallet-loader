const path = require('path')
const webpack = require('webpack')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const pkg = require('./package.json')

const now = new Date()

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const env = IS_PRODUCTION
  ? require('./config/prod.env')
  : require('./config/dev.env')

const banner = `${pkg.description} v${pkg.version}

@author ${pkg.author.name} <${pkg.author.email}>
@website ${pkg.homepage}

@copyright Ebakus ${now.getFullYear()}
@license ${pkg.license}`

const optimization = {}
if (IS_PRODUCTION) {
  optimization.minimizer = [
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: !IS_PRODUCTION, // set to true if you want JS source maps
      terserOptions: {
        compress: {
          global_defs: {
            // false, means that it will be removed from Production build
            __DEV__: false,
            __DISABLED_FEATURE__: false,
          },
          warnings: false,
          sequences: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          dead_code: true,
          drop_debugger: true,
          drop_console: true,
          passes: 2,
          pure_funcs: ['console', 'window.console'],
        },
        mangle: true,
      },
    }),
  ]
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    ebakus: './index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'window',
    library: 'ebakus',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    contentBase: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new webpack.BannerPlugin({ banner }),
    new HtmlWebpackPlugin({
      title: pkg.description,
      template: 'index.ejs',
    }),
  ],
  optimization,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
}
