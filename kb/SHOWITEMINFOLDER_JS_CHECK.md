## SHOWITEMINFOLDER_JS_CHECK - The risks of using the showItemInFolder API

A subtle example of a potentially dangerous native Electron primitive is `shell.showItemInFolder`. As the name suggests, this API shows a given file in the file manager. Such seemingly innocuous functionality hides some peculiarities that could be dangerous from a security perspective for Remote Code Execution.

On Linux ([`/shell/common/platform_util_linux.cc`](https://github.com/electron/electron/blob/602913cb4c98d102548e082c97401415849fe082/shell/common/platform_util_linux.cc#L80-L86)), Electron extracts the parent directory name, checks if the resulting path is actually a directory and then uses XDGOpen (`xdg-open`) to show the file in its location:

```c++
void ShowItemInFolder(const base::FilePath& full_path) {
  base::FilePath dir = full_path.DirName();
  if (!base::DirectoryExists(dir))
    return;

  XDGOpen(dir.value(), false, platform_util::OpenCallback());
}
```

`xdg-open` can be leveraged for executing applications on the victim's computer.

> "If a file is provided the file will be opened in the preferred application for files of that type” (https://linux.die.net/man/1/xdg-open)

Because of the inherited time of check time of use (TOCTOU) condition caused by the time difference between the directory existence check and its launch with `xdg-open`, an attacker could run an executable of choice by replacing the folder path with an arbitrary file, winning the race introduced by the check. While this issue is rather tricky to be exploited in the context of an insecure Electron's renderer, it is certainly a potential step in a more complex vulnerabilities chain.

On Windows ([`/shell/common/platform_util_win.cc`](https://github.com/electron/electron/blob/602913cb4c98d102548e082c97401415849fe082/shell/common/platform_util_win.cc#L254-L300)), the situation is even more tricky:

```c++
void ShowItemInFolderOnWorkerThread(const base::FilePath& full_path) {
...
  base::win::ScopedCoMem<ITEMIDLIST> dir_item;
  hr = desktop->ParseDisplayName(NULL, NULL,
                                 const_cast<wchar_t*>(dir.value().c_str()),
                                 NULL, &dir_item, NULL);

  const ITEMIDLIST* highlight[] = {file_item};
  hr = SHOpenFolderAndSelectItems(dir_item, base::size(highlight), highlight,
                                  NULL);
...
 if (FAILED(hr)) {
 	if (hr == ERROR_FILE_NOT_FOUND) {
      ShellExecute(NULL, L"open", dir.value().c_str(), NULL, NULL, SW_SHOW);
    } else {
      LOG(WARNING) << " " << __func__ << "(): Can't open full_path = \""
                   << full_path.value() << "\""
                   << " hr = " << logging::SystemErrorCodeToString(hr);
    }
  }
}
```

Under normal circustances, the [`SHOpenFolderAndSelectItems`](https://docs.microsoft.com/en-us/windows/win32/api/shlobj_core/nf-shlobj_core-shopenfolderandselectitems) Windows API (from *shlobj_core.h*) is used. However, Electron introduced a fall-back mechanism as the call mysteriously fails with a "file not found" exception on old Windows systems. In these cases, [`ShellExecute`](https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-shellexecutea) is used as a fallback, specifying "open" as the ```lpVerb``` parameter. According to the [Windows Shell documentation](https://docs.microsoft.com/en-us/windows/win32/shell/launch#object-verbs), the "open" object verb launches the specified file or application. If this file is not an executable file, its associated application is launched.

Recently [Chromium has refactored](https://chromium-review.googlesource.com/c/chromium/src/+/1905947) the code in question to avoid the use of `xdg-open` altogether and leverage `dbus` instead.

