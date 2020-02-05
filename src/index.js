import walletLoader, {
  sendPassiveMessageToWallet,
  sendMessageToWallet,
  isConnected as isWalletConnected,
} from './walletLoader'

/**
 * Create an iFrame to the wallet and establish a communication channel.
 *
 * @param {object} Options that will be passed to the wallet during load.
 */
const init = options => {
  const { walletEndpoint, tokens } = options || {}
  if (tokens) {
    window.addEventListener('ebakusLoaded', () => {
      sendPassiveMessageToWallet('init', { tokens })
    })
  }

  // load wallet
  walletLoader(walletEndpoint)
}

/**
 * Becomes true when the iframe of the wallet has finished loading.
 *
 * @return {bool}
 */
const isWalletFrameLoaded = () => isWalletConnected()

/**
 * Opens the wallet in unlock UI, only when wallet is locked.
 */
const unlockWallet = data => sendPassiveMessageToWallet('unlockWallet', data)

/**
 * Get the provider endpoint url of the node wallet is connected with.
 *
 * @return {Promise<string>}
 */
const getCurrentProviderEndpoint = () =>
  sendMessageToWallet('currentProviderEndpoint')

/**
 * Get the unlocked account in Ebakus wallet.
 *
 * @throws when wallet is locked or no account has been created
 * @return {Promise<string>} A hex address
 */
const getAccount = () => sendMessageToWallet('getAccount')

/**
 * @deprecated since 0.1.5; use getAccount instead.
 */
const getDefaultAddress = () => getAccount()

/**
 * Get the account balance.
 *
 * @throws
 * @return {Promise<string>} Balance in Wei.
 */
const getBalance = () => sendMessageToWallet('getBalance')

/**
 * Get the account staked amount.
 *
 * @throws
 * @return {Promise<number>}
 */
const getStaked = () => sendMessageToWallet('getStaked')

/**
 * Send a transaction through the wallet, signed by the account loaded in the wallet.
 *
 * @param {object} The transaction to be send.
 * @return {Promise<object>} Transaction receipt.
 */
const sendTransaction = data => sendMessageToWallet('sendTransaction', data)

export default {
  init,
  isWalletFrameLoaded,
  unlockWallet,
  getCurrentProviderEndpoint,
  getAccount,
  getDefaultAddress,
  getBalance,
  getStaked,
  sendTransaction,
}
