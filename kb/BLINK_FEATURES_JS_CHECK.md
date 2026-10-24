## BLINK_FEATURES_JS_CHECK - Do not use Chromium’s experimental features 

The `blinkFeatures` / `enableBlinkFeatures` flag can be used to enable selectively Blink (Chromium web browser engine) features, which increases the overall attack surface for production applications.
***

### Risk
Experimental features may introduce bugs and increase the attack surface of the application.

### Auditing
Search for `blinkFeatures` / `enableBlinkFeatures` flags set to true within the `webPreferences` of `BrowserWindow`:

```js
mainWindow = new BrowserWindow({
  "webPreferences": {
    "enableBlinkFeatures": "CSSVariables"
  }
});
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#10-do-not-use-enableblinkfeatures