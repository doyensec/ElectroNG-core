import { Observable } from 'rxjs';
import crypto from 'crypto';
import zlib from 'zlib';
import * as fs from 'fs';
import { LoaderFile, LoaderAsar, LoaderDirectory } from './loader';
import { Parser } from './parser';
import { Finder, GlobalChecks, severity, confidence, triage } from './finder';
import { CHECKS } from './finder/checks/AtomicChecks';
import { GLOBAL_CHECKS } from './finder/checks/GlobalChecks';
import { sourceTypes } from './parser/types';
import { extension, input_exists, is_directory, writeIssues, getRelativePath, read_file } from './util';
import path from 'path';
import Project from './util/project';
import mdToHtml from './util/md2html';

//   ▄▄▄ ▄▄▌ ▄▄▄ .▄▄·▄▄▄▄▄▄▄          ▐ ▄ .▄▄ • 
//   ▀▄.▀██• ▀▄.▀▐█ ▌•██ ▀▄ █▪      •█▌▐ ▐█ ▀ 
//   ▐▀▀▪██▪ ▐▀▀▪██ ▄▄▐█.▐▀▀▄ ▄█▀▄  ▐█▐▐ ▄█ ▀█
//   ▐█▄▄▐█▌▐▐█▄▄▐███▌▐█▌▐█•█▐█▌.▐▌ ██▐█ ▐█▄▪
//     ▀▀▀.▀▀▀ ▀▀▀·▀▀▀ ▀▀▀.▀  ▀▀█▄▀▪▀▀ █ ▀▀▀▀ 
//     (c) 2022 https://doyensec.com/

// Loads and returns a Project object. It's possible to provide either a string file path (.eng) or
// an array of project objects specifying a `projectPath` property
export async function getProject(project) {
  if (typeof project == "string") {
      if (!input_exists(project))
        throw Error(`Project does not exist at the provided path: ${project}`);
      let stub = new Project(project);
      await stub.load()
      return stub;
  } else if (Array.isArray(project) && project.length != 0) {
    let projectsMeta = {};
    let workingProjects = project.filter(project => input_exists(project.projectPath));
    let brokenProjects = project.filter(project => !input_exists(project.projectPath));
    projectsMeta.errors = brokenProjects.map(project => project.projectPath);

    let projectsArray = workingProjects.map(project => new Project(project.projectPath));
    let validProject = []
    for (var stub of projectsArray) {
      // when a file is not a .eng project, the stub.load() method fails
      try {
        await stub.load();
        validProject.push(stub)
      } catch (e) {
        console.warn('Failed loading ' + stub.projectPath + " - " + e)
      }
    }
    projectsMeta.availableProjects = validProject;
    return projectsMeta;
  } else
    throw Error("Invalid project(s) objects provided, param must be either a string path or an array of projects to load")
}

// Loads and returns an updated list of available checks
export function getAvailableChecks() {
  var checks = [...Array.from(CHECKS), ...Array.from(GLOBAL_CHECKS)];
  return checks.map(check => {
    let cc = new check;
    return {
      id: cc.id,
      name: cc.constructor.name,
      title: cc.title,
      type: typeof cc.type !== "undefined" ?
                Object.keys(sourceTypes).find(key => sourceTypes[key] === cc.type)
                : "JS/HTML",
      description: cc.description
    }
  });
}


// Returns the default options to merge to the provided `options` object
export function getDefaultOptions() {
  return {
    // project file path [.eng]
    projectFile: false,
    // set a label/name for the project
    projectName: false,
    // save the results to a report. Contains the whole output file path
    output: false,
    // desired report format (csv, sarif, pdf, html). If missing it will be inferred from the 'output' path
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
  }
}

// Normalizes and checks the provided options
export async function checkOptions(options) {
    options = Object.assign({}, getDefaultOptions(), options);
    var err = false;

    if (!options.input || !input_exists(options.input)) 
      err = `Input path for the scan does not exist.`;
    else
      options.input = path.resolve(options.input);
   
    if (options.projectFile) {
      options.projectFile = path.resolve(options.projectFile);
      let projectFileExt = options.projectFile.split('.').pop().toLowerCase();
      if (projectFileExt !== 'eng')
        err = `Please specify a valid project file format extension (*.eng).`;
    }

    if (options.customScan === false)
      options.customScan = [];

    if (options.excludeFromScan === false)
      options.excludeFromScan = [];

    if (options.customScan.length != 0 && options.excludeFromScan.length != 0)
     err = `Use either 'options.customScan' (exclude XYZ checks) or 'options.excludeFromScan' (only perform XYZ checks) options, not both.`;

    if (options.customScan.length !== 0)
      options.customScan = options.customScan.map(check => check.trim().toLowerCase());
    

    if (options.excludeFromScan.length != 0) 
      options.excludeFromScan = options.excludeFromScan.map(check => check.trim().toLowerCase());
    

    if (options.parserPlugins.length != 0) 
      options.parserPlugins = options.parserPlugins.map(p => p.trim());
    

    if (options.output && !options.outputFileFormat) {
      options.outputFileFormat = options.output.split('.').pop().toLowerCase();
      if (options.outputFileFormat !== 'csv' &&
          options.outputFileFormat !== 'sarif' &&
          options.outputFileFormat !== 'pdf' &&
          options.outputFileFormat !== 'xlsx' &&
          options.outputFileFormat !== 'html') 
        err = 'Please specify an output file format extension (csv, sarif, xlsx, pdf, html)';
    }

    if (options.severitySet) {
      if (!severity.hasOwnProperty(options.severitySet.toUpperCase())) {
        err = 'This severity level does not exist!';
      } else options.severitySet = severity[options.severitySet.toUpperCase()];
    } else options.severitySet = severity["INFORMATIONAL"]; // default to lowest

    if (options.confidenceSet) {
      if (!confidence.hasOwnProperty(options.confidenceSet.toUpperCase())) {
        err = 'This confidence level does not exist!';
      } else options.confidenceSet = confidence[options.confidenceSet.toUpperCase()];
    } else options.confidenceSet = confidence["TENTATIVE"]; // default to lowest

    if (err) {
      throw new Error(err);
    } else {
      return options;
    }
}

// Start a new scan with the provided options and optionally saves it to the passed project path
export function initiateScan(options) {

  return new Observable(async (subscriber) => {
    // Save the starting time for this scan
    let startTime = new Date();

    // This basically replace the old index.js role
    try {
      options = await checkOptions(options);
    } catch (e) {
      subscriber.error(e.message)
    }
    // Load
    var loader;
    // Preserve the global options for this scan
    global.setOptions = options;

    // Create the temporary dir for electro-ng
    let tempDir = path.resolve(require('temp-dir'), 'electro-ng');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Results' object properties initialization
    let issues = [];
    let decorators = [];
    let errors = [];

    // Is the input a directory, an asar file, or a single file?
    if(is_directory(options.input)){
      loader = new LoaderDirectory(options.excludeList);
    } else {
      loader = (extension(options.input) === 'asar') ? new LoaderAsar() : new LoaderFile();
    }

    subscriber.next({ status: "Parsing target files", progress: '1.0'});
    // we try to load it
    await loader.load(options.input, options.excludeList);

    // we try to infer the installed electron version
    const electronVersion = options.electronVersionOverride || loader.electronVersion;
    if (!electronVersion)
      errors.push("Couldn't detect Electron version, assuming v0.1.0. Defaults have probably changed for your actual version, please check manually.");

    // Parser options initialization
    const parser = new Parser(false, true);
    options.parserPlugins.forEach(plugin => parser.addPlugin(plugin)) 

    subscriber.next({ status: "Initializing global checks", progress: '4.0'});
    // Global Checker initialization: throw the error when unrecognized checks are passed as arguments
    let globalChecker;
    try {
      globalChecker = new GlobalChecks(options.customScan, options.excludeFromScan, options.electronUpgrade);
    } catch (e) {
      subscriber.error(e.message)
    }

    // Custom/Exclusion Scans initialization
    if (options.customScan.length > 0) options.customScan = options.customScan.filter(r => !r.includes('globalcheck')).concat(globalChecker.dependencies);
    if (options.excludeFromScan.length > 0) options.excludeFromScan = options.excludeFromScan.filter(r => !r.includes('globalcheck'));

    subscriber.next({ status: "Initializing atomic checks", progress: '9.0'});
    // Finder initialization: throw the error when unrecognized checks are passed as arguments
    let finder; //  = await new Finder(options.customScan, options.excludeFromScan, options.electronUpgrade);
    try {
      finder = await new Finder(options.customScan, options.excludeFromScan, options.electronUpgrade);
    } catch (e) {
      subscriber.error(e.message)
    }

    const filenames = [...loader.list_files];

    try {
      // if (forCli) progress.start(filenames.length, 0);
      var total = filenames.length;
      var status = 0;

      for (const file of filenames) {
        status++;

        subscriber.next({ status: "Checking file", file: file, progress: (10 + (Math.round( (status/total) * 80))).toFixed(1) });

        try {
          const [type, data, content, warnings] = parser.parse(file, loader.load_buffer(file));
          if (data === null)
            continue;

          if (warnings !== undefined) {
            for (const warning of warnings) {
              errors.push({ file: file, message: warning.message, tolerable: true });
            }
          }

          const result = await finder.find(file, data, type, content, null, electronVersion);
          
          issues.push(...result);

          subscriber.next({ status: "New Issues Pushed", issues: issues.filter(i => !i.isDecorator), progress: (10 + (Math.round( (status/total) * 80))).toFixed(1)});
        } catch (error) {
          errors.push({ file: file, message: error.message, tolerable: false });
        }
      }

      subscriber.next({ status: "Completed first batch of atomic checks", progress: '91.0'});
    } catch (error) {
      errors.push({ message: error.message, tolerable: false });
    }


    subscriber.next({ status: "Second pass of global checks", progress: '93.0'});

    // Second pass of checks (in "GlobalChecks")
    // Now that we have all the "naive" findings we may analyze them further to sort out false negatives
    // and false positives before presenting them in the final report (e.g. CSP)
    issues = await globalChecker.getResults(issues, options.output);

    // Adjust visibility
    issues = issues.filter(i => !i.hasOwnProperty('visibility') || (!i.visibility.inlineDisabled && !i.visibility.globalCheckDisabled));

    // Adjust according to severity / confidence
    issues = issues.filter(i => i.severity.value >= options.severitySet.value && i.confidence.value >= options.confidenceSet.value);

    // add relative path if possible
    issues.forEach(function(issue, i, issues) {
      issues[i].relativeFilePath = getRelativePath(options.input, issue.file);
    });

    // provide some default attributes and some useful file details other than the path and the sample, such as its content & sha2
    issues.forEach(function(issue, i, issues) {
      // property containing the auditor's notes 
      issues[i].notes = false;
      // property indicating the triage status
      issues[i].triaged = triage.UNTRIAGED;

      if (issue.file !== "N/A") {
          let fileContent = read_file(issue.file);
          issues[i].fileAttr = {};
          issues[i].fileAttr.file = issues[i].file; // reflection of issue.file
          issues[i].fileAttr.content = fileContent;
          issues[i].fileAttr.sha2 = crypto.createHash('sha256').update(fileContent).digest('hex');
        }
    });

    globalChecker._enabled_checks = globalChecker._enabled_checks.map(check => {let obj = {}; obj.name = check.name; obj.id = new check().id; return obj;});
    finder._enabled_checks = finder._enabled_checks.map(check => {let obj = {}; obj.name = check.name; obj.id = new check().id; return obj;});

    // Save the ending time for this scan
    let endTime = new Date();

    // Decorators are particular finder results that will be used to provide details on the project/scan in the UI
    decorators = issues.filter(issue => issue.isDecorator);
    issues = issues.filter(issue => !issue.isDecorator);

    if (options.projectFile) {
      subscriber.next({ status: "Saving project file", progress: '95.0'});
      var project = new Project(options.projectFile);
      //project.label = options.projectName;
      await project.add({
        issues: issues,
        decorators: decorators,
        options: options,
        globalChecks: globalChecker._enabled_checks,
        atomicChecks: finder._enabled_checks,
        errors: errors,
        electronVersion: electronVersion,
        scannerVersion: require('../package.json').version,
        startTime: startTime,
        endTime: endTime
      }).catch(e => {
        // TODO: notify to frontend.
        console.log('Catched error. Notify to frontend')
        console.warn(e)
      })
    }

    if (options.output) {
      subscriber.next({ status: "Generating report on file", progress: '98.0' });
      await writeIssues(options.input, options.outputOptions, options.output, issues, options.outputFileFormat);
    }

    subscriber.next({
      status: "Completed",
      globalChecks: globalChecker._enabled_checks,
      atomicChecks: finder._enabled_checks,
      errors,
      issues,
      decorators,
      startTime,
      endTime,
      progress: '100.0'
     });

    setTimeout(() => {
      subscriber.complete();
    }, 1000);
     
  });

}
