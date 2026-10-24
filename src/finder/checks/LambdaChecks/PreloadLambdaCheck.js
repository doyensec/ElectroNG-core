import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class PreloadLambdaCheck {

  constructor() {
    this.id = "PRELOAD_LAMBDA_CHECK";
    this.title = "List of preloads";
    this.type = sourceTypes.JAVASCRIPT;
    this.description = "Get the preloads list given a preload file";
    this.exportIdentifiers = ["exports", "window", "global"];
  }

  match(astNode, astHelper, scope, defaults) {

    if (astNode.type !== 'AssignmentExpression' || !astNode.left || !astNode.left.property || !astNode.left.object) return null;
    if (this.exportIdentifiers.includes(astNode.left.property.name))
      return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, properties: { "preloadContent": astNode.right } }];
    
    if (this.exportIdentifiers.includes(astNode.left.object.name))
      return [{ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, properties: { "preloadContent": astNode.right } }];

  }

}
