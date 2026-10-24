function start() {
  mainWindow = new BrowserWindow({
	  "webPreferences": {
	    "preload": path.join(__dirname, "preload.js")
	  }
	});
}

start();