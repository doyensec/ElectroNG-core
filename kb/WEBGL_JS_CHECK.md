## WEBGL_JS_CHECK - Check if WebGL is enabled on any of the renderers

One major risk is that WebGL involves running code directly on the video card, and exposing APIs that provide direct access to video card APIs. The browser does attempt to sandbox this code (to a certain extent), and browsers do enforce a number of security restrictions designed to prevent malicious behavior. However, many of these APIs and their implementations were not originally designed to be provided to untrusted entities (they were only usable by native applications, which are fully trusted), so there are concerns about whether exposing them to arbitrary web sites might enable web sites to attack the users' systems. While browsers have responded to these issues with several security controls, several memory corruption and side channel bugs are still found and addressed in Chromium in recent times. Because of this, there is some ongoing debate over whether these defenses will prove adequate in the long term.

In order to reduce the overall attack surface available from the renderer, explicitly disable support for WebGL by setting the `webgl` flag to `false`.
This check is responsible for checking if the flag is enabled in any of the application's `webPreferences`.

