import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class DangerousFunctionsJSCheck {
  constructor() {
    this.id = 'DANGEROUS_FUNCTIONS_JS_CHECK';
    this.title = 'Dangerous Functions In Use';
    this.description = `Do not use insertCSS, executeJavaScript, eval, Function, setTimeout, setInterval, setImmediate with user-supplied content.\nAvoid XSS-prone methods if possible.`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "https://git.io/Jeug9";
  }

  match(astNode, astHelper, scope){

    let shouldReport = false;

    const electronMethods = [
      'executeJavascript',
      'insertCSS'
    ];

    var evalLikemethods = [
          'eval',
          'Function',
          'setTimeout',
          'setInterval',
          'setImmediate',
          'globalEval',
          'getScript',
          'load',
          'multiArgs',
          'toFastProperties'
    ];

    var xssProneMethods = [ 
        'innerHTML',
        'outerHTML',
        'append',
        'appendTo',
        'insertAfter',
        'insertBefore',
        'prepend',
        'prependTo',
        'wrap',
        'wrapInner',
        'wrapAll',
        'before',
        'after',
        'createRef',
        'findDOMNode',
        'dangerouslySetInnerHTML',
        'createNodesFromMarkup'
    ];


    if (astNode.type !== 'CallExpression') return null;

    // it's an electron-specific method
    if (electronMethods.includes(astNode.callee.name) || (astNode.callee.property && electronMethods.includes(astNode.callee.property.name))) {
      if (astNode.arguments.length === 0 || astNode.arguments[0].type === astHelper.StringLiteral) return null; //if it's a constant or is called empty
      
      shouldReport = true; // always interesting
    }

    // it's a dangerous eval-like JS function
    if (evalLikemethods.includes(astNode.callee.name) || (astNode.callee.property && evalLikemethods.includes(astNode.callee.property.name))) {
      if (astNode.arguments.length === 0 || astNode.arguments[0].type === astHelper.StringLiteral) return null; //if it's a constant or is called empty
      if (astNode.arguments[0].type === "BinaryExpression") shouldReport = true; // if it's a string concatenation

      if (astNode.arguments[0].type === "Identifier") { // is it a variable?
         // if it is a variable we check its type
          var target = scope.resolveVarValue(astNode);

          if (target === null) // we could not resolve the variable, let the user check
            shouldReport = true;
          else if (target && (target.type === "BinaryExpression" || target.type.includes(astHelper.StringLiteral))) // check if we are facing a string concatenation, a plain string or template literal (e.g. ${var})
            shouldReport = true;
          else // it's probably of little interest
            shouldReport = false;
      }
    }


    // it's a dangerous XSS-prone function
    if (xssProneMethods.includes(astNode.callee.name) || (astNode.callee.property && xssProneMethods.includes(astNode.callee.property.name))) {
      if (astNode.arguments.length === 0 || astNode.arguments[0].type === astHelper.StringLiteral) return null; //if it's a constant or is called empty
      if (astNode.arguments[0].type === "BinaryExpression") shouldReport = true; // if it's a string concatenation

      if (astNode.arguments[0].type === "Identifier") { // is it a variable?
         // if it is a variable we check its type
          var target = scope.resolveVarValue(astNode);

          if (target === null) // we could not resolve the variable, let the user check
            shouldReport = true;
          else if (target && (target.type === "BinaryExpression" || target.type.includes(astHelper.StringLiteral))) // check if we are facing a string concatenation, a plain string or template literal (e.g. ${var})
            shouldReport = true;
          else // it's probably of little interest
            shouldReport = false;
      }
    }

    if (shouldReport)
      return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.MEDIUM, confidence: confidence.CERTAIN, manualReview: true }];
  }
}
