/* eslint-disable no-underscore-dangle */
let _isConnected = false
let _isMainInstance = true
let _targetOrigin
let _iframe
let _iframeContentWindow
/* eslint-enable */
const responseCallbacks = {}

const IFRAME_ID = 'ebakus-wallet-frame'
const LOCAL_STORAGE_PREFIX = '_com.ebakus.wallet'

const frameMinWidth = 150
const frameMinHeight = 60

const getCssStyles = `
#ebakus-wallet-frame {
  position: fixed;
  top: 0;
  right: 0;
  min-width: ${frameMinWidth}px;
  height: ${frameMinHeight}px;
  z-index: 2147483647;
}

#ebakus-wallet-frame.active {
  right: 0 !important;
  width: 340px;
  height: 100% !important;
}

#ebakus-wallet-frame.active.overlay {
  left: 0 !important;
  right: auto !important;
  width: 100% !important;
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

// extract origin from url
const getOrigin = url => {
  const tempLink = document.createElement('a')
  tempLink.setAttribute('href', url)
  return tempLink.origin
}

const renderFrame = walletUrl => {
  const iframe = document.createElement('iframe')
  iframe.id = IFRAME_ID
  iframe.setAttribute('frameBorder', '0')
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')

  iframe.onload = () => {
    // send any message so as the wallet inits itself
    postPassiveMessage('_')

    _isConnected = true

    // dispatch event that we finished loading
    window.dispatchEvent(new CustomEvent('ebakusLoaded'))
  }

  // extract wallet origin so as we can verify iframe postMessage origin
  _targetOrigin = getOrigin(walletUrl)

  iframe.src = _targetOrigin

  try {
    document.body.appendChild(iframe)
    _iframeContentWindow = iframe.contentWindow
  } catch (e) {
    window.addEventListener('DOMContentLoaded', () => {
      ;(document.body || document.documentElement).appendChild(iframe)

      _iframeContentWindow = iframe.contentWindow
    })
  }

  _iframe = iframe
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
      if (typeof res !== 'undefined' && res !== null) {
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

      delete responseCallbacks[payload.id]
    }

    console.groupEnd()
  }

  return new Promise(handler)
}

const postPassiveMessage = (cmd, data) => {
  const payload = {
    cmd,
    passive: true,
    req: data,
  }

  console.groupCollapsed('Loader send passive message to wallet -', payload.cmd)
  console.log('payload: ', payload)

  try {
    _iframeContentWindow.postMessage(JSON.stringify(payload), _targetOrigin)
  } catch (err) {
    console.error('postPassiveMessage err: ', err)
  }

  console.groupEnd()
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

  const payload = JSON.parse(ev.data)
  console.groupCollapsed('Loader receive message from wallet -', payload.cmd)

  console.log('data: ', payload)

  const { id, cmd, req } = payload

  if (id && responseCallbacks[id]) {
    responseCallbacks[id](payload)
  } else if (_isMainInstance) {
    if (cmd === 'active' && _iframe.className.indexOf('active') === -1) {
      _iframe.className += ' active'
      _iframe.removeAttribute('style')
    } else if (cmd === 'inactive') {
      _iframe.className = _iframe.className.replace(/\bactive\b/g, '')
      // _iframe.removeAttribute('style')
    } else if (cmd === 'resize') {
      let styles = ''
      const width = parseInt(payload.width, 10)
      const height = parseInt(payload.height, 10)

      if (height > frameMinHeight) {
        styles += `height: ${height}px;`
      }
      if (width > frameMinWidth) {
        styles += `width: ${width}px;`
      }

      if (styles != '') {
        _iframe.setAttribute('style', styles)
      } else {
        _iframe.removeAttribute('style')
      }
    } else if (
      cmd === 'withOverlay' &&
      _iframe.className.indexOf('overlay') === -1
    ) {
      _iframe.className += ' overlay'
    } else if (cmd === 'withoutOverlay') {
      _iframe.className = _iframe.className.replace(/\boverlay\b/g, '')
    } else if (cmd === 'openInNewTab' && typeof req === 'string') {
      const link = Object.assign(document.createElement('a'), {
        target: '_blank',
        href: req,
      })

      if (link.origin === window.location.origin) {
        window.location.href = req
        return
      }

      const clickEvent = new MouseEvent('click', {
        view: window,
      })

      link.dispatchEvent(clickEvent)
    } else if (cmd === 'localStorageSet') {
      const { key, data } = req
      if (key && data) {
        localStorage.setItem(
          `${LOCAL_STORAGE_PREFIX}:${key}`,
          typeof data === 'string' ? data : JSON.stringify(data)
        )
      }
    } else if (cmd === 'localStorageGet') {
      const { key } = req
      if (key) {
        const data = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}:${key}`)
        try {
          _iframeContentWindow.postMessage(
            JSON.stringify({
              id,
              cmd,
              req,
              res: data,
            }),
            _targetOrigin
          )
        } catch (err) {
          console.error('postPassiveMessage err: ', err)
        }
      }
    } else if (cmd === 'localStorageRemove') {
      const { key } = req
      if (key) {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}:${key}`)
      }
    } else if (cmd === 'event') {
      const { type, data } = payload
      if (typeof type === 'string') {
        window.dispatchEvent(new CustomEvent(type, { detail: data }))
      }
    }
  }
  console.groupEnd()
}

const connectExistingNode = (walletUrl = process.env.EBAKUS_WALLET_URL) => {
  // if iFrame exists already then link to it
  const existingIFrame = document.getElementById(IFRAME_ID)
  if (existingIFrame) {
    // extract wallet origin so as we can verify iframe postMessage origin
    _targetOrigin = getOrigin(existingIFrame.src)

    if (_targetOrigin !== getOrigin(walletUrl)) {
      throw new Error(
        'You are not allowed to connect on different wallets in same window'
      )
    }

    _iframe = existingIFrame
    _iframeContentWindow = _iframe.contentWindow

    _isConnected = true
    _isMainInstance = false
    window.addEventListener('message', receiveMessage, false)
    return
  }
}

const init = (walletUrl = process.env.EBAKUS_WALLET_URL) => {
  if (window._ebkWalletMainInstanceLock === true) {
    let tries = 0
    const checkExists = setInterval(function() {
      if (document.getElementById(IFRAME_ID)) {
        connectExistingNode(walletUrl)
        clearInterval(checkExists)
      }

      if (tries > 20) {
        clearInterval(checkExists)
      }

      tries++
    }, 300)
    return
  }

  window._ebkWalletMainInstanceLock = true

  // load CSS style
  const style = document.createElement('style')
  style.className = 'ebakus-styles'
  style.innerHTML = getCssStyles
  document.getElementsByTagName('head')[0].appendChild(style)

  // create iFrame to wallet
  renderFrame(walletUrl)
  window.addEventListener('message', receiveMessage, false)
}

const isConnected = () => _isConnected

export default init
export {
  isConnected,
  postPassiveMessage as sendPassiveMessageToWallet,
  postMessage as sendMessageToWallet,
}
