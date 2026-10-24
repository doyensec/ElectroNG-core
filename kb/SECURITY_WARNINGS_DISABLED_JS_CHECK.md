## SECURITY_WARNINGS_DISABLED_JS_CHECK - Detects if Electron's security warnings have been disabled by the developers via JS

> From Electron 2.0 on, developers will see warnings and recommendations printed to the developer console. They only show up when the binary's name is Electron, indicating that a developer is currently looking at the console.

It is possible to force-enable or force-disable these warnings by setting `ELECTRON_DISABLE_SECURITY_WARNINGS` on either process.env or the window object:
* `process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;`
* `win.webContents["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;`
* `window.ELECTRON_DISABLE_SECURITY_WARNINGS = true;` as detailed in [electron/electron#11970](https://github.com/electron/electron/issues/11970) too.

Note that if you decide to avoid these warnings because - for example - you run ElectroNG for each build, you may filter this tool's finding by setting the desired output severity (e.g. `--severity=Low`).

***

### Risk
Disabling this warning may hide the presence of misconfigurations or insecure patterns to the developers.

### Auditing
Check if the flag is disabled in one of the aforementioned ways.


### References
* https://electronjs.org/docs/tutorial/security#electron-security-warnings