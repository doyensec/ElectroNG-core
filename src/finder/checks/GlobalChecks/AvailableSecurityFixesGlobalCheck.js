import { severity, confidence } from '../../attributes';
import ReleasesFetcher from './ReleasesFetcher';
import { satisfies, major, minor } from 'semver';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';


export default class AvailableSecurityFixesGlobalCheck {

  constructor() {
    this.id = "AVAILABLE_SECURITY_FIXES_GLOBAL_CHECK";
    this.title = "Security Fixes Available";
    this.description = "Check if there are security patches applied in between the Electron version used and the latest";
    this.longDescription = { SECURITY_ISSUES : "Check if there are security patches applied in between the Electron version used and the latest",
      OUTDATED_VERSION : "A new version of Electron is available" };
    this.depends = ["ElectronVersionJSONCheck"];
    this.shortenedURL = "https://git.io/Jeu1X";
    this.releasesFilePath = path.resolve(require('temp-dir'), 'electro-ng');
    this.releaseNoteSecurityFixRegex = [ /# Security/i, /\[security\]/i ];

  }

  async perform(issues) {

    var versionCheckIssues = issues.filter(e => e.id === 'ELECTRON_VERSION_JSON_CHECK');

    var releases;
    var latestRelease;
    var releasesFileName = fs.readdirSync(this.releasesFilePath).filter(fn => fn.startsWith('releases.'));

    if (!releasesFileName) {
      var fetcher = new ReleasesFetcher();
      await fetcher.updateReleasesList();
      releasesFileName = fs.readdirSync(this.releasesFilePath).filter(fn => fn.startsWith('releases.'));
    }

    if (versionCheckIssues.length > 0 && releasesFileName.length > 0) {

      var fetcher = new ReleasesFetcher();
      await fetcher.updateReleasesList();
      
      releasesFileName = fs.readdirSync(this.releasesFilePath).filter(fn => fn.startsWith('releases.'));
    
      var rawReleasesFile = fs.readFileSync(path.resolve(this.releasesFilePath, releasesFileName[0]));
      releases = JSON.parse(rawReleasesFile);
      latestRelease = releases[0].version;

      for (const issue of versionCheckIssues) {
        if (issue.properties.versionNumber !== latestRelease) {
          var confidenceIfSecurityFixAvailable = await this.checkSecurityFixes(issue.properties.versionNumber, releases);
          if (confidenceIfSecurityFixAvailable) {
            if (issue.manualReview) // found in devDependencies
              issues.push({ file: versionCheckIssues[0].file, location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.longDescription.SECURITY_ISSUES, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidenceIfSecurityFixAvailable, manualReview: issue.manualReview });
            else // found in dependencies
              issues.push({ file: versionCheckIssues[0].file, location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.longDescription.SECURITY_ISSUES, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidenceIfSecurityFixAvailable, manualReview: issue.manualReview });
          }
        }
      }
    }
    return issues; // we still return with everything including the dummy "version" finding, since it's used by other global checks. It will be an info finding in the end, or we can just discard it later
  }

  async checkSecurityFixes(version, releases) {
    const majorVersion = major(version);
    const minorVersion = minor(version);
    const family = `${majorVersion}.${minorVersion}.x`;

    var latestRelease = releases.filter(release => satisfies(release.version, family))[0];
    if(!latestRelease) {
      console.log(chalk.yellow(`Unknown Electron release "${family}", please check manually for available security fixes.`));
      return confidence.TENTATIVE;
    }

    const semverTarget = `>${version} <=${latestRelease.version}`;
    var followingReleases = releases.filter(release => satisfies(release.version, semverTarget));
    var securityFixes = false;
    for (let release of followingReleases) {
      for (let regex of this.releaseNoteSecurityFixRegex)
        if (regex.test(release.body))
          securityFixes = confidence.CERTAIN;
    }
    return securityFixes;
  }

}
