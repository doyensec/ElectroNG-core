import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class PreloadJSCheck {
  constructor() {
    this.id = 'PRELOAD_JS_CHECK';
    this.title = "Preloads In Use";
    this.description = `Review the use of preload scripts`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/JeuMu";
  }

  match(astNode, astHelper, scope){
    if (astNode.type !== 'NewExpression') return null;
    if (!(astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView') &&
        !(!astNode.callee.property || astNode.callee.property.name !== 'BrowserWindow' && astNode.callee.property.name !== 'BrowserView')) return null;

    let location = [];

    if (astNode.arguments.length > 0) {

      var target = scope.resolveVarValue(astNode);
      
      const found_nodes = astHelper.findNodeByType(target,
        astHelper.PropertyName,
        astHelper.PropertyDepth,
        false,
        node => (node.key.value === 'preload' || node.key.name === 'preload'));

      for (const node of found_nodes)
      {
        var settingsValue;

        if (node.value.type === "Identifier" && scope.getVarValue) { // preload: preloadsVariable
          settingsValue = scope.getVarValue(node.value)
          location.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, properties: { "preloadFilePath": settingsValue, "sourceType": "Identifier" }, manualReview: true });
        } else if (node.value.type === 'CallExpression') { //preload: something()

          if (node.value.arguments.length > 0) {

            //preload: require('path').join(__dirname, 'preload.js'),
            if (node.value.arguments[0].name && node.value.arguments[1].type === astHelper.StringLiteral && node.value.arguments[0].name === "__dirname") {
              location.push ({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, properties: { "preloadFilePath": node.value.arguments[1].value, "sourceType": "pathResolved" }, manualReview: true });
              break;
            }

            for (const argument of node.value.arguments) {
              if (argument.type === "Identifier" && scope.getVarValue) {
                settingsValue = scope.getVarValue(argument)
              } else if (argument.type === "Literal") {
                settingsValue = argument.value;
              }
              location.push ({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, properties: { "preloadFilePath": settingsValue, "sourceType": "pathConcatenated" }, manualReview: true });
              break;
            }
          }
        } else if (node.value.type === 'Literal') {
          location.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, properties: { "preloadFilePath": node.value.value, "sourceType": "StringLiteral" }, manualReview: true });
        } else if (node.value.type === 'TemplateLiteral') {
          location.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, properties: { "preloadFilePath": node.value.quasis[0].value.cooked, "sourceType": "StringTemplate" }, manualReview: true });
        } else {
          location.push({ line: node.key.loc.start.line, column: node.key.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.FIRM, manualReview: true });
        }
      }
    }

    return location;
  }
}