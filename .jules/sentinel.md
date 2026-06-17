## 2024-05-24 - Unnecessary Error Details in Auth Middleware
**Vulnerability:** The authentication middleware was returning `details: e.message` in the JSON response when token verification failed.
**Learning:** This could inadvertently expose internal stack traces or library-specific error messages to the client, which is a common information leakage vulnerability.
**Prevention:** Always return generic error messages for authentication failures.
