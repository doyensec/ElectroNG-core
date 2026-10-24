let isDebug = true;

let test_preferences = {
  "webPreferences": {
    "contextIsolation": isDebug,
    "preload": 'preload.js',
    worldSafeExecuteJavaScript: true
  }
};

function start() {
  mainWindow = new BrowserWindow(test_preferences);
}

start();

