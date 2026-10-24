import { severity, confidence } from '../../attributes';
import ReleasesFetcher from './ReleasesFetcher';
import { satisfies, major, minor } from 'semver';

export default class UnsupportedVersionGlobalCheck {

  constructor() {
    this.id = "UNSUPPORTED_VERSION_GLOBAL_CHECK";
    this.title = "Electron Release In Use Not Supported";
    this.description = "Check if the Electron version used by the application is currently supported";
    this.depends = ["ElectronVersionJSONCheck"];
    this.shortenedURL = "https://www.electronjs.org/docs/tutorial/support";
  }

  async perform(issues) {

    var versionCheckIssues = issues.filter(e => e.id === 'ELECTRON_VERSION_JSON_CHECK');

    if (versionCheckIssues.length > 0) {

      var fetcher = new ReleasesFetcher();
      await fetcher.updateReleasesList();

      var latest = await fetcher.getLatestReleaseNumber();
      var used = versionCheckIssues[0].properties.versionNumber;

      if ((major(latest) - major(used)) >= 3) {
            issues.push({ file: "N/A", location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: false });
            return issues;
          }
      else
            return issues;
    } else return issues;

  }

}