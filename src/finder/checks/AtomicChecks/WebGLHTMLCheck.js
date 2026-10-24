import { sourceTypes } from '../../../parser/types';
import { severity, confidence } from '../../attributes';
import { parseWebPreferencesFeaturesString } from '../../../util';

export default class WebGLHTMLCheck {
  constructor() {
    this.id = 'WEBGL_HTML_CHECK';
    this.title = "Enabled WebGL Support";
    this.description = `Review the support for WebGL in order to reduce the overall attack surface available from the renderer.`;
    this.type = sourceTypes.HTML;
    this.shortenedURL = "https://github.com/electron/electron/commit/1158d35021029a7bf6d379ad05e91a1506b9355b";
  }

  match(cheerioObj, content) {
    const loc = [];
    const webviews = cheerioObj('webview');
    const self = this;
    webviews.each(function (i, elem) {
      let wp = cheerioObj(this).attr('webpreferences');
      if (wp) {
        let features = parseWebPreferencesFeaturesString(wp);
        if (features['webgl'] === true)
          loc.push({ line: content.substr(0, elem.startIndex).split('\n').length, column: 0, id: self.id, title: self.title, description: self.description, shortenedURL: self.shortenedURL, severity: severity.INFORMATIONAL, confidence: confidence.CERTAIN, manualReview: false });
      }

    });
    return loc;
  }
}
