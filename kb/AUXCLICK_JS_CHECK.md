## AUXCLICK_JS_CHECK - Limit navigation flows to untrusted origins 
The creation of a new browser window or the navigation to untrusted origins may lead to severe vulnerabilities. Additionally, middle-click causes Electron to open a link within a new window. Under certain circumstances, this can be leveraged to execute arbitrary JavaScript in the context of a new window. 

***

### Risk
Navigation to untrusted origins can facilitate attacks, thus it is recommended to limit the ability of a `BrowserWindow` and webview guest page to initiate new navigation flows. Middle-click events can be leveraged to subvert the flow of the application. 


### Auditing
Creation of a new window or the navigation to a specific origin can be inspected and validated using callbacks for the _new-window_ and _willnavigate_ events. Your application can limit the navigation flows by implementing something like:

```js
win.webContents.on('will-navigate', (event, newURL) => {
    if (win.webContents.getURL() !== 'https://doyensec.com') {
        event.preventDefault();
    }
})
```

However, `libchromiumcontent` will trigger middle-click events as `auxclick` instead of `click`.
Your application has to explicitly disable this insecure behaviour using something like:

```js
mainWindow = new BrowserWindow({
    "webPreferences": {
        "disableBlinkFeatures ": "Auxclick"
    }
});
```

### References
* https://github.com/electron/electron/issues/10315
