const path = require('path')
const webpack = require('webpack')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const pkg = require('./package.json')

const now = new Date()

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const env = IS_PRODUCTION
  ? require('./config/prod.env')
  : require('./config/dev.env')

const banner = `${pkg.description} v${pkg.version}

@author ${pkg.author}
@website ${pkg.homepage}

@copyright Ebakus ${now.getFullYear()}
@license ${pkg.license}`

const optimization = {}
if (IS_PRODUCTION) {
  optimization.minimize = true
  optimization.minimizer = [
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: false,
      extractComments: false,
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
    'wallet-loader': './index.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: {
      root: 'ebakusWallet',
      amd: pkg.name,
      commonjs: pkg.name,
    },
    globalObject: 'this',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 3000,
    contentBase: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new webpack.BannerPlugin({ banner }),
    new HtmlWebpackPlugin({
      title: 'Ebakus Wallet Loader Boilerplate',
      template: 'index.ejs',
      inject: false,
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
