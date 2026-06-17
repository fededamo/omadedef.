## 2024-05-18 - Prevent Prompt Injection in Gemini API

**Learning:** Prompt injection can occur if raw user input is concatenated directly with the instructions inside the `contents` field of a Gemini API request.

**Action:** Always place instructional prompts in the `config.systemInstruction` field and pass the raw user input directly to the `contents` field. This cleanly separates system behavior from user data.
