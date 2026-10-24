## ALLOWPOPUPS_HTML_CHECK - Do not allow pop-ups in webview 
When the `allowpopups` attribute is present, the guest page will be allowed to open new windows. Pop-ups are disabled by default.

***

### Risk
Disabling pop-ups reduces the risk of UI-redressing attacks and limits the exploitability of window abuses. Additionally, pop-ups are often used for intrusive advertising and persistency in JavaScript-based attacks.

### Auditing
Search for the specific `allowpopups` blinkfeatures attribute in `webview` tags:
```xml
<webview src="https://doyensec.com/" allowpopups></webview>
```

### References
* https://www.electronjs.org/docs/latest/tutorial/security#11-do-not-use-allowpopups-for-webviews
