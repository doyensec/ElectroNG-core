## ELECTRON_VERSION_JSON_CHECK - Keep dependencies up-to-date  

Keep your application in sync with the latest Electron framework release.

When releasing your product, you’re also shipping a bundle composed of Electron, Chromium shared library and Node.js. Vulnerabilities affecting these components may impact the security of your application. By updating Electron to the latest version, you ensure that critical vulnerabilities (such as nodeIntegration bypasses) are already patched and cannot be exploited to abuse your application .

***

### Risk
Older versions of the Electron framework may contain vulnerabilities, including nodeIntegration bypasses.

### Auditing

Ensure that the Electron version bundled with your software is the latest stable release. 

### References
* https://electronjs.org/releases