import { sourceTypes } from '../../../../parser/types';
import { severity, confidence } from '../../../attributes';

export default class BrowserWindowWebPreferences {
  constructor() {
    this.id = 'BROWSER_WINDOW_WEB_PREFERENCES_DEPRECATION';
    this.title = 'New webPreferences Option Defaults';
    this.description = '(ELECTRON 5) The BrowserWindow API\'s webPreferences option default values are deprecated in favor of the new defaults.';
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = 'https://git.io/Jvahw';
  }

  match(astNode, astHelper, scope) {
    if (astNode.type !== 'NewExpression') return null;
    if (!(astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') &&
        !(!astNode.callee.property || astNode.callee.property.name !== 'BrowserWindow' && astNode.callee.property.name !== 'BrowserView')) return null;
    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.TENTATIVE, manualReview: true }];
  }
}