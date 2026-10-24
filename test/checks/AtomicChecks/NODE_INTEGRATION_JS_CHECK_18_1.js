let isDebug = true;

let pref = {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: isDebug
    }
  };

 // Create the browser window.
  mainWindow = new BrowserWindow(pref)