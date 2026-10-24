import { severity, confidence } from '../../attributes';

export default class LimitNavigationGlobalCheck {

  constructor() {
    this.id = "LIMIT_NAVIGATION_GLOBAL_CHECK";
    this.title = "Review the Limitations For Navigation Events";
    this.description = "Checks if some navigation event handlers are missing.";
    this.longDescription = {
      NONE_FOUND: "Missing navigation limits using .on new-window and will-navigate events.",
      NEW_WINDOW_MISSING: "Missing .on new-window navigation limit.",
      WILL_NAVIGATE_MISSING: "Missing .on will-navigate navigation limit.",
     };
    this.depends = ["LimitNavigationJSCheck"];
    this.shortenedURL = "https://git.io/JeuMs";
  }

  async perform(issues) {

    var willNavigateNavigations = issues.filter(e => e.properties.event === 'will-navigate');
    var newWindowNavigations = issues.filter(e => e.properties.event === 'new-window');
    var setWindowOpenHandlerCalls = issues.filter(e => e.properties.event === 'setWindowOpenHandler');

    if (issues.length == 0) { // no navigation events, yikes!
      return [{ file: "N/A", location: {line: 0, column: 0}, title: this.title, id: this.id, description: this.longDescription.NONE_FOUND, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.CERTAIN, manualReview: false }];
    } else if (willNavigateNavigations.length > 0 && newWindowNavigations.length > 0) {
      // all good, but mark for review unless the global check is explicitly disabled
      return issues.filter(issue => Array.isArray(issue.visibility.excludesGlobal) && !issue.visibility.excludesGlobal.includes(this.id));
    } else if (setWindowOpenHandlerCalls.length != 0 && willNavigateNavigations.length == 0 && newWindowNavigations.length == 0) {
      // no willnavigate, newwindow, but it has setWindowOpenHandler!
      return [];
    } else if (willNavigateNavigations.length == 0) {
      // no willnavigate, issue a finding
      return [{ file: "N/A", location: {line: 0, column: 0}, title: this.title, id: this.id, description: this.longDescription.WILL_NAVIGATE_MISSING, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.CERTAIN, manualReview: false }];
    } else if (newWindowNavigations.length == 0) {
      // no newwindow, issue a finding
      return [{ file: "N/A", location: {line: 0, column: 0}, title: this.title, id: this.id, description: this.longDescription.NEW_WINDOW_MISSING, shortenedURL: this.shortenedURL, severity: severity.HIGH, confidence: confidence.CERTAIN, manualReview: false }];
    }
  }
}