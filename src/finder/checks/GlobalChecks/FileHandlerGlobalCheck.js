import { severity, confidence } from '../../attributes';

export default class FileHandlerGlobalCheck {

  constructor() {
    this.id = "FILE_HANDLER_GLOBAL_CHECK";
    this.title = "Lack Of File Handler Protections";
    this.description = "Looks for protection against file: protocol handler abuses. Review the use of interceptFileProtocol to intercept and set the file protocol's new handler.";
    this.depends = ["FileHandlerJSCheck"];
    this.shortenedURL = "https://www.electronjs.org/docs/api/protocol#protocolinterceptfileprotocolscheme-handler";
  }

  async perform(issues) {
    var permissionRequestHandlerIssues = issues.filter(e => e.id === 'FILE_HANDLER_JS_CHECK');
    var otherIssues = issues.filter(e => e.id !== 'FILE_HANDLER_JS_CHECK');

    if (permissionRequestHandlerIssues.length === 0) {
      otherIssues.push({ file: "N/A", location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: false });
    }

    return otherIssues;
  }
}
