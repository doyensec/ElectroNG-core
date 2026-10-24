let isDebug = true;

var firstUnsafeConfig = {
  "webPreferences": {
    allowRunningInsecureContent: isDebug
  }
};

function start() {
  mainWindow = new BrowserWindow(firstUnsafeConfig);
}

start();