## UNSUPPORTED_VERSION_GLOBAL_CHECK - Unsupported Framework Version

An application built with an older version of Electron, Chromium, or Node.js is an easier target than an application that is using more recent versions of these components. Generally speaking, security issues and exploits for older versions of Chromium and Node.js are more widely available. When developing an Electron-based application, the latest stable version of Electron should always be used when possible, even whenever a new major version is released. 

It is important to note that only the latest three stable major versions are supported by the Electron team. For example, if the latest release is 6.1.x, then the 5.0.x as well as the 4.2.x series are supported. The Electorn development team only support the latest minor release for each stable release series. This means that in the case of a security fix 6.1.x will receive the fix, but they will not release a new version of 6.0.x.

Note that starting from September 2021 with Electron 15, the Electron team will temporarily support the latest four stable major versions. This extended support is intended to help Electron developers transition to the new eight week release cadence, and will continue until May 2022, with the release of Electron 19. At that time, the Electron team will drop support back to the latest three stable major versions.

Other than the standard framework bugs, Electron version bumps also include:

### Node.js Security Releases
The Electron framework could also feature several Node.js security fixes.

### Chromium’s Missing Security Updates
Because Electron applications are web applications running in the Chromium engine, they may be vulnerable through some of the same attack vectors as the Chromium browser. Because of this, Electron security releases currently follow the Chromium’s security releases. In case the app is not using the latest version of the framework, version bumps are currently missing from the Electron version used by the application, along with several security fixes that were cherry-picked and ported to Electron in more recent versions.

An attacker may abuse the aforementioned Electron’s or Chromium’s security issues to evade the isolation mitigations or achieve remote code execution. Note that an attacker should be able to run arbitrary Javascript code in the context of the Electron application in order to leverage the aforementioned vulnerabilities.

**In any case it is strongly suggested to update to the latest stable Electron release to benefit from the latest security fixes.**
