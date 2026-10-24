## CERTIFICATE_VERIFY_PROC_JS_CHECK - Insecure TLS Validation

When using HTTP as the transport, security is provided by Transport Layer Security  (TLS). TLS, and its predecessor SSL, are widely used on the Internet to authenticate a service to a client, and then to provide confidentiality to the channel. This check looks for a common mistake that lead to insecure TLS validation which happens when the app voluntary opts-out of TLS certificates validation, or import untrusted certificates.

***

### Risk
TLS validation opt-out should not be used, as it makes possible to sniff and tamper the user’s traffic.
If `nodeIntegration` is also enabled, an attacker can inject malicious JavaScript and compromise the user’s host.

### Auditing
Verify that the application does not explicitly opt-out from TLS validation.

Look for occurrences of `setCertificateVerifyProc`:

```js
win.webContents.session.setCertificateVerifyProc((request, callback) => {
    const { hostname } = request;
    if (hostname === 'doyensec.com') {
        callback(0) //success and disables certificate verification
    }
    else {
        callback(-3) //use the verification result from chromium
    }
})
```
Or `importCertificate`:

```js
import { app } from "electron";

let options, callback;
app.importCertificate(options, callback);
```

### References
* https://en.wikipedia.org/wiki/HTTPS
* https://letsencrypt.org/how-it-works/