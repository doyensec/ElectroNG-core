
var isUsingLocalDB = false;

const defaultConf = {
  "webPreferences": {
    enableWebSQL: isUsingLocalDB
  }
};

mainWindow = new BrowserWindow(defaultConf);
