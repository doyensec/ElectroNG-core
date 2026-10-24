## NODE_INTEGRATION_HTML_CHECK - Disable `nodeIntegration` for untrusted origins 
By default, Electron renderers can use Node.js primitives. For instance, a remote untrusted domain rendered in a browser window could invoke Node.js APIs to execute native code on the user’s machine. Similarly, a Cross-Site Scripting (XSS) vulnerability on a website can lead to remote code execution. To display remote content,
`nodeIntegration` should be disabled in the webPreferences of `BrowserWindow` and `webview` tag. 

***

### Risk
If enabled, `nodeIntegration` allows JavaScript to leverage Node.js primitives and modules. This could lead to full remote system compromise if you are rendering untrusted content.

### Auditing
`nodeIntegration` and `nodeIntegrationInWorker` are boolean options that can be used to determine whether node integration is enabled.

For webview tag, default is false. When this attribute is present, the guest page in webview will have node integration:
```xml
<webview src="https://doyensec.com/" nodeintegration></webview> 
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
* https://blog.scottlogic.com/2016/03/09/As-It-Stands-Electron-Security.html