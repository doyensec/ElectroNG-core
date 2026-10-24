## DANGEROUS_FUNCTIONS_JS_CHECK - Do not use dangerous functions with user-supplied data

`insertCSS`, `executeJavaScript` functions allow to inject respectively CSS and JavaScript from the main process to the renderer process. Also `eval`, `Function`, `setTimeout`, `setInterval` and `setImmediate` allow JavaScript execution in the context of a BrowserWindowProxy. If the arguments are user-supplied, they can be leveraged to execute arbitrary content and modify the application behavior. This check detects the use of dangerous functions with dynamic arguments, and delegates the review to the user.

***

### Risk
In a vulnerable application, a remote page could leverage these functions to subvert the flow of the application by injecting malicious CSS or JavaScript.

### Auditing
Search for occurrences of `insertCSS`, `executeJavaScript`, `eval`, `Function`, `setTimeout`, `setInterval` and `setImmediate` with user-supplied input in both `BrowserWindow`, webview tag and all other JavaScript resources.

### References
* https://www.electronjs.org/docs/latest/api/browser-window-proxy#winevalcode
* https://www.electronjs.org/docs/latest/api/web-contents#contentsinsertcsscss-options
* https://www.electronjs.org/docs/latest/api/web-contents#contentsexecutejavascriptcode-usergesture