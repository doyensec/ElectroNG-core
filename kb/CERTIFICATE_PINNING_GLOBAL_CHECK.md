## CERTIFICATE_PINNING_GLOBAL_CHECK - No certificate pinning mechanism seems to be enforced by the application.

When using HTTP as the transport, security is provided by Transport Layer Security  (TLS). TLS, and its predecessor SSL, are widely used on the Internet to authenticate a service to a client, and then to provide confidentiality to the channel. This check is reporting an insufficient TLS validation which happens when no specific TLS certificate seems to be enforced by the application.

Since the security of Electron applications is usually tied to the trusted content being run, enforce a certificate pinning mechanism. If only local Javascript/HTML content is processed by the application, it is possible to discard the finding.
