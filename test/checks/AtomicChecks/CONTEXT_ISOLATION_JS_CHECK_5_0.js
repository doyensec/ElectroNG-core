let test_preferences = {
  "webPreferences": {
    "contextIsolation": true,
    "preload": 'preload.js',
    "worldSafeExecuteJavaScript": true
  }
};

function start() {
  mainWindow = new BrowserWindow(test_preferences);
}

start();

