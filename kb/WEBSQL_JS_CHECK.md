## WEBSQL_JS_CHECK - Check if WebSQL is enabled on any of the renderers

Web SQL Database is a web page API for storing data in databases that can be queried using SQL variant. The standard was deprecated in 2010, and today the Web Applications Working Group and Chromium continue work on two other storage-related specifications: Web Storage and Indexed Database API.

Since the feature is probably not used, in order to reduce the overall attack surface available from the renderer, explicitly disable support for WebSQL by setting the `enableWebSQL` flag to `false`.
This check is responsible for checking if the flag is enabled in any of the application's `webPreferences`.