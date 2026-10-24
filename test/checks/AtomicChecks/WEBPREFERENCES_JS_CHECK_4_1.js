var isDebug = true
 // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: isDebug,
      devTools: true,
      nodeIntegrationInSubFrames: true,
      sandbox: false,
      enableRemoteModule: true,
      affinity: "test",
      zoomFactor: 1,
      javascript: true,
      webSecurity: true,
      allowRunningInsecureContent: true,
      plugins: false,
      enableBlinkFeatures: "CSSVariables,KeyboardEventKey",
      defaultFontSize: 15,
      offscreen: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webviewTag: true,
      safeDialogs: true,
      autoplayPolicy: "document-user-activation-required",
      "disableHtmlFullscreenWindowResize": true,
      spellcheck: true,
      v8CacheOptions: "code"
    }
  })