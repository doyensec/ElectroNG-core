## OPEN_EXTERNAL_JS_CHECK - Review the use of `openExternal` 
Shell’s `openExternal()` allows opening a given external protocol URI with the desktop’s native utilities. For instance, on macOS, this function is similar to the `open` terminal command utility and will open the specific application based on the URI and filetype association. When `openExternal` is used with untrusted content, it can be leveraged to execute arbitrary commands, as demonstrated by the following example:
```js
const { shell } = require('electron')
shell.openExternal('file:///System/Applications/Calculator.app')
```

***

### Risk
Improper use of `openExternal` can be leveraged to compromise the user’s host. Electron’s Shell provides powerful primitives that must be used with caution.

### Auditing
Manually review all occurrences of `openExternal` to ensure that no user-supplied content can be injected without validation.

### References
* https://www.electronjs.org/docs/latest/api/shell#shellopenexternalurl-options
* https://speakerdeck.com/masatokinugawa/electron-abusing-the-lack-of-context-isolation-curecon-en?slide=39