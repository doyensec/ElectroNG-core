this.createLicenseWindow = () => {
    const e = new d.BrowserWindow({
        width: 800,
        height: 600,
        show: !1,
        webPreferences: {
            experimentalFeatures: !0,
            nodeIntegration: !1,
            nodeIntegrationInWorker: !1
        }
    });
    e.loadFile(A.default.resolve(_.htmlDir, "licenses.html")), e.show()
};