# ElectroNG Core Library

> **This is the core engine of [ElectroNG](https://github.com/doyensec/ElectroNG), the desktop app for identifying misconfigurations and security anti-patterns in Electron-based applications.**
>
> ElectroNG-core can be used on its own as a library, but it is developed primarily to be paired with the ElectroNG desktop app. Its API and behavior follow the app's needs. If you are looking for a ready-to-use scanner, start with [ElectroNG](https://github.com/doyensec/ElectroNG).

## API Docs

- [API Docs](#api-docs)
  * [getProject](#getproject)
    + [Project](#project)
    + [Saving](#saving)
  * [initiateScan](#initiatescan)
    + [initiateScan events](#initiatescan-events)
    + [Supported options and defaults](#supported-options-and-defaults)
  * [Decorators Specs](#decorators-specs)
    + [WebPreferencesJSCheck properties](#webpreferencesjscheck-properties)
  * [Project File Structure](#project-file-structure)
  * [Ignoring Lines or Files](#ignoring-lines-or-files)

### getProject
Loads and returns a `Project` object. It's possible to provide either a string file path (`.eng`):
```js
import { getProject } from './core.js';
var proj = await getProject('/tmp/test-project-1621004713424.eng');
```
Or an array of pseudo-project objects to load, each specifying a `projectPath` property:
```js
var multipleProj = await getProject([
  {
    "name": "First Project Label",
    "projectPath": "/tmp/project.eng"
  },
  {
    "name": "Second Project Label",
    "projectPath": "/tmp/project2.eng",
  }
]);
```

#### Project
The above function will return a `Project` object that will contain several elements, most notably:

  * `generateReport`: `async ƒ _generateReport(scanId, options)` Generates the report for the passed `scanId` and `options`
  * `getDocsForIssue`: `async ƒ _getDocsForIssue(issue)` Retrieves the corresponding documentation (`kb/*.md`) for the passed `issue`
  * `getTopFiles`: `ƒ _getTopFiles(scanId)` Retrieves the top files for the given `scanId`. If called with no params it will return the top files for the whole project
  * `getTopIssues`: `ƒ _getTopIssues(scanId)` Retrieves the top issues for the given `scanId`. If called with no params it will return the top issues for the whole project
  * `index`: Contains several metadata details on the project:
```json
  // UUIDv4 for the project
  "id": "ceb3ca6f-8903-406a-8c7a-2f8984c871b7", 
  // Creation datetime
  "createdAt": "2021-05-14T15:05:14.134Z", 
   // Update datetime
  "updatedAt": "2021-05-14T15:26:57.481Z",
  // Last known input path
  "lastKnownLocation": "/tmp/electropositivity", 
   // Version of the project. For now on we'll start with `1`
  "formatVersion": 1,
   // Project label
  "label": "",
  // Name and version of the OS on which the project was created
  "systemInfo": {
      "os": {
        "name": "macOS",
        "version": "14.5"
      }
  },
  // ElectroNG-core version
  "createdWith": "1.0.0"
```
  * `scans`: `Array`, will contain an array of `Objects` representing each scan:
```json
  // UUIDv4 for the scan
  id: "777ece30-b4c8-11eb-b979-811022f237c2"
  // electron version detected or set by the user for the scan
  electronVersion: "4.0.7"
  // Creation datetime
  createdAt: {},
  // any errors encountered during the scan
  errors: [],
  // array of issues
  issues: [{}, {}]
  // options set for this scan (see `initiateScan()`)
  options: {},
  // version of the Electro-NG lib used
  scannerVersion: "1.0.0"
```

#### Saving
`Save()` the project to disk after some updates provided by the user

```js
  // Edit the severity for the first issue on the first scan
  proj.scans[0].issues[0].severity = severity.INFORMATIONAL;
  
  // Update the finding's notes and triage status
  proj.scans[0].issues[0].triaged = triage.INVALID;
  proj.scans[0].issues[0].notes = "The sink is protected by the DOMPurify (:240)";

  // Edit the project name for the project
  proj.index.label = "Test Name For Project!"

  // Save the project to disk after the above edits
  await proj.save();
```
### initiateScan

Runs a new scan with the provided options. The only mandatory option is `input`. In the following example a new scan will target the `/tmp/electropositivity/` directory with the set options, add the issues to a project at `/tmp/test-project.eng` (it will be created if it does not exist), and generate a PDF report with the results of the scan at `output`.
The function returns an [Rx Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html), pushing status updates and the issues found for every file, along with a final `Completed` update with the results.
```js
import { Observable } from 'rxjs';
import { initiateScan } from './core.js';

var scan = initiateScan({
  input: path.resolve("/tmp/electropositivity/"),
  projectFile: `/tmp/test-project.eng`,
  output:  `/tmp/test-report.pdf`,
  outputFileFormat: false,
  customScan: false,
  excludeFromScan: false,
  severitySet: "INFORMATIONAL",
  confidenceSet: "TENTATIVE",
  excludeList: "",
  parserPlugins: []
})

const subscription = scan.subscribe(
  (x) => console.log(x),
  err => console.error(err),
  () => console.log('completed')
);

```

#### initiateScan events
* `{ status: 'Loading target files' }`
* `{ status: 'Parsing target files' }`
* `{ status: 'Initializing global checks' }`
* `{ status: 'Initializing atomic checks' }`
* `{ status: 'Checking file', file: '/tmp/electropositivity/package.json', progress: '50.0' }`
* `{ status: 'New Issues Pushed', issues: [{}, {}, {}] }`
* `{ status: 'Checking file', file: '/tmp/electropositivity/index.js', progress: '90.0' }`
* `{ status: 'New Issues Pushed', issues: [{}, {}, {}, {}, {}] }`
* `{ status: 'Completed first batch of atomic checks' }`
* `{ status: 'Second pass of global checks' }`
* `{ status: 'Saving project file' }`
* `{ status: 'Generating report on file' }`
* `{ status: 'Completed', globalChecks: [{},{}], atomicChecks: [{},{},{},{}], errors: [], decorators: [ {}, {} ], issues: [ {}, {}, {}, {}, {}, {}, {} ] }` (see below for a better example)

The issues object pushed (`'New Issues Pushed'`) also includes the previous entries. The `progress` property is a percentage and is simply calculated as `#parsedFiles/#totalFiles`.

#### Supported options and defaults

```json
    // project file path [.eng]
    projectFile: false,
    // set a label/name for the project
    projectName: false,
    // save the results to a report. Contains the whole output file path
    output: false,
    // desired report format (csv, sarif, xlsx, pdf, html). If missing it will be inferred from the 'output' path
    outputFileFormat: false,
    // output options for the exported report
    outputOptions: { 
                      onlyShowRelativePath: true, // only provide relative paths
                      showTableSummary: true, // include the "project findings" table
                      showFindings: true, // include the kb details for every finding
                      showAuditorNotes: true, // include the auditor's notes
                      showPoCs: true // include PoC for vulnerabilities, if present
                   },
    // only run the specified checks list, passed as an array
    customScan: [],
    // skip the specified checks list, passed as an array
    excludeFromScan: [],
    // only return findings with the specified level of severity or above, default to lowest
    severitySet: "INFORMATIONAL",
    // only return findings with the specified level of confidence or above, default to lowest
    confidenceSet: "TENTATIVE",
    // run Electron upgrade checks, e.g. 7..8
    electronUpgrade: undefined,
    // assume the set Electron version, overriding the detected one, e.g. specify '7.0.0' to treat the input as it was using Electron 7
    electronVersionOverride: undefined,
    // pass a .gitignore-like exclusions list, comma separated. It is also possible to include an '.electrong' exclusions file inside the project's directory for this. Both lists will be merged.
    excludeList: undefined,
    // specify additional parser plugins to use separated by commas, e.g. [ "optionalChaining" ]
    parserPlugins: []
```
The updated list of defaults is always available at https://github.com/doyensec/ElectroNG-core/blob/main/src/core.js#L74-L109

The result contains the number of global and atomic checks, any errors encountered while parsing and an array of the issues found. A `decorator` key also points to an array of issues usesful to populate the scan dashboard (`ELECTRON_VERSION_JSON_CHECK`,`WEBPREFERENCES_JS_CHECK`):

```js
{
  status: 'Completed',
  globalChecks: [{name: "CSPGlobalCheck", id: "CSP_GLOBAL_CHECK"}, {name: "FileHandlerGlobalCheck", id: "FILE_HANDLER_GLOBAL_CHECK"}],
  atomicChecks: [{name: "WebSecurityHtmlCheck", id: "WEB_SECURITY_HTML_CHECK"}, {name: "WebGLJSCheck", id: "WEBGL_JS_CHECK"}],
  errors: [],
  decorators: [{ id: 'ELECTRON_VERSION_JSON_CHECK', ... }, { id: 'WEBPREFERENCES_JS_CHECK', ...} ],
  issues: [
    {
    	// uuid v4 associated with this very finding
	"uuid": "a7a41bfd-0cf4-4301-ba2c-8e0a9f1189bb",
        // last known location of the file presenting the issue
        "file": "/tmp/electropositivity/index.html",
	// relative path of the file presenting the issue (if the input path was `/tmp/electropositivity`)
	"relativeFilePath': 'index.html',
	// issue location (of the sample)
        "location": {
            "line": 0,
            "column": 0
        },
	// the unique internal ID of the issue
        "id": "AFFINITY_GLOBAL_CHECK",
	// Pretty title of the issue to show
        "title": "Affinity Property In Use",
	// Auditor's notes, now false but could be a string containing the comment typed by the auditor on the issue
	"notes": false,
	// If the issue has been triaged by the tester (see https://github.com/doyensec/ElectroNG-core/blob/main/src/finder/attributes.js#L16-L20 for possible values)
	"triaged": {
            "value": 0,
            "name": "UNTRIAGED"
        },
	// Pretty short description (to display as a tooltip or whatever)
        "description": "Two or more rendereres are running with the same affinity property. Manual review is required since we don't check for the webPreferences.",
	// URL with more info on the finding. Should be discarded as of now.
        "shortenedURL": "https://git.io/Jeu1z",
	// severity level for the finding
        "severity": {
            "value": 2,
            "name": "MEDIUM"
        },
	//confidence level for the finding
        "confidence": {
            "value": 2,
            "name": "CERTAIN"
        },
	// if the finding should be manually reviewed since we're not sure of it and we need a manual auditor to confirm it
        "manualReview": true,
        "fileAttr": {
	    // full content of the affected file, base64-encoded
            "base64": "PCFET0NUWVBFIGh0bWw+CjxodG1sPgo8aGVhZD4KCTx0aXRsZT5FbGVjdHJvcG9zaXRpdml0eTogQSBEYW1uIFZ1bG5lcmFibGUgRWxlY3Ryb24gQXBwPC90aXRsZT4KPC9oZWFkPgo8bWV0YSBodHRwLWVxdWl2PSJDb250ZW50LVNlY3VyaXR5LVBvbGljeSIgY29udGVudD0iZGVmYXVsdC1zcmMgJ3NlbGYnIj4KPGJvZHk+CjxoMT4KCVdlbGNvbWUgdG8gRWxlY3Ryb3Bvc2l0aXZpdHk6IEEgRGFtbiBWdWxuZXJhYmxlIEVsZWN0cm9uIEFwcCEKCTx3ZWJ2aWV3IHNyYz0iaHR0cDovL2RveWVuc2VjLmNvbS8iIG5vZGVpbnRlZ3JhdGlvbiB3ZWJwcmVmZXJlbmNlcz0iYWZmaW5pdHk9dGVzdDEsIGV4cGVyaW1lbnRhbEZlYXR1cmVzPXllcywgYWxsb3dSdW5uaW5nSW5zZWN1cmVDb250ZW50PXRydWUiIGFsbG93cG9wdXBzIGVuYWJsZWJsaW5rZmVhdHVyZXM9IkNTU1ZhcmlhYmxlcyI+PC93ZWJ2aWV3Pgo8L2gxPgo8L2JvZHk+CjwvaHRtbD4=",
	    // sha256 of the affected file, in case we want to compare it and see if it changed
            "sha2": "1fa5cdc1586a4f8726cd922a34e3aaf9060eb670866ca4a8fc748276cece8889"
        },
	// optional key that may include an object with additional properties on the finding
	"properties" : undefined,
	// constructor name of the check that generated the finding
	"constructorName": 'RemoteModuleJSCheck',
    },
    {
      //
    }
  ]
}
```

Note that some issues (such as the CVE/N-days vulnerabilities) could contain a `properties` object with more details on the issue. See how the internal [PDF export function](https://github.com/doyensec/ElectroNG-core/blob/main/src/util/file.js#L730-L753) uses this key for an idea on what to expect from the issues.

### Decorators Specs
#### WebPreferencesJSCheck properties
This decorator should be used to display the different settings detected for each `BrowserWindow`/`BrowserView`. The `windowName` is the name of the assigned variable, `windowType` is the kind, and the `webPreferences` array lists if a property `isSet`, it's value and its default value.
```json
{
    "windowName": "settingsWindow",
    "windowType": "BrowserWindow",
    "webPreferences": [
        {
            "isSet": false, 
            "allowRunningInsecureContent": false,
            "default": false
        },
        {
            "isSet": false,
            "contextIsolation": false,
            "default": false
        },
        {
            "isSet": false,
            "nodeIntegration": true,
            "default": true
        },
        ...
    ]
}
```


### Project File Structure

ENG (`.eng`) files are composed of multiple JSON files which are [tar](https://en.wikipedia.org/wiki/Tar_(computing))-ed. These files are packed and unpacked to a temporary directory when opened or updated. They are not gzipped at the present time (V1) since they are usually only a few hundreds KBs.

### Ignoring Lines or Files

ElectroNG lets you disable individual checks using `eng-disable` comments. For example, if you want a specific check to ignore a line of code, you can disable it as follows:

```js
const res = eval(safeVariable); /* eng-disable DANGEROUS_FUNCTIONS_JS_CHECK */
```

```html
<webview src="https://doyensec.com/" enableblinkfeatures="DangerousFeature"></webview> <!-- eng-disable BLINK_FEATURES_HTML_CHECK -->
```

Any `eng-disable` inline comment (`// eng-disable`, `/* eng-disable */`, `<!-- eng-disable -->`) will disable the specified check for just that line. It is also possible to provide multiple check names using both their snake case IDs (`DANGEROUS_FUNCTIONS_JS_CHECK`) or their construct names (`dangerousFunctionsJSCheck`):

```js
shell.openExternal(eval(safeVar)); /* eng-disable OPEN_EXTERNAL_JS_CHECK DANGEROUS_FUNCTIONS_JS_CHECK */
```

If you put an `eng-disable` directive before any code at the top of a `.js` or `.html` file, that will disable the passed checks for the *entire* file.

## License

This project is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
