## WEB_SECURITY_HTML_CHECK - Do not use `disablewebsecurity`

This flag gives access to the underline `disablewebsecurity` Chromium option. When this attribute is present, the guest page will have web security disabled. For instance, Same-Origin Policy (SOP) will not be enforced.

> Please note that the Same-Origin Policy is not strictly enforced by the current implementation of Electron, due to a design flaw. As a result, this option is practically irrelevant at the moment. 

***

### Risk
When enabled, SOP is not enforced and mixed content is allowed (e.g. https page using JavaScript, CSS from http origins).

### Auditing

In the `webview` tag, look for `disablewebsecurity` attribute:
```html
<webview src="https://doyensec.com/" disablewebsecurity></webview>
```

Additionally, search for the runtime flag `—disable-web-security` in the `package.json`, and within the application codebase.

### References 
* https://www.electronjs.org/docs/latest/tutorial/security#6-do-not-disable-websecurity
* https://www.electronjs.org/docs/latest/api/webview-tag#disablewebsecurity