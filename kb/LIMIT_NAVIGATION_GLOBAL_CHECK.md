## LIMIT_NAVIGATION_GLOBAL_CHECK - Missing navigation limits using `.on` 'new-window' and 'will-navigate' events
This Global Check detects if the atomic LIMIT_NAVIGATION_JS_CHECK is missing, meaning that the `.on` call for  'new-window' and 'will-navigate' is never made in the target application to limit the application's navigation only to trusted origins.

***

### Risk
This setting can be used to limit the exploitability of certain issues. Not enforcing navigation limits leaves the Electron application under full control to remote origins in case of accidental navigation.

### Auditing
Check for callbacks on the `will-navigate` and the `new-windows` events. These callbacks should be implemented to exclude potential flaws in the origin's validation mechanism.

### References
* https://electronjs.org/docs/api/web-contents#event-will-navigate

