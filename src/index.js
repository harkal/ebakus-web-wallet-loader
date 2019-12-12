import walletLoader, {
  sendPassiveMessageToWallet,
  sendMessageToWallet,
  isConnected as isWalletConnected,
} from './walletLoader'

// load wallet
walletLoader()

const init = data => sendPassiveMessageToWallet('init', data)
const isWalletFrameLoaded = () => isWalletConnected()
const unlockWallet = data => sendPassiveMessageToWallet('unlockWallet', data)

const getCurrentProviderEndpoint = () =>
  sendMessageToWallet('currentProviderEndpoint')
const getDefaultAddress = () => sendMessageToWallet('defaultAddress')

const getBalance = () => sendMessageToWallet('getBalance')

const sendTransaction = data => sendMessageToWallet('sendTransaction', data)

export default {
  init,
  isWalletFrameLoaded,
  unlockWallet,
  getCurrentProviderEndpoint,
  getDefaultAddress,
  getBalance,
  sendTransaction,
}
