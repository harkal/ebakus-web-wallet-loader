import walletLoader, {
  sendPassiveMessageToWallet,
  sendMessageToWallet,
  isConnected as isWalletConnected,
} from './walletLoader'

// load wallet
walletLoader()

export const init = data => sendPassiveMessageToWallet('init', data)
export const isConnected = () => isWalletConnected()
export const unlockWallet = data =>
  sendPassiveMessageToWallet('unlockWallet', data)

export const getCurrentProviderEndpoint = () =>
  sendMessageToWallet('currentProviderEndpoint')
export const getDefaultAddress = () => sendMessageToWallet('defaultAddress')

export const getBalance = () => sendMessageToWallet('getBalance')

export const sendTransaction = data =>
  sendMessageToWallet('sendTransaction', data)
