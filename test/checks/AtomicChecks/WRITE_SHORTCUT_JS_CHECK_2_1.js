
async function createStartupShortcut() {
    await shell.writeShortcutLink(startupPath, options = { target: path.join(appPath, 'target.exe'), args: '-m' });
    shell.showItemInFolder(startupPath);
    mainWindow.webContents.send('startup:done');
}