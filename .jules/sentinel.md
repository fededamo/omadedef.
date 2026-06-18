## 2026-06-17 - Prevent Prompt Injection via systemInstruction

**Learning:** When using the Google Gemini AI SDK, interpolating raw, untrusted user input directly into the `contents` string alongside system instructions creates a critical prompt injection vulnerability. This allows users to override or bypass instructions (e.g. telling it to ignore previous instructions).

**Action:** Always separate instructions from user input. Use the `systemInstruction` field inside the `config` object for any instructional text or constraints, and supply the untrusted user input solely as the `contents` parameter.
## 2024-05-18 - Prevent Prompt Injection in Gemini API

**Learning:** Prompt injection can occur if raw user input is concatenated directly with the instructions inside the `contents` field of a Gemini API request.

**Action:** Always place instructional prompts in the `config.systemInstruction` field and pass the raw user input directly to the `contents` field. This cleanly separates system behavior from user data.

## 2024-06-17 - Hardcoded Secrets in Middleware

**Learning:** Hardcoding sensitive or environment-specific data (like authorized email addresses) in middleware is a security risk. It prevents easy configuration changes and exposes secrets in the source code.

**Action:** Always use environment variables (`process.env`) to manage environment-specific configurations or secrets. Validate that these variables are set at runtime and fail fast with a clear error message (e.g., 500 Internal Server Error) if they are missing to prevent unexpected behavior.
