## EXPERIMENTAL_FEATURES_JS_CHECK - Do not use Chromium’s experimental features 

The `experimentalFeatures` and `experimentalCanvasFeatures` flags can be used to enable Chromium’s experimental features, which increase the overall attack surface for production applications. 
***

### Risk
Experimental features may introduce bugs and increase the application attack surface.

### Auditing
Search for `experimentalFeatures`, `experimentalCanvasFeatures` flags set to true within the webPreferences of BrowserWindow:

```js
mainWindow = new BrowserWindow({
    "webPreferences": {
        "experimentalCanvasFeatures": true
    }
});
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#9-do-not-enable-experimental-features