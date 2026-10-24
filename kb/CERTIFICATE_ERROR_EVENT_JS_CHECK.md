## CERTIFICATE_ERROR_EVENT_JS_CHECK - Insecure TLS Validation

When using HTTP as the transport, then security is provided by Transport Layer Security  (TLS). TLS and its predecessor SSL are widely used on the Internet to authenticate a service to a client, and then to provide confidentiality to the channel. This check looks for a common mistake that leads to insecure TLS validation which happens when the app voluntary opts-out of TLS certificates validation.

***

### Risk
TLS validation opt-out should not be used because it makes possible to sniff and tamper the user’s traffic. If `nodeIntegration` is also enabled, an attacker can inject malicious JavaScript and can compromise the user’s host.

### Auditing
Verify that the application does not explicitly opt-out from TLS validation.

Look for occurrences of `certificate-error`:
```js
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => { //error in cert
    if (url === 'https://doyensec.com') {
        callback(true) //its okay, go ahead anyway
    } else {
        callback(false)
    }
})
```

### References
* https://en.wikipedia.org/wiki/HTTPS
* https://letsencrypt.org/how-it-works/