## PROTOCOL_HANDLER_JS_CHECK - Review the use of custom protocol handlers 

Electron allows to define custom protocol handlers so that the application can use deep linking to exercise specific features. Since external protocol handlers can be triggered by arbitrary origins, it is important to evaluate how they are implemented and whether user-supplied parameters can lead to security vulnerabilities (e.g. injection flaws). 

***

### Risk
The use of custom protocol handlers opens the application to vulnerabilities triggered by users clicking on custom links or arbitrary origins forcing the navigation to crafted links.

### Auditing
To register a custom protocol handler, it is necessary to use one of the following functions:

* `setAsDefaultProtocolClient`
* `registerSchemesAsPrivileged`
* `registerServiceWorkerSchemes`
* `registerFileProtocol`
* `registerHttpProtocol`
* `registerStringProtocol`
* `registerBufferProtocol`
* `registerStreamProtocol`

Our check searches for those occurrences. Users are required to manually review the implementation of each of them.

### References
* https://www.electronjs.org/docs/api/app#appsetasdefaultprotocolclientprotocol-path-args
* https://www.electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
* https://www.electronjs.org/docs/api/protocol#protocolregisterstringprotocolscheme-handler
* https://www.electronjs.org/docs/api/protocol#protocolregisterbufferprotocolscheme-handler
* https://www.electronjs.org/docs/api/protocol#protocolregisterstringprotocolscheme-handler
* https://www.electronjs.org/docs/api/protocol#protocolregisterhttpprotocolscheme-handler
* https://www.electronjs.org/docs/api/protocol#protocolregisterstreamprotocolscheme-handler