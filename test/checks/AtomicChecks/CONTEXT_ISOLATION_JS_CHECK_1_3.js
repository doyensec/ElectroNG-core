mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    preload: 'preload.js',
    worldSafeExecuteJavaScript: true
  }
});

mainWindow = new BrowserWindow({
  "webPreferences": {
    "contextIsolation": true,
    "preload": 'preload.js',
    "worldSafeExecuteJavaScript": true
  }
});

mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: false,
  }
});

mainWindow = new BrowserWindow({
  "webPreferences": {
    "contextIsolation": false,
  }
});

mainWindow = new BrowserWindow();