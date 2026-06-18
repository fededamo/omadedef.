## 2024-05-18 - Prevent Prompt Injection in Gemini API

**Learning:** Prompt injection can occur if raw user input is concatenated directly with the instructions inside the `contents` field of a Gemini API request.

**Action:** Always place instructional prompts in the `config.systemInstruction` field and pass the raw user input directly to the `contents` field. This cleanly separates system behavior from user data.

## 2024-06-17 - Hardcoded Secrets in Middleware

**Learning:** Hardcoding sensitive or environment-specific data (like authorized email addresses) in middleware is a security risk. It prevents easy configuration changes and exposes secrets in the source code.

**Action:** Always use environment variables (`process.env`) to manage environment-specific configurations or secrets. Validate that these variables are set at runtime and fail fast with a clear error message (e.g., 500 Internal Server Error) if they are missing to prevent unexpected behavior.

## 2024-06-17 - Proper Role-Based Access Control using Firebase Custom Claims

**Learning:** Hardcoded authorization checks (like checking `email === 'admin@domain.com'`) in both frontend and backend are severe security vulnerabilities. They bypass proper access control, are brittle, and impossible to scale or audit effectively. When using Firebase, authorization should always rely on Custom Claims (e.g., `admin: true`) set securely via the Admin SDK and verified using `getIdTokenResult()` on the frontend and `verifyIdToken()` on the backend.

**Action:** Whenever reviewing authentication or authorization code in Firebase projects, verify that custom claims are used for roles and permissions instead of hardcoded strings or easily spoofable user attributes. Provide utility scripts to manage these claims securely.
