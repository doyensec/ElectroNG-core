const {app, BrowserWindow} = require('electron');

let mainWindow;
let mainWindow1;

let sameAffinity = "test1"

let webPrefI = {
  "webPreferences": {
    "affinity": sameAffinity
  }
};

let webPrefII ={
  webPreferences: {
    affinity: sameAffinity
  }
};

mainWindow = new BrowserWindow(webPrefI);

mainWindow1 = new BrowserWindow(webPrefII);
