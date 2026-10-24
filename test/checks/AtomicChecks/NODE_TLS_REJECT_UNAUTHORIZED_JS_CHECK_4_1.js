let debug;

if (shouldDebug())
	debug = "0"
else
	debug = true;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = debug; 