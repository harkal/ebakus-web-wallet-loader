# Ebakus Wallet Loader

The wallet library creates an iframe and loads the web wallet library in there. It can accept custom configurations for the wallet (i.e. load custom tokens) and act as an interface between the dApp and the web wallet iframe. This way a user can use his wallet to interface with any ebakus dApp she wants without having to create new keys and manage multiple accounts.

## The boilerplate

The best way to start is to use the dApp Boilerplate, where you can see how you can use the wallet loader library to programatically:

- Send transactions
- Deploy contracts
- Interact with smart contracts
- Configure custom tokens

Contact us at harry@ebakus.com and theo@ebakus.com

Have fun!

## Usage

In your dApp page you have to include our Wallet Loader script.

```js
<script src="./dist/wallet-loader.min.js" />
```

The script will expose `window.ebakus`. You can also have a look at the [example page](./dist/index.html).

## API

The dApp can communicate with the wallet through the loader API.

### Events

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

### Methods

#### ebakus.init(options)

The `init` method can be used in order to pass custom configuration for the actual wallet. At the moment, dApp is allowed to set custom tokens.

```js
window.addEventListener(
  'ebakusLoaded',
  ev => {
    console.warn('Ebakus Wallet loaded')

    // loading custom token to wallet
    ebakus.init({
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

#### ebakus.getDefaultAddress()

The `getDefaultAddress` method returns the wallet address.

```js
ebakus.getDefaultAddress().then(address => {
  console.log('Your wallet address is:', address)
})
```

#### ebakus.getBalance()

The `getBalance` method returns the wallet balance.

```js
ebakus.getBalance().then(balance => console.log)
```

#### ebakus.sendTransaction(tx)

The `sendTransaction` method will ask user to confirm, sign and send the transaction at the network through the wallet.

```js
ebakus.sendTransaction(/* tx object */).then(receipt => console.log)
```

---

## Development

### Install dependencies

```bash
yarn install
```

### Compile for development (with hot-reload support)

```bash
yarn start
```

### Compile and minify for production

```bash
yarn build
```
