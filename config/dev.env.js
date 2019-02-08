const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  EBAKUS_WALLET_URL: '"https://testpow.ebakus.com"',
})
