
var remote = false;

let conf = { "webPreferences": {
  enableRemoteModule: remote }
};

mainWindow = new BrowserWindow(conf);