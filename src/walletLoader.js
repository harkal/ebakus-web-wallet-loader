/* eslint-disable no-underscore-dangle */
let _targetOrigin
let _iframe
let _iframeContentWindow
/* eslint-enable */
const responseCallbacks = {}

const getCssStyles = `
#ebakus-wallet-frame {
  position: fixed;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  z-index: 9999;
}

#ebakus-wallet-frame.active {
  left: 0;
  right: auto;
  width: 100%;
  height: 100%;
}
`

const getUniqueJobId = () => {
  const generateId = () =>
    Math.random()
      .toString(36)
      .slice(2)

  let id = generateId()
  while (id in responseCallbacks) {
    console.log('responseCallbacks: ', id)
    id = generateId()
  }

  return id
}

const renderFrame = () => {
  const iframe = document.createElement('iframe')
  iframe.id = 'ebakus-wallet-frame'
  iframe.setAttribute('frameBorder', '0')
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')

  iframe.onload = () => {
    // send any message so as the wallet inits itself
    postMessage('init')

    // dispatch event that we finished loading
    window.dispatchEvent(new CustomEvent('ebakusLoaded'))
  }

  iframe.src = process.env.EBAKUS_WALLET_URL

  // extract wallet origin so as we can verify iframe postMessage origin
  const tempLink = document.createElement('a')
  tempLink.setAttribute('href', process.env.EBAKUS_WALLET_URL)
  _targetOrigin = tempLink.origin

  try {
    document.body.appendChild(iframe)
  } catch (e) {
    window.addEventListener('DOMContentLoaded', () =>
      (document.body || document.documentElement).appendChild(iframe)
    )
  }

  return iframe
}

const postMessage = (cmd, data) => {
  const payload = {
    id: getUniqueJobId(),
    cmd,
    req: data,
  }

  const handler = (resolve, reject) => {
    console.groupCollapsed('Loader send message to wallet -', payload.cmd)
    console.log('payload: ', payload)

    const callback = response => {
      console.log('response', response)
      delete responseCallbacks[response.id]

      if (response.cmd !== cmd) {
        reject(new Error('Wallet response is not for this request'))
      }

      const { res, err } = response
      if (res) {
        resolve(res)
        return
      }

      reject(err || new Error('Please try again'))
    }

    responseCallbacks[payload.id] = callback

    try {
      _iframeContentWindow.postMessage(JSON.stringify(payload), _targetOrigin)
    } catch (err) {
      console.error('postMessage err: ', err)

      delete responseCallbacks[response.id]
    }

    console.groupEnd()
  }

  return new Promise(handler)
}

const receiveMessage = ev => {
  // skip messages from current page
  if (ev.origin === window.location.origin) {
    return
  }

  // do not accept message from an unexpected origin or frame
  if (ev.origin !== _targetOrigin || ev.source !== _iframeContentWindow) {
    console.warn(`invalid origin ${ev.origin}`)
    return
  }

  const data = JSON.parse(ev.data)
  console.groupCollapsed('Loader receive message from wallet -', data.cmd)

  console.log('data: ', data)

  if (data.id && responseCallbacks[data.id]) {
    responseCallbacks[data.id](data)
  } else if (data.cmd === 'active') {
    _iframe.className = 'active'
  } else if (data.cmd === 'inactive') {
    _iframe.className = ''
  } else if (data.cmd === 'openInNewTab' && typeof data.req === 'string') {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      href: data.req,
    }).click()
  }
  console.groupEnd()
}

const init = () => {
  // load CSS style
  const style = document.createElement('style')
  style.className = 'ebakus-styles'
  style.innerHTML = getCssStyles
  document.getElementsByTagName('head')[0].appendChild(style)

  // create iFrame to wallet
  _iframe = renderFrame()
  _iframeContentWindow = _iframe.contentWindow
  window.addEventListener('message', receiveMessage, false)
}

export default init
export { postMessage as sendMessageToWallet }
