import { severity, confidence } from '../../attributes';
import { LambdaChecks } from '../../';
import fs from 'fs';
import path from 'path';

export default class PreloadGlobalCheck {

  constructor() {
    this.id = "PRELOAD_GLOBAL_CHECK";
    this.title = "Preloads In Use";
    this.description = "Gathers the preloads in use by the application for further inspection";
    this.longDescription = { INSECURE_PRELOAD_FOUND: "One or more rendereres are running with preloaded modules that could be abused.",
                         PRELOAD_FOUND: "One or more rendereres are running with some preloaded content."
                       };
    this.depends = ["PreloadJSCheck"];
    // this.decorator = true;
    this.shortenedURL = "https://blog.doyensec.com/2019/04/03/subverting-electron-apps-via-insecure-preload.html";
  }

  async perform(issues) {
    var preloadIssues = issues.filter(e => e.id === 'PRELOAD_JS_CHECK' || e.id === 'PRELOAD_HTML_CHECK');
    var otherIssues = issues.filter(e => e.id !== 'PRELOAD_JS_CHECK' && e.id !== 'PRELOAD_HTML_CHECK');
    if (preloadIssues.length > 0) {

      const preloadFilePaths = preloadIssues.map((issue) => {
        if (issue.properties !== undefined) {
          issue.properties.baseRequirePath = issue.file;
          return issue.properties;
        }
        else {
          return undefined
        }
      })

      for (var preload of preloadFilePaths) {
        
        if (typeof preload === "undefined") {
          otherIssues.push({ file: preloadIssues[0].file, location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.longDescription.PRELOAD_FOUND, properties: { "preloads": preloads }, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: true });
        } else {
        var preloads = await this.checkPreloads(preload);
        if (preloads.length > 0) // preloads exports found
          otherIssues.push({ file: preloadIssues[0].file, location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.longDescription.INSECURE_PRELOAD_FOUND, properties: { "preloads": preloads }, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: true });
        else //preloads file found but nothing was exported in it? let's report it for manual review
          otherIssues.push({ file: preloadIssues[0].file, location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.longDescription.PRELOAD_FOUND, properties: { "preloads": preloads }, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: true });
        }
      }

    }

    return otherIssues;
  }

  async checkPreloads(preloadPath) {
    if (preloadPath.baseRequirePath && preloadPath.preloadFilePath) {
      var preloadLambdaCheck = new LambdaChecks("PreloadLambdaCheck");
      var fullPath = path.resolve(path.dirname(preloadPath.baseRequirePath), preloadPath.preloadFilePath);
      var res = await preloadLambdaCheck.getResults(fullPath);
      return res;
    } else return [];
  }
}