import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class SecureKeyboardEntryJSCheck {
  constructor() {
    this.id = 'SECUREKEYBOARDENTRY_JS_CHECK';
    this.title = "Secure Keyboard Entry Usage";
    this.description = `Review the use of setSecureKeyboardEntryEnabled. This app method is used to enable or disable the Secure Keyboard Entry for your application when a user needs to enter passwords and other sensitive information.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://www.electronjs.org/docs/api/app#appsetsecurekeyboardentryenabledenabled-macos";
  }

  match(astNode, astHelper){
    if (astNode.type !== 'CallExpression') return null;
    if (!(astNode.callee.property && (astNode.callee.property.name === "setSecureKeyboardEntryEnabled" || astNode.callee.property.name === "setSecureKeyboardEntryEnabled"))) return null;

    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: true }];
  }
}
