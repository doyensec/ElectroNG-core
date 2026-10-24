import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';

export default class WebPreferencesJSCheck {
  constructor() {
    this.id = 'WEBPREFERENCES_JS_CHECK';
    this.decorator = true;
    this.title = 'List Of webPreferences';
    this.description = `webPreferences properties in use`;
    this.type = sourceTypes.JAVASCRIPT;
    this.shortenedURL = "";
    this.loobackid="";
  }

  match(astNode, astHelper, scope, defaults) {
    var windowName;
    var windowNode;
    var windowType;

    if (astNode.type === 'Identifier') {
        if (!astNode.name) return null;
          this.loobackid = astNode.name;
    }

    if (astNode.type === 'AssignmentExpression') {
      if (!astNode.right || !astNode.right.callee || (astNode.right.callee.name !== 'BrowserWindow' && astNode.right.callee.name !== 'BrowserView')) return null;
      if (astNode.left.type !== "Identifier") return null;

      windowNode = astNode.right;
      windowName = astNode.left.name;
      windowType = astNode.right.callee.name;

    } else if (astNode.type == "VariableDeclarator") {
      if (!astNode.init || !astNode.init.callee || !astNode.init.callee.property || (astNode.init.callee.property.name !== 'BrowserWindow' && astNode.init.callee.property.name !== 'BrowserView')) return null;

      windowNode = astNode.init;
      windowName = astNode.id.name;
      windowType = astNode.init.callee.property.name;

    } else if (astNode.type == "NewExpression") {
      if (!astNode.callee || !astNode.callee.name || (astNode.callee.name !== 'BrowserWindow' && astNode.callee.name !== 'BrowserView')) return null;

      windowNode = astNode;
      windowName = this.loobackid;
      windowType = astNode.callee.name;

    } else return null;

    let location = [];

    var webPreferencesExplicitlySet = [];
    var webPreferencesRealValues;

    if (windowNode.arguments.length > 0) {

      var target = scope.resolveVarValue(windowNode);

      // we only get the webPreferences
      if (target && target.properties) {
        for (const prop of target.properties) {
          if (prop.key && prop.key.name === "webPreferences") {
            for (const pref of prop.value.properties) {
              var settingsValue;
              if (scope.getVarValue && pref.value && pref.value.type === "Identifier") // e.g. nodeIntegration: variable
                settingsValue = scope.getVarValue(pref.value);
              else if (scope.getVarValue && pref.type === "SpreadElement" && pref.argument.type === "Identifier") // e.g. if it's a `...defaultOptions,`
                settingsValue = scope.getVarValue(pref.argument);
              else if (pref.value.type === "UnaryExpression") { // it's a !0 || !1 unary expression.
                if (pref.value.operator == "!" && typeof pref.value.argument.value === "number") {// if it's more complicated (e.g. !!!1), report for manual review and treat as insecure
                    settingsValue = eval(pref.value.operator+pref.value.argument.value);
                } else settingsValue = pref.value.value; // e.g. nodeIntegration: true
              }
              else
                settingsValue = pref.value.value; // e.g. nodeIntegration: true

              if (settingsValue) {
                let tmp = {};
                if (pref.key.value)
                  tmp[pref.key.value] = settingsValue;
                else
                  tmp[pref.key.name] = settingsValue;

                webPreferencesExplicitlySet.push(tmp);
              }
            }
          }
        }
      }

      // defaults should always be present
      webPreferencesRealValues = Object.keys(defaults).map(function(setting) {
        let tmp;
        if (!webPreferencesExplicitlySet.find(val => setting in val)) {
          tmp = { isSet: false };
          tmp[setting] = defaults[setting];
          tmp["default"] = defaults[setting];
        } else {
          tmp = { isSet: true };
          tmp[setting] = webPreferencesExplicitlySet.find(val => setting in val)[setting];
          if (setting in defaults)
            tmp["default"] = defaults[setting];
          else
            tmp["default"] = null;
        }

        return tmp;
      });

      var webPreferencesLeftOut = webPreferencesExplicitlySet.filter(val => !webPreferencesRealValues.find(pref => pref[Object.keys(val)[0]] !== undefined))
                                                               .map(function(setting) {
                                                                setting.isSet = true;
                                                                setting.default = null;
                                                                return setting;
                                                               });

      // let's add any other option that we're not aware of anyway (e.g. because we're defaulting to Electron v1)
      webPreferencesRealValues = [...webPreferencesRealValues, ...webPreferencesLeftOut];



      location.push({ line: astNode.loc.start.line, column: astNode.loc.start.column, id: this.id, title: this.title, description: this.description, shortenedURL: this.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.FIRM, properties: { "windowName": windowName, "windowType": windowType, "webPreferences": webPreferencesRealValues }, manualReview: false });

    }

    return location;
  }
}
