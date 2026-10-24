## HTTP_RESOURCES_JS_CHECK - Do not allow insecure HTTP connections 
When using HTTP as the transport, security is provided by Transport Layer Security (TLS). TLS, and its predecessor SSL, are widely used on the Internet to authenticate a service to a client, and then to provide confidentiality to the channel. Transport security is a critical mechanism for every Electron application.

Directly fetching content using plain-text HTTP opens your application to Man-in-the-Middle attacks.

***

### Risk
Man-in-the-Middle attacks. If `nodeIntegration` is also enabled, an attacker can inject malicious JavaScript and compromise the user’s host.

### Auditing
Look for resources loaded using *http*, for example:

```js
const win = new BrowserWindow({...});
win.loadURL('http://example.com/');
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#1-only-load-secure-content