import walletLoader, {
  sendPassiveMessageToWallet,
  sendMessageToWallet,
  isConnected as isWalletConnected,
} from './walletLoader'

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

const isWalletFrameLoaded = () => isWalletConnected()
const unlockWallet = data => sendPassiveMessageToWallet('unlockWallet', data)

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
const getBalance = () => sendMessageToWallet('getBalance')
const getStaked = () => sendMessageToWallet('getStaked')

const sendTransaction = data => sendMessageToWallet('sendTransaction', data)

export default {
  init,
  isWalletFrameLoaded,
  unlockWallet,
  getCurrentProviderEndpoint,
  getDefaultAddress,
  getBalance,
  getStaked,
  sendTransaction,
}
