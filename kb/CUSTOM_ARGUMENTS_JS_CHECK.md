## CUSTOM_ARGUMENTS_JS_CHECK - Review the use of command line arguments 
With Electron, it is possible to programmatically insert command line arguments to modify the behavior of the framework foundation (LibChromiumcontent and Node.js) and Electron itself. For instance, setting the variable `--proxy-server` will force Chromium to use a specific proxy server, despite system settings. To debug JavaScript executed in the main process, Electron allows to attach an external debugger. This feature can be enabled using the  `--debug`  or  `--debug-brk`  command line switch.

Additionally, the application can implement custom command line arguments. 
This check will compare the custom command line arguments set using `appendArgument` or `appendSwitch` against a blacklist of dangerous arguments. The full blacklist is reported below:

|Argument|Description|
|---|---|
|--ignore-certificate-errors|Ignores certificate-related errors.|
|--ignore-certificate-errors-spki-list|A set of public key hashes for which to ignore certificate-related errors. If the certificate chain presented by the server does not validate, and one or more certificates have public key hashes that match a key from this list, the error is ignored. The switch value must a be a comma-separated list of Base64-encoded SHA-256 SPKI Fingerprints (RFC 7469, Section 2.4).|
|--ignore-urlfetcher-cert-requests|Causes net::URLFetchers to ignore requests for SSL client certificates, causing them to attempt an unauthenticated SSL/TLS session. This is intended for use when testing various service URLs (eg: kPromoServerURL, kSbURLPrefix, kSyncServiceURL, etc)|
|--disable-web-security|Don't enforce the same-origin policy. (Used by people testing their sites.) |
|--host-rules|A comma-separated list of rules that control how hostnames are mapped.|
|--host-resolver-rules|Like `--host-rules` but these rules only apply to the host resolver.|
|--auth-server-whitelist|A comma-separated list of servers for which integrated authentication is enabled.|
|--auth-negotiate-delegate-whitelist|A comma-separated list of servers for which delegation of user credentials is required. Without `*` prefix the url has to match exactly.|
|--js-flags|Specifies the flags passed to the Node JS engine. It has to be passed when starting Electron if you want to enable the flags in the main process.|
|--allow-file-access-from-files|By default, file:// URIs cannot read other file:// URIs. This is an override for developers who need the old behavior for testing.|
|--allow-no-sandbox-job|Enables the sandboxed processes to run without a job object assigned to them. This flag is required to allow Chrome to run in RemoteApps or Citrix. This flag can reduce the security of the sandboxed processes and allow them to do certain API calls like shut down Windows or access the clipboard.|
|--allow-running-insecure-content|By default, an https page cannot run JavaScript, CSS or plugins from http URLs. This provides an override to get the old insecure behavior.|
|--cipher-suite-blacklist|Comma-separated list of SSL cipher suites to disable.|
|--debug-packed-apps|Adds debugging entries such as Inspect Element to context menus of packed apps.|
|--disable-features|Lists separated by commas the name of features to disable. See Chromium's base::FeatureList::InitializeFromCommandLine for details|
|--disable-kill-after-bad-ipc|Don't kill a child process when it sends a bad IPC message. Apart from testing, it is a bad idea from a security perspective to enable this switch.|
|--disable-webrtc-encryption|Disables encryption of RTP Media for WebRTC. When Chrome embeds Content, it ignores this switch on its stable and beta channels|
|--disable-xss-auditor|Disables Blink's XSSAuditor. The XSSAuditor mitigates reflective XSS.|
|--enable-local-file-accesses|Enable file accesses.|
|--enable-nacl-debug|Enables debugging via RSP over a socket.|
|--remote-debugging-address|Use the given address instead of the default loopback for accepting remote debugging connections. Should be used together with --remote-debugging-port. Note that the remote debugging protocol does not perform any authentication, so exposing it too widely can be a security risk.|
|--remote-debugging-port|Enables remote debug over HTTP on the specified port|
|--inspect|Node's inspect flag|
|--inspect-brk|Node's inspect and break flag|
|--explicitly-allowed-ports|Explicitly allows additional ports, using a comma-separated list of port numbers. |
|--expose-internals-for-testing|Exposes the window.internals object to JavaScript for interactive development and debugging of layout tests that rely on it.|
|--gpu-launcher|Extra command line options for launching the GPU process (normally used for debugging). Use like renderer-cmd-prefix.|
|--nacl-dangerous-no-sandbox-nonsfi|Disable sandbox even for non SFI mode. This is particularly unsafe as non SFI NaCl heavily relies on the seccomp sandbox.|
|--nacl-gdb-script|GDB script to pass to the nacl-gdb debugger at startup. |
|--net-log-capture-mode|Sets the granularity of events to capture in the network log. The mode can be set to one of the following values: "Default" "IncludeCookiesAndCredentials" "IncludeSocketBytes" See the functions of the corresponding name in Chromium's net_log_capture_mode.h for a description of their meaning.|
|--no-sandbox|Disables the sandbox for all process types that are normally sandboxed. |
|--reduce-security-for-testing|Enables more web features over insecure connections. Designed to be used for testing purposes only. |
|--unsafely-treat-insecure-origin-as-secure|Treat given (insecure) origins as secure origins. Multiple origins can be supplied.|

***

### Risk
The use of additional command line arguments can increase the application attack surface, disable security features or influence the overall security posture.
For example, if Electron’s debugging is enabled, Electron will listen for V8 debugger protocol messages on the specified  port. An attacker could leverage the external debugger to subvert the application at runtime.

### Auditing
Review all occurrences of `appendArgument` and `appendSwitch`:
```js
const { app } = require('electron')
app.commandLine.appendArgument('debug')
app.commandLine.appendSwitch('proxy-server', '8080')
```

## References
* https://www.electronjs.org/docs/latest/api/command-line#commandlineappendargumentvalue
* https://www.electronjs.org/docs/latest/api/command-line#commandlineappendswitchswitch-value
* https://www.electronjs.org/docs/latest/api/command-line-switches
