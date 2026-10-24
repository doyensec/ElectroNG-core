
function start() {
  let moreInfoWindow;
  let featureString = "Auxclick";
  let windowConfig = {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      disableBlinkFeatures: featureString
    }
  };

  moreInfoWindow = new BrowserWindow(windowConfig);
  moreInfoWindow.loadURL("https://www.doyensec.com/whatever");
}

start();