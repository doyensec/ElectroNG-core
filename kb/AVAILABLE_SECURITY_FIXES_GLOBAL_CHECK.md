## AVAILABLE_SECURITY_FIXES_GLOBAL_CHECK - Detect if there are security patches available for your current Electron version

ElectroNG has a mechanism to automatically fetch the latest Electron releases along with their change logs from [electron/releases](https://github.com/electron/releases). The repository is managed by the original @electron-bot and is updated every ten minutes. A new commit is published if any of the following change:
* number of Electron releases on GitHub
* number of Electron releases on npm
* npm `electron@beta` version
* npm `electron@latest` version

The resulting `releases.<etag>.json` file is parsed by the `AVAILABLE_SECURITY_FIXES_GLOBAL_CHECK`, which determines whether the Electron version of the targeted application is missing the latest available security patches or if it can be regarded as safe.

In order to make this decision ElectroNG parses the changelog body of the interested versions, looking for the presence of `[security]` tags or **Security** sections.

Right now ElectroNG is using `ELECTRON_VERSION_JSON_CHECK` to infer the target's Electron version by parsing its `package.json` file.

***

### Risk
Not using the latest and safest version of Electron may expose the application to security risks.

### Auditing
Compare your Electron version with the latest Electron releases, looking for security patches.


### References
* https://github.com/electron/releases