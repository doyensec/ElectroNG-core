## HTTPResourcesAndNodeIntegrationGlobalCheck - Review the use of plain HTTP resources loaded in node-integrated contexts
This global check looks for content fetched over HTTP in containers having `nodeIntegration` enabled. 

Using plain-text HTTP opens your application to Man-in-the-Middle attacks and if `nodeIntegration` is enabled, exposes its users to Remote Code Execution scenarios. You can read more information about the risks associated with the vulnerability in the HTTP_RESOURCES_HTML_CHECK / HTTP_RESOURCES_JS_CHECK and NODE_INTEGRATION_HTML_CHECK / NODE_INTEGRATION_JS_CHECK checks' descriptions.

***

### Risk
Combined use of the `nodeIntegration` property with unencrypted content can expose users to remote code execution vulnerabilities.

### Auditing
Verification is suggested to determine whether the fetched resources can be abused to run arbitrary code or influence the application's flow.

