const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron');

ipcMain.on('setSecureKeyboardEntry', (event, arg) => {
  app.setSecureKeyboardEntryEnabled(arg);
})
ipcMain.on('secureKeyboardEntry', (event, arg) => {
  event.returnValue = app.isSecureKeyboardEntryEnabled();
})

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
}

app.on('ready', createWindow);