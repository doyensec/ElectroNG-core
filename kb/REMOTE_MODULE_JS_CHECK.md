## REMOTE_MODULE_JS_CHECK - Disable the `remote` module
The remote module provides a way for the renderer processes to access APIs normally only available in the main process. Using it, a renderer can invoke methods of a main process object without explicitly sending inter-process messages. This is highly discouraged since the module is considered harmful. 

***

### Risk
`remote` uses an internal IPC channel to communicate with the main process. "Prototype pollution" attacks can grant malicious code access to the internal IPC channel, which can then be used to escape the sandbox by mimicking remote IPC messages and getting access to main process modules running with higher privileges.

### Auditing
Ensure that the `remote` module is globally disabled by using the `enableRemoteModule` setting in all `BrowserWindow` and `BrowserView`:

```js
const mainWindow = new BrowserWindow({
  webPreferences: {
    enableRemoteModule: false
  }
})
```

### References
* https://www.npmjs.com/package/@electron/remote
* https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31
