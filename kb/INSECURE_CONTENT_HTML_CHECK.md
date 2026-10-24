## INSECURE_CONTENT_HTML_CHECK - Do not allow insecure HTTP connections 
When using HTTP as the transport, security is provided by Transport Layer Security  (TLS). TLS, and its predecessor SSL, are widely used on the Internet to authenticate a service to a client, and then to provide confidentiality to the channel. 

Mixed content occurs when the initial HTML page is loaded over a secure HTTPS connection, but other resources (such as images, videos, stylesheets, scripts) are loaded over an insecure HTTP connection.
***

### Risk
HTTP, Mixed Content and TLS validation opt-out should not be used, as it makes possible to sniff and tamper the user’s traffic.
If `nodeIntegration` is also enabled, an attacker can inject malicious JavaScript and compromise the user’s host.

### Auditing
Search for `allowRunningInsecureContent` set to true/1 within the `webPreferences` attribute in the `webview` tag:

```xml
<webview src= "https://doyensec.com" webPreferences="allowRunningInsecureContent=true"></webview>
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#8-do-not-enable-allowrunninginsecurecontent 