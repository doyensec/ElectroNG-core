import * as attributes from '../../attributes';
import * as csp from '@doyensec/csp-evaluator';
import logger from 'winston';

export default class CSPGlobalCheck {

  constructor() {
    this.id = "CSP_GLOBAL_CHECK";
    this.title = "Insufficient CSP Policy";
    this.description = "Check if a CSP Policy is present and analyze the policy to check if it's secure",
    this.longDescription = {  NO_CSP: "No CSP has been detected in the target application.",
      MAYBE_WEAK_CSP: "One or more CSP directives detected seem to be vulnerable.",
      WEAK_CSP: "One or more CSP directives detected are vulnerable.",
      INVALID_CSP: "Failed to parse CSP, it may not be valid." };
    this.depends = ["CSPJSCheck", "CSPHTMLCheck"];
    this.shortenedURL = "https://git.io/JeuMe";
  }

  async perform(issues) {
    var returnableIssues = [];

    if (issues.length === 0) {
      // No CSP detected
      return [{ file: "N/A", location: {line: 0, column: 0}, title: this.title, id: this.id, description: this.longDescription.NO_CSP, shortenedURL: this.shortenedURL, severity: attributes.severity.MEDIUM, confidence: attributes.confidence.CERTAIN, manualReview: false }];
    } else {
      // There is a CSP set
      for (var cspIssue of issues) {
        // checks visibility before going forward
        if (Array.isArray(cspIssue.visibility.excludesGlobal) && !cspIssue.visibility.excludesGlobal.includes(this.id)) {
          var confidence = 0; 
          var findings;
          try {
            var parser = new csp.CspParser(cspIssue.properties.CSPstring);
            var evaluator = new csp.CspEvaluator(parser.csp, csp.Version.CSP3);
            findings = evaluator.evaluate();
          }
          catch (e) {
            returnableIssues.push({ file: cspIssue.file, location: cspIssue.location, title: this.title, id: this.id, description: this.longDescription.INVALID_CSP, shortenedURL: this.shortenedURL, severity: attributes.severity.LOW, confidence: attributes.confidence.TENTATIVE, sample: cspIssue.properties.CSPstring, manualReview: true });
            continue;
          }

          for (var finding of findings)
            if (finding.severity === csp.severities.HIGH || finding.severity === csp.severities.MEDIUM)
              confidence = 2;
            else if (finding.severity === csp.severities.HIGH_MAYBE || finding.severity === csp.severities.MEDIUM_MAYBE)
              if (confidence < 2) confidence = 1;

      if (confidence === 2) 
        returnableIssues.push({ file: cspIssue.file, location: cspIssue.location, title: this.title, id: this.id, description: this.longDescription.WEAK_CSP, shortenedURL: this.shortenedURL, severity: attributes.severity.LOW, confidence: attributes.confidence.CERTAIN, sample: cspIssue.properties.CSPstring, manualReview: false });
      if (confidence === 1)
        returnableIssues.push({ file: cspIssue.file, location: cspIssue.location, title: this.title, id: this.id, description: this.longDescription.MAYBE_WEAK_CSP, shortenedURL: this.shortenedURL, severity: attributes.severity.LOW, confidence: attributes.confidence.FIRM, sample: cspIssue.properties.CSPstring, manualReview: true });

      }
    }

    return returnableIssues;

    }
  }
}
