
var isUsingLocalDB = true;

const defaultConf = {
  "webPreferences": {
    enableWebSQL: isUsingLocalDB
  }
};

mainWindow = new BrowserWindow(defaultConf);
