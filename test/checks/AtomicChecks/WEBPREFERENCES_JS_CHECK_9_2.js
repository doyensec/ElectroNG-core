const g = new d.BrowserWindow({
    width: Math.round(800 * p),
    minWidth: Math.round(380 * p),
    minHeight: Math.round(400 * p),
    height: Math.round(600 * p),
    show: !1,
    frame: !1,
    titleBarStyle: "hidden",
    resizable: !0,
    webPreferences: {
        zoomFactor: p,
        partition: c,
        nativeWindowOpen: !i,
        preload: o && i ? void 0 : this._getPreloadFile(),
        contextIsolation: o,
        experimentalFeatures: !0,
        nodeIntegration: !1,
        nodeIntegrationInWorker: !1,
        webviewTag: !0
    }
});

const s = new d.BrowserWindow({
    show: !1,
    titleBarStyle: "default",
    backgroundColor: "#000000",
    minWidth: 900,
    minHeight: 600,
    width: 900,
    height: 600,
    webPreferences: {
        partition: a,
        preload: this._getRtcPreloadFile(),
        contextIsolation: !1,
        experimentalFeatures: !0,
        nodeIntegration: !1,
        nodeIntegrationInWorker: !1,
        nodeIntegrationInSubFrames: !0,
        nativeWindowOpen: !0
    }
});