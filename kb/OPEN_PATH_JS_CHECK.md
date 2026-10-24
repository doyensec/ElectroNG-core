## OPEN_PATH_JS_CHECK - Review the use of `openPath` and `openItem`
Shell’s `openPath` allows opening a given file with the desktop’s native utilities. Starting from Electron v9.0.0, `shell.openItem` was renamed to `shell.openPath` and made asynchronous, returning a Promise. The Promise contains information reflecting the success of the operation.

Just like `openExternal`, if it is used with untrusted content, it can be leveraged to execute arbitrary commands, as demonstrated by the following example:
```js
const shell = require("electron").shell;
const open = shell.openPath || shell.openItem;
open("/System/Applications/Calculator.app");
```

***

### Risk
Improper use of `openPath` or `openItem` can be leveraged to compromise the user’s host. Electron’s Shell provides powerful primitives that must be used with caution.

### Auditing
Manually review all occurrences of `openPath` or `openItem` to ensure that no user-supplied content can be injected without validation.

### References
* https://www.electronjs.org/docs/latest/api/shell#shellopenpathpath