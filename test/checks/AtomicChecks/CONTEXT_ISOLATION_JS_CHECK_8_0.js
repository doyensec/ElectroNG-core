let isSafeMode = false;

let test_preferences = {
  "webPreferences": {
    "contextIsolation": true,
    "preload": 'preload.js',
    "worldSafeExecuteJavaScript": isDebug
  }
};

function start() {
  mainWindow = new BrowserWindow(test_preferences);
}

start();
