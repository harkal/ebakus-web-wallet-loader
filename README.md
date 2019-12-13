# Ebakus Wallet Loader

The wallet library creates an iframe and loads the web wallet library in there. It can accept custom configurations for the wallet (i.e. load custom tokens) and act as an interface between the dApp and the web wallet iframe. This way a user can use his wallet to interface with any ebakus dApp she wants without having to create new keys and manage multiple accounts.

You check how it looks like inside a dApp at [an existing dApp](https://demo.ebakus.com).

## The boilerplate

The best way to start is to use the dApp Boilerplate, where you can see how you can use the wallet loader library to programatically:

- Send transactions
- Deploy contracts
- Interact with smart contracts
- Configure custom tokens

Contact us at harry@ebakus.com and theo@ebakus.com

Have fun!

## Load package

### Using npm

```bash
npm install --save ebakus-web-wallet-loader
```

and use it like:

```js
import ebakusWallet from 'ebakus-web-wallet-loader'

ebakusWallet.sendTransaction(...)
```

### With a script tag from your site

In your dApp page you have to include our Wallet Loader script.

Load it from CDN:

```html
<script src="https://unpkg.com/ebakus-web-wallet-loader" />
```

or copy it to your site:

```html
<script src="./dist/wallet-loader.min.js" />
```

The script will expose `window.ebakusWallet`. You can also have a look at the [example page](./dist/index.html).

## API

The dApp can communicate with the wallet through the loader API.

### Events

### ebakusLoaded

When loader has finished loading with the wallet loading it will dispatch the `ebakusLoaded` event.

```js
window.addEventListener(
  'ebakusLoaded',
  ev => {
    console.warn('Ebakus Wallet loaded')
  },
  false
)
```

### ebakusCurrentProviderEndpoint

Every time the user switches the connected node the wallet will dispatch the `ebakusCurrentProviderEndpoint` event.

```js
window.addEventListener(
  'ebakusCurrentProviderEndpoint',
  ({ detail: endpoint }) => {
    console.log('The web3 provider wallet is connected is:', endpoint)

    // for a new web3 instance
    web3 = Web3Ebakus(new Web3(endpoint))

    // or for using an existing one
    // web3.setProvider(endpoint)
  },
  false
)
```

### ebakusConnectionStatus

Every time the wallet connection with the node changes it will dispatch the `ebakusConnectionStatus` event.

```js
window.addEventListener(
  'ebakusConnectionStatus',
  ({ detail: connectionStatus }) => {
    console.warn('The wallet connection status changed to', connectionStatus)
  },
  false
)
```

### ebakusBalance

On wallet balance change it will dispatch the `ebakusBalance` event.

```js
window.addEventListener(
  'ebakusBalance',
  ({ detail: balance }) => {
    console.warn('The new user balance is', web3.utils.toWei(balance))
  },
  false
)
```

### Methods

#### ebakusWallet.init(options)

The `init` method can be used in order to pass custom configuration for the actual wallet. At the moment, dApp is allowed to set custom tokens.

```js
window.addEventListener(
  'ebakusLoaded',
  ev => {
    console.warn('Ebakus Wallet loaded')

    // loading custom token to wallet
    ebakusWallet.init({
      tokens: [
        {
          contract_address: '0xa679d48c57320e9f0eadb043c3ea3f8dcd97ed01',
          symbol: 'SIM',
          decimals: 18,
        },
      ],
    })
  },
  false
)
```

#### ebakusWallet.isWalletFrameLoaded()

The `isWalletFrameLoaded` method returns if the wallet frame has finished loading.

```js
if (ebakusWallet.isWalletFrameLoaded()) {
  // do something
}
```

#### ebakusWallet.getCurrentProviderEndpoint()

The `getCurrentProviderEndpoint` method returns the wallet used web3 endpoint so as the dApp can connect to the same provider.

```js
ebakusWallet.getCurrentProviderEndpoint().then(endpoint => {
  console.log('The web3 provider wallet is connected is:', endpoint)

  // for a new web3 instance
  web3 = Web3Ebakus(new Web3(endpoint))

  // or for using an existing one
  // web3.setProvider(endpoint)
})
```

#### ebakusWallet.unlockWallet()

The `unlockWallet` method will ask your user to unlock the wallet in case it is locked. This is not needed most times as the wallet will ask on the first wallet interaction, when needed.

```js
ebakusWallet.unlockWallet()
```

#### ebakusWallet.getDefaultAddress()

The `getDefaultAddress` method returns the wallet address.

```js
ebakusWallet.getDefaultAddress().then(address => {
  console.log('Your wallet address is:', address)
})
```

#### ebakusWallet.getBalance()

The `getBalance` method returns the wallet balance.

```js
ebakusWallet.getBalance().then(balance => console.log)
```

#### ebakusWallet.sendTransaction(tx)

The `sendTransaction` method will ask user to confirm, sign and send the transaction at the network through the wallet.

```js
ebakusWallet.sendTransaction(/* tx object */).then(receipt => console.log)
```

---

## Development

### Install dependencies

```bash
npm install
```

### Compile for development (with hot-reload support)

```bash
npm start
```

### Compile and minify for production

```bash
npm run build
```
