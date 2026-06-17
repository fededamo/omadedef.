## 2026-06-17 - Prevent Prompt Injection via systemInstruction

**Learning:** When using the Google Gemini AI SDK, interpolating raw, untrusted user input directly into the `contents` string alongside system instructions creates a critical prompt injection vulnerability. This allows users to override or bypass instructions (e.g. telling it to ignore previous instructions).

**Action:** Always separate instructions from user input. Use the `systemInstruction` field inside the `config` object for any instructional text or constraints, and supply the untrusted user input solely as the `contents` parameter.
