import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class CertificateVerifyProcJSCheck {
  constructor() {
    this.id = 'CERTIFICATE_VERIFY_PROC_JS_CHECK';
    this.title = 'Insufficient Certificate Pinning';
    this.description = `Do not allow insecure connections, by explicitly opting-out from TLS validation, not using Chromium's validatedCertificate, or importing untrusted certificates`;
    this.type = sourceTypes.JAVASCRIPT;
    this.potentialIssues = ["PINNING_DETECTED", "BAD_CALLBACK", "BAD_CERT_RETURNED", "IMPORTED_CERT"];
    this.shortenedURL = "https://git.io/Jeu1A";
  }

  match(astNode, astHelper){

    var findings = [];

    if (astNode.type !== 'CallExpression')
      return null;

    if (astNode.callee.property && astNode.callee.property.name === "setCertificateVerifyProc") 
      if (astNode.arguments && astNode.arguments[0] && astNode.arguments[0].type.match(/Function/)) {

      // PINNING_DETECTED: report the presence of some sort of pinning for the respective Global Check
      var preciseDescription = 'The application is enforcing certificate pinning through the use of setCertificateVerifyProc';
      findings.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: preciseDescription, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false, properties: {"type": this.potentialIssues[0] } });
      

      // BAD_CALLBACK: check for "explicitly opting-out from TLS validation" 
      var preciseDescription = 'Verify that the application does not explicitly opt-out from TLS validation';
      const cbVarName = astNode.arguments[0].params[1].name || "callback"; // usually "callback"
      var found_nodes = astHelper.findNodeByType(astNode, // we check if somewhere we have a callback(0) call
                                                  "CallExpression",
                                                  30,
                                                  false,
                                                  node => (node.callee.name === cbVarName && node.arguments[0].value == 0));
      if (found_nodes.length > 0) {
        findings.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: preciseDescription, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true, properties: {"type": this.potentialIssues[1] } });
      }

      // BAD_CERT_RETURNED: check for Chromium's validatedCertificate usage
      preciseDescription = 'Verify that the application is using Chromium\'s `validatedCertificate` instead of the request\'s `certificate`';
      const reqVarName = astNode.arguments[0].params[0].name || "request"; // usually "callback"
      var found_nodes = astHelper.findNodeByType(astNode, // we check if they are retrieving the value of validatedCertificate. If they are doing so, chances are that they are using it. If not, they probably don't even know that the API changed and we issue a finding
                                                  "VariableDeclaration", // var { hostname, certificate, validatedCertificate, verificationResult, errorCode } = request;
                                                  30,
                                                  false,
                                                  node => (node.declarations[0].init && 
                                                           node.declarations[0].init.name == reqVarName && 
                                                           node.declarations[0].id.properties.find(p => p.key.name === "validatedCertificate")));
      if (found_nodes.length == 0) {
        findings.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: preciseDescription, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true, properties: {"type": this.potentialIssues[2] } });
      }

    }

    // IMPORTED_CERT: check for untrusted certificates imports
    if (astNode.callee.property && astNode.callee.property.name === "importCertificate") {
      var preciseDescription = 'Verify custom TLS certificates imported into the platform certificate store';
      findings.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: preciseDescription, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true, properties: {"type": this.potentialIssues[3] } });
    }

    return findings;
  }
}
