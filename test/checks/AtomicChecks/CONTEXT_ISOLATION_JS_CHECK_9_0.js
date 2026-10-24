let isSafeMode = true;

let test_preferences = {
  "webPreferences": {
    "contextIsolation": isSafeMode,
    "preload": 'preload.js'
  }
};

function start() {
  mainWindow = new BrowserWindow(test_preferences);
}

start();
