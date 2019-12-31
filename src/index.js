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
const getDefaultAddress = () => sendMessageToWallet('defaultAddress')

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
