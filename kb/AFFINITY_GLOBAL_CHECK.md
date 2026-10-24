## AFFINITY_GLOBAL_CHECK - Review the use of the `affinity` property 
When specified, renderers with the same affinity will run in the same renderer process. 

Note that due to reusing the renderer process, certain `webPreferences` properties will also be shared between the web pages even when their values are different. This can lead to unexpected security configuration overrides. 
***

### Risk
Improper use of `affinity` property can cause the unwanted share of `webPreferences` options.

### Auditing
It is suggested to use exact same `webPreferences` for web pages with the same affinity. Look for all occurrences of the `affinity` attribute and compare their values:

#### HTML
```html
<webview src="https://doyensec.com" webpreferences="affinity=secPrefs"></webview>
```

#### JS
```js
firstWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      affinity: "secPrefs"
    }
  })

  secondWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      affinity: "secPrefs"
    }
  })
```

### References
* https://www.electronjs.org/docs/latest/api/browser-window#class-browserwindow