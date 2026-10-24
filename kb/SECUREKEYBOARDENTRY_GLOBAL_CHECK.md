## SECUREKEYBOARDENTRY_GLOBAL_CHECK - Lack Of Secure Keyboard Entry Protection 

The `EnableSecureEventInput` function was implemented in Mac OS X 10.3, to provide a secure means for a process to protect keyboard input to a custom data entry field. This function is commonly used with custom user interfaces for entering passwords and other sensitive information and protects keyboard entry so that keyboard events cannot be intercepted by a keyboard intercept process (https://developer.apple.com/library/archive/technotes/tn2150/_index.html).

Since Electron version 10 (https://github.com/electron/electron/commit/7b55a70a3673fc76ee6ff9e50577ca72536606fd), the app API object features two methods to check or set this mode of input:

* `setSecureKeyboardEntryEnabled(enabled)`, sets the Secure Keyboard Entry mode in the application.
* `isSecureKeyboardEntryEnabled()`, returns whether Secure Keyboard Entry is enabled _(Boolean)_ (https://www.electronjs.org/docs/api/app#appsetsecurekeyboardentryenabledenabled-macos)

The application does not seem to currently leverage this keystroke protection mechanism to protect from other processes listen for keyboard input events.
Note that the prerequisite for the attack is that the attacker's process should already be running on the victim's machine. From the perspective of the application's code complexity, it will be important to enable this secure event input only when it is needed and disable it when it is no longer needed. If the application enabled secure input and left it enabled when the process moved to the background, the system would not allow keyboard intercept processes to receive keyboard events. For more on this, see the "Using Secure Event Input Fairly" section of TN2150.

An an additional, optional, mitigation, emit the `setSecureKeyboardEntryEnabled` event on macOS clients.


### Risk
An attacker may be able to more easily intercept the keystroke composing passwords or other secrets.

### Auditing
To confirm if the application is protected or not, run the following command using the `ioreg` utility to displays the I/O Kit registry:

```
$ ioreg -l -w 0 | grep kCGSSessionSecureInputPID
```

It is also possible to use an off-the-shelf key logger for macOS like https://github.com/SkrewEverything/Swift-Keylogger to verify whether the Secure Keyboard Entry mode is working as intended.

