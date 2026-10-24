var nativeWindowOpenValue = true;

var config = {
  "webPreferences": {
    "nativeWindowOpen": nativeWindowOpenValue,
  },
};

function start() {
  mainWindow = new BrowserWindow(config);
}