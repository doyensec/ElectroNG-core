## CSP_HTML_CHECK - CSP presence check

Electron apps, when possible, should implement a Content Security Policy (CSP) as an additional layer of protection against cross-site-scripting attacks and data injection attacks.
There are two ways to set a CSP in Electron either via the [`webRequest.onHeadersReceived`](https://github.com/electron/electron/blob/master/docs/api/web-request.md#webrequestonheadersreceivedfilter-listener) handler or directly in the markup using a `<meta>` tag.

This check determines if a CSP policy is set. If possible, you should check that all the whitelisted sources listed across all directives are considered to be safe.

***

### Risk
CSP allows the server serving content to restrict and control the resources Electron can load for that given web page. `https://example.com` should be allowed to load scripts from the origins defined while scripts from `https://evil.attacker.com` should not be allowed to run.

### Auditing
Check whether a CSP is defined and use the [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com) tool to review its directives.

### References
* https://github.com/electron/electron/blob/master/docs/tutorial/security.md#6-define-a-content-security-policy


