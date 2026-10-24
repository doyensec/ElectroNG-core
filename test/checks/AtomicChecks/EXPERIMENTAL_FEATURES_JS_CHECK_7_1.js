
let isDebug = true;

mainWindow = new BrowserWindow({
  "webPreferences": {
    experimentalCanvasFeatures: isDebug
  }
});