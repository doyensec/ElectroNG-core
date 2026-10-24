import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class AuxclickJSCheck {
  constructor() {
    this.id = 'AUXCLICK_JS_CHECK';
    this.title = 'Middle-click Not Disabled';
    this.description = `Limit navigation flows to untrusted origins. Middle-click may cause Electron to open a link within a new window`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/Jeu1K";
  }

  match(astNode, astHelper, scope) {
    let match = false;
    if (astNode.type !== 'NewExpression') return null;
    if ((astNode.callee.name === 'BrowserWindow' || astNode.callee.name === 'BrowserView'))
      match = true;

    if (astNode.callee.property && (astNode.callee.property.name === 'BrowserWindow' || astNode.callee.property.name === 'BrowserView'))
      match = true;

    if (!match)
      return null;

    let location = [];

    if (astNode.arguments.length > 0) {
      
      var target = scope.resolveVarValue(astNode);

      const found_nodes = astHelper.findNodeByType(target,
        astHelper.PropertyName,
        astHelper.PropertyDepth,
        false,
        node => (node.key.value === 'disableBlinkFeatures' || node.key.name === 'disableBlinkFeatures'));

      if (found_nodes.length > 0) {
        for (const node of found_nodes) {

        var settingsValue;

        if (node.value.type === "Identifier" && scope.getVarValue) {
          settingsValue = scope.getVarValue(node.value)
        } else {
          settingsValue = node.value.value;
        }

        if (settingsValue.indexOf("Auxclick") == -1) {
            location.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: false });
          }
        }
      }
      else {
        location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: false });
      }
      
    }

    return location;
  }
}