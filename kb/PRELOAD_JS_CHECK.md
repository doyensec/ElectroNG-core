## PRELOAD_JS_CHECK - Review the use of preload scripts 

Despite disabling `nodeIntegration` or enabling `sandbox`, _preload scripts_ have access to Node.js APIs. When node integration is turned off, the preload script can reintroduce Node global symbols back to the global scope. Also, the current implementation of the Chromium sandbox still allows access to all underlying Electron/Node.js primitives using either the remote module or internal IPC:

#1 - Sandbox bypass in preload scripts using remote
```js
app = require('electron').remote.app
```

#2 - Sandbox bypass in preload scripts using internal Electron IPC messages
```js
const { ipcRenderer } = require('electron')
app = ipcRenderer.sendSync('ELECTRON_BROWSER_GET_BUILTIN', 'app')
```
As demonstrated in the examples above, a malicious preload script can still obtain a reference to the application object by leveraging the remote module, which provides a simple way to do inter-process communication (IPC) between the renderer process and the main process. Finally, it is also possible to emulate the internal IPC mechanism sending a message to the main process synchronously via `ELECTRON_` internal channels. 

**Considering the privileged access available in preload, the code of preload scripts must be carefully reviewed.**

***

### Risk
Improper use of preload scripts can introduce nodeIntegration or sandbox bypasses, in addition to other vulnerabilities.
If `contextIsolation` is not used, there is also the risk that malicious code may be able to tamper sensitive operations with prototype pollution attacks.

### Auditing
Search for the `preload` directive within the `webPreferences` of `BrowserWindow`. Manually review all imported scripts.

### References
* https://www.electronjs.org/docs/latest/tutorial/tutorial-preload