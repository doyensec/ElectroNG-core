import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class SandboxJSCheck {
  constructor() {
    this.id = 'SANDBOX_JS_CHECK';
    this.title = "Sandbox Not Enabled";
    this.description = `Use sandbox for untrusted origins`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/JeuM2";
  }

  match(astNode, astHelper, scope){
    let match = false;
    if (astNode.type !== 'NewExpression') return null;
    if ((astNode.callee.name === 'BrowserWindow' || astNode.callee.name === 'BrowserView'))
      match = true;

    if (astNode.callee.property && (astNode.callee.property.name === 'BrowserWindow' || astNode.callee.property.name === 'BrowserView'))
      match = true;

    if (!match)
      return null;
    
    let wasFound = false;
    let loc = [];
    if (astNode.arguments.length > 0) {

      var target = scope.resolveVarValue(astNode);

      const found_nodes = astHelper.findNodeByType(target,
        astHelper.PropertyName,
        astHelper.PropertyDepth,
        false,
        node => (node.key.value === 'sandbox' || node.key.name === 'sandbox'));

      for (const node of found_nodes) {
        wasFound = true;
        var settingsValue;

        if (node.value.type === "Identifier" && scope.getVarValue) {
          settingsValue = scope.getVarValue(node.value)
        } else {
          settingsValue = node.value.value;
        }

        if (settingsValue === true) {
          continue;
        }
        loc.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: false });
      }
    }

    if (wasFound) {
      return loc;
    } else { // default is false
      return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: false }];
    }
  }
}
