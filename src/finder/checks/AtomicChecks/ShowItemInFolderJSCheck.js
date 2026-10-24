import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class ShowItemInFolderJSCheck {
  constructor() {
    this.id = 'SHOWITEMINFOLDER_JS_CHECK';
    this.title = "ShowItemInFolder In Use";
    this.description = `Review the use of showItemInFolder`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://www.electronjs.org/docs/api/shell#shellshowiteminfolderfullpath";
  }

  match(astNode, astHelper){
    if (astNode.type !== 'CallExpression') return null;
    if (!(astNode.callee.property && astNode.callee.property.name === "showItemInFolder")) return null;
    if (astNode.arguments[0].type === astHelper.StringLiteral) return null; // constant, not user supplied

    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true }];
  }
}
