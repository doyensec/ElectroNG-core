import { severity, confidence } from '../../attributes';

export default class SecureKeyboardEntryGlobalCheck {

  constructor() {
    this.id = "SECUREKEYBOARDENTRY_GLOBAL_CHECK";
    this.title = "Lack Of Secure Keyboard Entry Protections";
    this.description = "Review the use of setSecureKeyboardEntryEnabled. This app method is used to enable or disable the Secure Keyboard Entry for your application when a user needs to enter passwords and other sensitive information.";
    this.depends = ["SecureKeyboardEntryJSCheck"];
    this.shortenedURL = "https://www.electronjs.org/docs/api/app#appsetsecurekeyboardentryenabledenabled-macos";
  }

  async perform(issues) {
    var permissionRequestHandlerIssues = issues.filter(e => e.id === 'SECUREKEYBOARDENTRY_JS_CHECK');
    var otherIssues = issues.filter(e => e.id !== 'SECUREKEYBOARDENTRY_JS_CHECK');

    if (permissionRequestHandlerIssues.length === 0) {
      otherIssues.push({ file: "N/A", location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
    }

    return otherIssues;
  }
}
