import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class ContextIsolationJSCheck {
  constructor() {
    this.id = 'CONTEXT_ISOLATION_JS_CHECK';
    this.title = 'Review Context Isolation and related options';
    this.descriptions = { SIMPLE:`Review the use of the contextIsolation option`,
                          NOT_SET:`Enable the contextIsolation option.`,
                          WSEJ_SET:`The worldSafeExecuteJavaScript option is enabled, but contextIsolation wasn't. According to the Electron Docs, contextIsolation must also be enabled.`,
                          WSEJ_NOTSET:`The worldSafeExecuteJavaScript option is not enabled. The option is recommended since values returned from webFrame.executeJavaScript will be sanitized to ensure JS values can't unsafely cross between worlds when using contextIsolation.`,
                        };
    this.description = `Review the use of the contextIsolation option`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/Jeu1p";
  }

  match(astNode, astHelper, scope, defaults){
    let match = false;
    if (astNode.type !== 'NewExpression') return null;
    if ((astNode.callee.name === 'BrowserWindow' || astNode.callee.name === 'BrowserView'))
      match = true;

    if (astNode.callee.property && (astNode.callee.property.name === 'BrowserWindow' || astNode.callee.property.name === 'BrowserView'))
      match = true;

    if (!match)
      return null;
    
    let location = [];
    let contextIsolationValue = defaults.contextIsolation;
    // The option was removed in Electron 14; skip related findings when it is not in this version's defaults.
    const worldSafeExecuteJavaScriptIsAvailable = Object.prototype.hasOwnProperty.call(defaults, 'worldSafeExecuteJavaScript');
    let worldSafeExecuteJavaScriptValue = defaults.worldSafeExecuteJavaScript;

    if (astNode.arguments.length > 0) {

      var target = scope.resolveVarValue(astNode);

      // contextIsolation check
      const contextIsolation = astHelper.findNodeByType(target,
        astHelper.PropertyName,
        astHelper.PropertyDepth,
        false,
        node => (node.key.value === 'contextIsolation' || node.key.name === 'contextIsolation'));

      //At the time of writing this check, you always need contextIsolation
      if (contextIsolation.length > 0) {
        for (const node of contextIsolation) {
          // we "for" because in practice if there are two keys with the same name, 
          // the value of the last one wins, even if technically it is an invalid json.
          // Just to be on the safe side we issue a warning if any value is insecure

          if (node.value.type === "Identifier" && scope.getVarValue) {
            if (scope.getVarValue(node.value) !== null)
              contextIsolationValue = scope.getVarValue(node.value)
          } else {
            contextIsolationValue = node.value.value;
          }

          // at least one context isolation option was found to be disabled or malformed
          if (contextIsolationValue !== true) {
              location.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.descriptions.SIMPLE, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
          }
        }
      } else {
        // no contextIsolation was found!
        location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.descriptions.NOT_SET, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
      }

      // worldSafeExecuteJavaScript check — only while the option still existed (Electron < 14)
      if (worldSafeExecuteJavaScriptIsAvailable) {
        const worldSafeExecuteJavaScript = astHelper.findNodeByType(target,
          astHelper.PropertyName,
          astHelper.PropertyDepth,
          true,
          node => (node.key.value === 'worldSafeExecuteJavaScript' || node.key.name === 'worldSafeExecuteJavaScript'));

        if (worldSafeExecuteJavaScript.length > 0) {
          for (const node of worldSafeExecuteJavaScript) {
            // we "for" because in practice if there are two keys with the same name, 
            // the value of the last one wins, even if technically it is an invalid json.
            // Just to be on the safe side we issue a warning if any value is insecure
            if (node.value.type === "Identifier" && scope.getVarValue) {
              if (scope.getVarValue(node.value) !== null)
                worldSafeExecuteJavaScriptValue = scope.getVarValue(node.value);
            } else {
              worldSafeExecuteJavaScriptValue = node.value.value;
            }
          }
        }

        if (contextIsolationValue && !worldSafeExecuteJavaScriptValue) { //WSEJ_NOTSET
          location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.descriptions.WSEJ_NOTSET, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
        }
        if (!contextIsolationValue && worldSafeExecuteJavaScriptValue) { //WSEJ_SET
          location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.descriptions.WSEJ_SET, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
        }
      }

    } else {
      //No webpreferences, hence we look at the default:
      if (contextIsolationValue !== true)
        location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.descriptions.SIMPLE, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: false });
    }

    return location;
  }
}