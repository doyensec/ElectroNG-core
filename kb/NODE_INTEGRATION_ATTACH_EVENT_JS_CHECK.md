## NODE_INTEGRATION_ATTACH_EVENT_JS_CHECK - Disable `nodeIntegration` for untrusted origins
By default, Electron renderers can use Node.js primitives. For instance, a remote untrusted domain rendered in a browser window could invoke Node.js APIs to execute native code on the user’s machine. Similarly, a Cross-Site Scripting (XSS) vulnerability on a website can lead to remote code execution. To display remote content, `nodeIntegration` should be disabled in the webPreferences of `BrowserWindow` and `webview` tag. 

***

### Risk
If enabled, `nodeIntegration` allows JavaScript to leverage Node.js primitives and modules. This could lead to full remote system compromise if you are rendering untrusted content.

### Auditing
It is possible to use the `will-attach-webview` event to verify (and potentially change) any attribute of webPreferences. This event is emitted when a `webview` is being attached to the web content. 

Since this mechanism can be used to change the webPreferences configuration, carefully review the implementation of the callback. At the same time, this is a powerful mechanism to validate all settings and ensure a secure instance of `webview`, as demonstrated by this implementation:

```js
app.on('web-contents-created', (event, contents) => {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
        // Strip away preload scripts if unused
        // Alternatively, verify their location if legitimate
        delete webPreferences.preload
        delete webPreferences.preloadURL
        // Disable node integration
        webPreferences.nodeIntegration = false
        // Verify URL being loaded
        if (!params.src.startsWith('https://doyensec.com/')) {
            event.preventDefault()
        }
    })
})
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
* https://blog.scottlogic.com/2016/03/09/As-It-Stands-Electron-Security.html