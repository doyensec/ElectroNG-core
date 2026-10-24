import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class OpenPathJSCheck {
  constructor() {
    this.id = 'OPEN_PATH_JS_CHECK';
    this.title = "openPath/openItem Usage";
    this.description = `Review the use of openPath / openItem. These methods can open the given file in the desktop's default manner.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://www.electronjs.org/docs/api/shell#shellopenpathpath";
  }

  match(astNode, astHelper){
    if (astNode.type !== 'CallExpression') return null;
    if (!(astNode.callee.property && (astNode.callee.property.name === "openPath" || astNode.callee.property.name === "openItem"))) return null; //openItem was replaced by openPath in Electron v9 (end of 2019)
    if (astNode.arguments[0].type === astHelper.StringLiteral) return null; // constant, not user supplied

    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true }];
  }
}
