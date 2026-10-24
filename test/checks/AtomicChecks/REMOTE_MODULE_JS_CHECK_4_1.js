
var remote = true;

let conf = { "webPreferences": {
  enableRemoteModule: remote }
};

mainWindow = new BrowserWindow(conf);