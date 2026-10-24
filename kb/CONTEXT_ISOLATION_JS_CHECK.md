## CONTEXT_ISOLATION_JS_CHECK - Review the use of the `contextIsolation` option 

The `contextIsolation` introduces JavaScript context isolation for preload scripts, as implemented in Chrome Content Scripts. Using this **important** option, it is possible to obtain:

* Different JS contexts between renderers and preload scripts
* Different JS contexts between renderers and Electron’s framework code 

The preload script will still have an access to global variables, but it will use its own set of JavaScript builtins(Array,  Object,  JSON, etc.) and will be isolated from any changes made to the global environment by the loaded page. 

The `contextIsolation` is required for isolation even if you disabled `nodeIntegration`. 
As of today, if the `contextIsolation` is not enabled then malicious JS code execution of the Node's APIs will be allowed.

Building and maintaining a robust context isolation requires several foresights, such as:
* Enable `worldSafeExecuteJavaScript` [(doc)](https://www.electronjs.org/docs/api/browser-window#class-browserwindow) on Electron versions that still support it, since values returned from webFrame.executeJavaScript will be sanitized to ensure JS values can't unsafely cross between worlds when using contextIsolation. The default was false until Electron 12 (where it became true). The option was removed in Electron 14. 
* Using a [latest version of Electron with up-to-date security patches](https://www.electronjs.org/docs/tutorial/security#17-use-a-current-version-of-electron)
* Use `contextBridge` [securely](https://www.electronjs.org/docs/tutorial/context-isolation#security-considerations), without exposing powerful APIs to insecure renderers

***

### Risk
If `contextIsolation` is not used, malicious JS code can tamper JavaScript native functions as well as preload script code via _prototype pollution_.

### Auditing

Ensure that `contextIsolation` is always set with `contextIsolation: true`.

Starting from Electron v12, it is expected to be enabled by default.

### References
* https://www.electronjs.org/docs/latest/tutorial/security#3-enable-context-isolation-for-remote-content
* https://speakerdeck.com/masatokinugawa/electron-abusing-the-lack-of-context-isolation-curecon-en
* https://www.electronjs.org/docs/latest/breaking-changes