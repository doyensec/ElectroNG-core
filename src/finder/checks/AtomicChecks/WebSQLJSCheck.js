import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class WebSQLJSCheck {
  constructor() {
    this.id = 'WEBSQL_JS_CHECK';
    this.title = "Enabled WebSQL Support";
    this.description = `Review the support for WebSQL in order to reduce the overall attack surface available from the renderer.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://github.com/electron/electron/pull/23311";
  }

  match(astNode, astHelper, scope, defaults) {
    let match = false;
    if (astNode.type !== 'NewExpression') return null;
    if ((astNode.callee.name === 'BrowserWindow' || astNode.callee.name === 'BrowserView'))
      match = true;

    if (astNode.callee.property && (astNode.callee.property.name === 'BrowserWindow' || astNode.callee.property.name === 'BrowserView'))
      match = true;

    if (!match)
      return null;
    
    let location = [];
    let explicitlyDisabled = false;

    if (astNode.arguments.length > 0) {

      var target = scope.resolveVarValue(astNode);

      const found_nodes = astHelper.findNodeByType(target,
        astHelper.PropertyName,
        astHelper.PropertyDepth,
        false,
        node => (node.key.value  === 'enableWebSQL' || node.key.name === 'enableWebSQL'));

      for (const node of found_nodes) {
        var settingsValue;

        if (node.value.type === "Identifier" && scope.getVarValue) {
          settingsValue = scope.getVarValue(node.value)
        } else {
          settingsValue = node.value.value;
        }

        if (settingsValue === true) {
          location.push({ line: node.value.loc.start.line, column: node.value.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
        } else if (settingsValue === false) {
          explicitlyDisabled = true;
        }
      }

      if (location.length == 0 && defaults.webgl && !explicitlyDisabled) {
        location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
      }
    }

    return location;
  }
}