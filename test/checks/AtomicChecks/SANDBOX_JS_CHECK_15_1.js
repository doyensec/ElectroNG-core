var sandboxValue; // unknown

var config = {
  "webPreferences": {
    "sandbox": sandboxValue,
  },
};

function start() {
  mainWindow = new BrowserWindow(config);
}