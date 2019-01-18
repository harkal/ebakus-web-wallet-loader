import walletLoader, { sendMessageToWallet } from './walletLoader'

// load wallet
walletLoader()

export const getDefaultAddress = () => sendMessageToWallet('defaultAddress')

export const getBalance = () => sendMessageToWallet('getBalance')

export const sendTransaction = data =>
  sendMessageToWallet('sendTransaction', data)
