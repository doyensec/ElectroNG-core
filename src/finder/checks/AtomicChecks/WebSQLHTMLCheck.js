import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';
import { parseWebPreferencesFeaturesString } from '../../../util';

export default class WebSQLHTMLCheck {
  constructor() {
    this.id = 'WEBSQL_HTML_CHECK';
    this.title = "Enabled WebSQL Support";
    this.description = `Review the support for WebSQL in order to reduce the overall attack surface available from the renderer.`;
    this.type = sourceTypes.HTML;
    this.shortenedURL = "https://github.com/electron/electron/pull/23311";
  }

  match(cheerioObj, content) {
    const loc = [];
    const webviews = cheerioObj('webview');
    const self = this;
    webviews.each(function (i, elem) {
      let wp = cheerioObj(this).attr('webpreferences');
      if (wp) {
        let features = parseWebPreferencesFeaturesString(wp);
        if (features['enableWebSQL'] === true)
          loc.push({ line: content.substr(0, elem.startIndex).split('\n').length, column: 0, id: self.id, title: self.title, description: self.description, shortenedURL: self.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
      }

    });
    return loc;
  }
}
