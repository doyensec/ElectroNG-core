import { severity, confidence } from '../../attributes';

export default class CertificatePinningGlobalCheck {

  constructor() {
    this.id = "CERTIFICATE_PINNING_GLOBAL_CHECK";
    this.title = "Certificate Pinning Not Enforced";
    this.description = "Checks if no certificate pinning mechanisms are enforced by the application.";
    this.depends = ["CertificateVerifyProcJSCheck"];
    this.potentialIssues = ["PINNING_DETECTED", "BAD_CALLBACK", "BAD_CERT_RETURNED", "IMPORTED_CERT"];
    this.shortenedURL = "https://cheatsheetseries.owasp.org/cheatsheets/Pinning_Cheat_Sheet.html#electron";
  }

  async perform(issues) {
    var certificateIssues = issues.filter(e => e.id === 'CERTIFICATE_VERIFY_PROC_JS_CHECK' || e.id === 'CERTIFICATE_VERIFY_PROC_JS_CHECK');
    var otherIssues = issues.filter(e => e.id !== 'CERTIFICATE_VERIFY_PROC_JS_CHECK' && e.id !== 'CERTIFICATE_VERIFY_PROC_JS_CHECK');

    if (certificateIssues.length > 0) {
      var pinningPresenceIssue = certificateIssues.find(i => i.properties.type === this.potentialIssues[0]);
      if (!pinningPresenceIssue) { // this is to cover the case of importCertificate, where it may be that a CERTIFICATE_VERIFY_PROC_JS_CHECK finding is there but no setCertificateVerifyProc is used
        issues.push({ file: "N/A", location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
        return issues;
      } else { // we remove our finding, which is reporting the pinning presence, not discarding the other ones
        var residualIssues = certificateIssues.find(i => i.properties.type !== this.potentialIssues[0]);
        if (residualIssues)
          return [...otherIssues, ...residualIssues];
        else
          return otherIssues;
      }
    } else { // this should be the case if no pinning was found
      issues.push({ file: "N/A", location: {line: 0, column: 0}, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
      return issues;
    } 

  }
}
