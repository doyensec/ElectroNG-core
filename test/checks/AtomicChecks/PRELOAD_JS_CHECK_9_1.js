var preloadPath = "preload.js";

function start() {
  mainWindow = new BrowserWindow({
	  "webPreferences": {
	    "preload": path.join(__dirname, preloadPath)
	  }
	});
}

start();