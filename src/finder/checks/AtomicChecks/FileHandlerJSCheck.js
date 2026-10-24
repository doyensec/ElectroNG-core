import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class FileHandlerJSCheck {
  constructor() {
    this.id = 'FILE_HANDLER_JS_CHECK';
    this.title = "Lack Of File Protocol Handler Interception";
    this.description = `Review the use of interceptFileProtocol to intercept and set the file protocol's new handler.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://www.electronjs.org/docs/api/protocol#protocolinterceptfileprotocolscheme-handler";
  }

  match(astNode, astHelper){
    if (astNode.type !== 'CallExpression') return null;
    if (!(astNode.callee.property && astNode.callee.property.name === "interceptFileProtocol")) return null; 
    if (!(astNode.arguments[0].type === astHelper.StringLiteral && astNode.arguments[0].value === "file")) return null; 

    return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false }];
  }
}
