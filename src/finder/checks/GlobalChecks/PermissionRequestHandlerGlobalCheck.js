import { severity, confidence } from '../../attributes';

export default class PermissionRequestHandlerGlobalCheck {

  constructor() {
    this.id = "PERMISSION_REQUEST_HANDLER_GLOBAL_CHECK";
    this.title = "Lack Of Permission Request Handlers";
    this.description = "Checks if permission request handlers are missing.";
    this.longDescription = { NONE_FOUND: "Missing PermissionRequestHandler to limit specific permissions (e.g. openExternal) in response to events from particular origins."};
    this.depends = ["PermissionRequestHandlerJSCheck"];
    this.shortenedURL = "https://git.io/JeuM0";
  }

  async perform(issues) {

    if (issues.length === 0) {
      return [{ file: "N/A", location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.longDescription.NONE_FOUND, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: false }];
    } else {
      issues.forEach(e => e.visibility.globalCheckDisabled = true)
      return issues;
    }
  }
}
