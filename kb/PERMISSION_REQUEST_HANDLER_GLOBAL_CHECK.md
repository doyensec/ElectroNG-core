## PERMISSION_REQUEST_HANDLER_GLOBAL_CHECK - Detect missing `setPermissionRequestHandler` for untrusted origins 

This GlobalCheck detects if the atomic PERMISSION_REQUEST_HANDLER_JS_CHECK is missing, meaning that the `setPermissionRequestHandler` is not set in the target application.
When loading remote untrusted content, it is recommended to enable `Session`’s permissions handler, which can be used to respond to permission requests. It is possible to access the  session of existing pages by using the  session  property of `WebContents`, or from the session module.

```js
win = new BrowserWindow()
win.loadURL('https://doyensec.com')
ses = win.webContents.session
console.log(ses.getUserAgent())
```

Using `setPermissionRequestHandler`, it is possible to write custom code to limit specific permissions (e.g. `openExternal`) in response to events from particular origins.
```js
ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (webContents.getURL() !== 'https: //doyensec.com' && permission === 'openExternal') {
        return callback(false)
    } else {
        return callback(true)
    }
})
```

The version 13 of Electron allows control of the following permissions:
* `clipboard`-read - Request access to read from the clipboard.
* `media` - Request access to media devices such as camera, microphone and speakers.
* `display-capture` - Request access to capture the screen.
* `mediaKeySystem` - Request access to DRM protected content.
* `geolocation` - Request access to user's current location.
* `notifications` - Request notification creation and the ability to display them in the user's system tray.
* `midi` - Request MIDI access in the webmidi API.
* `midiSysex` - Request the use of system exclusive messages in the webmidi API.
* `pointerLock` - Request to directly interpret mouse movements as an input method. Click here to know more.
* `fullscreen` - Request for the app to enter fullscreen mode.
* `openExternal` - Request to open links in external applications.
* `unknown` - An unrecognized permission request

Please note that Electron’s `Session` object is a powerful mechanism with access to many properties of the browser sessions, cookies, cache, proxy settings, etc. Use with caution! 

***

### Risk
This setting can be used to limit the exploitability of certain issues. Not enforcing custom checks for permission requests (e.g. media) leaves the Electron application under full control of the remote origin. For instance, a Cross-Site Scripting vulnerability can be used to access the browser media system and silently record audio/video. While browsers have implemented notification to inform the user that a remote site is capturing the webcam stream, Electron does not display any notification.

### Auditing
Review all occurrences of `setPermissionRequestHandler`. If used, manually evaluate the implementation and security of the custom callbacks. If not used, the application does not limit session permissions at all, thus the configuration is open to abuses.

### References
* https://www.electronjs.org/docs/api/session#sessetpermissionrequesthandlerhandler
