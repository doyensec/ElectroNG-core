## EXPERIMENTAL_FEATURES_HTML_CHECK - Do not use Chromium’s experimental features 

The `experimentalFeatures` and `experimentalCanvasFeatures` flags can be used to enable Chromium’s experimental features, which increase the overall attack surface for production applications. 
***

### Risk
Experimental features may introduce bugs and increase the application attack surface.

### Auditing
Search for `experimentalFeatures`, `experimentalCanvasFeatures` flags set to true within the webPreferences of webview tags:

```xml
<webview src="https://doyensec.com" webpreferences="experimentalCanvasFeatures=true"></webview>
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#9-do-not-enable-experimental-features