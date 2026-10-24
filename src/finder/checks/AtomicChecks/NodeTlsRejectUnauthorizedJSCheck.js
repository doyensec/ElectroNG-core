import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class NodeTlsRejectUnauthorizedJSCheck {
  constructor() {
    this.id = 'NODE_TLS_REJECT_UNAUTHORIZED_JS_CHECK';
    this.title = "Certificate Verification Explicitly Disabled";
    this.description = `Review the use of the NODE_TLS_REJECT_UNAUTHORIZED flag. This option makes TLS, and HTTPS by extension, insecure.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://nodejs.org/api/cli.html#cli_node_tls_reject_unauthorized_value";
  }

  match(astNode, astHelper, scope) {

    if (astNode.type !== 'AssignmentExpression') return null;

    if (astNode.left.property && astNode.left.property.name && astNode.left.property.name === "NODE_TLS_REJECT_UNAUTHORIZED") {
        if (astNode.right.value == "0")
            return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.CERTAIN, manualReview: false }];
        else if (astNode.right.type === "Identifier") { // check if it's a variable
            var target = scope.getVarValue(astNode.right);
            if (target == "0")
                return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.CERTAIN, manualReview: false }];
            else if (target == null) // couldn't resolve
                return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.TENTATIVE, manualReview: true }];
        }
    } else
        return null;

  }

}