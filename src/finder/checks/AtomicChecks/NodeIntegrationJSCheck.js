import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class NodeIntegrationJSCheck {
  constructor() {
    this.id = 'NODE_INTEGRATION_JS_CHECK';
    this.title = "Node Integration Enabled For Potentially Untrusted Origins";
    this.description = `Disable the settings in case of code execution from untrusted origins.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/JeuMn";
    this.needsManualReview = false;
  }

  //nodeIntegration Boolean (optional) - Whether node integration is enabled. Default is true.
  //nodeIntegrationInWorker Boolean (optional) - Whether node integration is enabled in web workers. Default is false
  //nodeIntegrationInSubFrames Boolean (optional) - Whether node integration is enabled in in sub-frames such as iframes. Default is false

  match(astNode, astHelper, scope, defaults){
    let match = false;
    if (astNode.type !== 'NewExpression') return null;
    if ((astNode.callee.name === 'BrowserWindow' || astNode.callee.name === 'BrowserView'))
      match = true;

    if (astNode.callee.property && (astNode.callee.property.name === 'BrowserWindow' || astNode.callee.property.name === 'BrowserView'))
      match = true;

    if (!match)
      return null;
    
    let locations = [];

    let sandboxFound = false;

    let nodeIntegrationFoundDisabled = false;
    let nodeIntegrationInWorkerFoundEnabled = false;
    let nodeIntegrationInSubFramesFoundEnabled = false;

    if (astNode.arguments.length > 0) {

      var target = scope.resolveVarValue(astNode);

      let loc = [];

      nodeIntegrationFoundDisabled = this.findNode(astHelper, target, 'nodeIntegration', value => value === false, scope);
      // nodeIntegrationInWorker default value is safe, as well as nodeIntegrationInSubFrames
      // so no check for return value (don't care if it was found)
      nodeIntegrationInWorkerFoundEnabled = this.findNode(astHelper, target, 'nodeIntegrationInWorker', value => value === true, scope);
      nodeIntegrationInSubFramesFoundEnabled = this.findNode(astHelper, target, 'nodeIntegrationInSubFrames', value => value === true, scope);

      sandboxFound = this.findNode(astHelper, target, 'sandbox', value => value === true, scope);
    }

    if (!nodeIntegrationFoundDisabled && defaults.nodeIntegration && !sandboxFound) {
      locations.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: `nodeIntegration was found to be enabled or its value wasn't correctly defined. ${this.description}`, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.FIRM, manualReview: this.needsManualReview });
    }

    if (nodeIntegrationInWorkerFoundEnabled && !sandboxFound) {
      locations.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: `nodeIntegrationInWorker was found to be enabled or its value wasn't correctly defined. ${this.description}`, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: this.needsManualReview });
    }

    if (nodeIntegrationInSubFramesFoundEnabled && !sandboxFound) {
      locations.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: `nodeIntegrationInSubFrames was found to be enabled or its value wasn't correctly defined. ${this.description}`, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: this.needsManualReview });
    }

    return locations;
  }


  findNode(astHelper, startNode, name, skipCondition, scope) {
    let foundMatching = false;

    const nodes = astHelper.findNodeByType(startNode, astHelper.PropertyName, astHelper.PropertyDepth, false, node => {
      return node.key.value === name || node.key.name === name;
    });

    var settingsValue;

    var assumeUnsafe = (self) => {
      if (name === "sandbox") // when we can't determine it, we should assume an unsafe value (false for sandbox, true for nodeIntegration et simila)
        settingsValue = false;
      else
        settingsValue = true;

      self.needsManualReview = true; // in any case, let's report this to be sure
    }

    for (const node of nodes) {
      // in practice if there are two keys with the same name, the value of the last one wins
      // but technically it is an invalid json
      // just to be on the safe side show a warning if any value is insecure
      
      if (node.value.type === "Identifier") { // it's a variable, needs manual review since it's probably a custom webpreferences object
        if (!scope.getVarValue || scope.getVarValue(node.value) === null) { // something did not work, unsupported TS var resolution or couldn't resolve variable
          assumeUnsafe(this);
        } else {
          settingsValue = scope.getVarValue(node.value);
        } 
      } else if (node.value.type === "UnaryExpression") { // it's a !0 || !1 unary expression. 
        if (node.value.operator == "!" && typeof node.value.argument.value === "number") { // if it's more complicated (e.g. !!!1), report for manual review and treat as insecure 
            this.needsManualReview = false; // it's truthy, so it's enabled
            settingsValue = eval(node.value.operator+node.value.argument.value);
          } else {
            assumeUnsafe(this);
          }
      } else if ((node.value.type.includes("Literal") && typeof node.value.value == "boolean") ) { // simple, straight, true or false value!
        settingsValue = node.value.value;
        this.needsManualReview = false;
      }
      else {
        assumeUnsafe(this)
      }

      if (typeof settingsValue === "undefined")
        settingsValue = node.value.value

      if (skipCondition(settingsValue)){
        foundMatching = true
        //if ((node.key.value === "sandbox" || node.key.name === "sandbox") && needsManualReview) continue;
        //if ((nodeIntegrationStrings.includes(node.key.value) || nodeIntegrationStrings.includes(node.key.name)) && !needsManualReview) continue;
      }

    }

    return foundMatching;
  }
}
