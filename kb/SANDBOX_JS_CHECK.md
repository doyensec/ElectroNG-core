## SANDBOX_JS_CHECK - Use `sandbox` for untrusted origins
While nodeIntegration tackles the problem of limiting access to Node.js primitives from a remote untrusted origin, it does neither mitigate security flaws introduced by Electron’s “glorified” APIs, nor does it solve prototype pollution. Electron extends the default JavaScript APIs (e.g. `window.open` returns an instance of `BrowserWindowProxy`) which leads to a larger attack surface.

Instead, sandboxed renderers expose default JavaScript APIs. Additionally, a sandboxed renderer does not have a Node.js environment running (with the exception of preload scripts) and the renderers can only make changes to the system by delegating tasks to the main process via IPC.

This option should be enabled whenever there is a need to load untrusted content in a browser window. **Please note that at the time of writing, `sandbox` is still experimental and may introduce functional side-effects.**

***

### Risk
Even with `nodeIntegration` disabled, the current implementation of Electron does not completely mitigate all risks introduced by loading untrusted resources. As such, it is recommended to enable `sandbox`.

### Auditing
For `BrowserWindow`, sandboxing needs to be explicitly enabled:
```js
mainWindow = new BrowserWindow({
    "webPreferences": {
        "sandbox": true
    }
});
```

To enable sandboxing for all BrowserWindow  instances, a command line argument is necessary:
```
$ electron --enable-sandbox app.js
```

Please note that programmatically adding the command line switch “enable-sandbox" is not sufficient, as the code responsible for appending arguments runs after it is possible to make changes to Chromium's sandbox settings.
Electron needs to be executed from the beginning with the "enable-sandbox" argument.

### References 
* https://www.electronjs.org/docs/latest/tutorial/sandbox