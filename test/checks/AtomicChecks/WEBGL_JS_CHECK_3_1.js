
var isUsingWebGlFeatures = true;

const defaultConf = {
  "webPreferences": {
    webgl: isUsingWebGlFeatures
  }
};

mainWindow = new BrowserWindow(defaultConf);
