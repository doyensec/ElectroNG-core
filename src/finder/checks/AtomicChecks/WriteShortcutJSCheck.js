import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class WriteShortcutJSCheck {
  constructor() {
    this.id = 'WRITE_SHORTCUT_JS_CHECK';
    this.title = "WriteShortcutLink In Use";
    this.description = `Review the use of Shell.writeShortcutLink. The method can be used to create or update a shortcut link and potentially add command line parameters to it (through the ShortcutDetails object).`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://www.electronjs.org/docs/api/shell#shellwriteshortcutlinkshortcutpath-operation-options-windows";
  }

  match(astNode, astHelper){
    if (astNode.type !== 'CallExpression') return null;
    if (!(astNode.callee.property && astNode.callee.property.name === "writeShortcutLink")) return null; 
    //if ((astNode.arguments[0].type !== astHelper.StringLiteral)) return null; // usually we have a `path` join, and it's not easy to determine what's the result of it. We report it for further inspection by the user.

    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true }];
  }
}
