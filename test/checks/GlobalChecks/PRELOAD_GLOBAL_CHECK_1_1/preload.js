const fs = require('fs')
const { ipcRenderer } = require('electron')

// read a configuration file using the `fs` module
const buf = fs.readFileSync('allowed-popup-urls.json')
const allowedUrls = JSON.parse(buf.toString('utf8'))

const defaultWindowOpen = window.open

function customWindowOpen (url, ...args) {
  if (allowedUrls.indexOf(url) === -1) {
    ipcRenderer.sendSync('blocked-popup-notification', location.origin, url)
    return null
  }
  return defaultWindowOpen(url, ...args)
}

module.exports = {
 send: send,
 on
}

process.once('loaded', function () {
 global.DiscordNative = DiscordNative; 
})

window.sendIPCRequestSync = sendIPCRequestSync;

window.test = function() {
    console.log(fs)
}