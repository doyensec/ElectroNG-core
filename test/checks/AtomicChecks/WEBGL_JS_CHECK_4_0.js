
var isUsingWebGlFeatures = false;

const defaultConf = {
  "webPreferences": {
    webgl: isUsingWebGlFeatures
  }
};

mainWindow = new BrowserWindow(defaultConf);
