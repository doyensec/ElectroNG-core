## LIMIT_NAVIGATION_JS_CHECK - Detects if `on()` for 'will-navigate' and 'new-window' events is used
Creation of a new window or the navigation to a specific origin can be inspected and validated using callbacks for the `new-window` and `will-navigate` events.

Electron applications can limit the navigation flows by implementing a similar code snippet:
``` Javascript
win.webContents.on('will-navigate', (event, newURL) => {
  if (win.webContents.getURL() !== 'https://doyensec.com' ) {
    event.preventDefault();
  }
})
```

***

### Risk
This setting can be used to limit the exploitability of certain issues. Not enforcing navigation limits leaves the Electron application under full control to remote origins in case of accidental navigation.

### Auditing
Check every callback of the `will-navigate` and the `new-windows` events. These callbacks should be reviewed thoroughly to exclude potential flaws in the origin's validation mechanism.


### References
* https://electronjs.org/docs/api/web-contents#event-will-navigate