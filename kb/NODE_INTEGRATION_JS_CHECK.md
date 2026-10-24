## NODE_INTEGRATION_JS_CHECK - Disable `nodeIntegration` for untrusted origins 
By default, Electron renderers can use Node.js primitives. For instance, a remote untrusted domain rendered in a browser window could invoke Node.js APIs to execute native code on the user’s machine. Similarly, a Cross-Site Scripting (XSS) vulnerability on a website can lead to remote code execution. To display remote content,
`nodeIntegration` should be disabled in the webPreferences of `BrowserWindow` and `webview` tag. 

***

### Risk
If enabled, `nodeIntegration` allows JavaScript to leverage Node.js primitives and modules. This could lead to full remote system compromise if you are rendering untrusted content.

### Auditing
`nodeIntegration` and `nodeIntegrationInWorker` are boolean options that can be used to determine whether node integration is enabled.

For `BrowserWindow`, default is true. If the option is not present, or is set to true/1, `nodeIntegration` is enabled as in the following examples:

```js
mainWindow = new BrowserWindow({
    "webPreferences": {
        "nodeIntegration": true,
        "nodeIntegrationInWorker": 1
    }
});
```
Or simply:
```js
const mainWindow = new BrowserWindow();
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
* https://blog.scottlogic.com/2016/03/09/As-It-Stands-Electron-Security.html