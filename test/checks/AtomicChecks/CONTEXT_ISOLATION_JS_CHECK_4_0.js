let test_preferences = {
  "webPreferences": {
    "contextIsolation": true,
    "preload": 'preload.js',
    "worldSafeExecuteJavaScript": true
  }
};

mainWindow = new BrowserWindow(test_preferences);
