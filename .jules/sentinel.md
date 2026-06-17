## 2024-06-17 - Proper Role-Based Access Control using Firebase Custom Claims

**Learning:** Hardcoded authorization checks (like checking `email === 'admin@domain.com'`) in both frontend and backend are severe security vulnerabilities. They bypass proper access control, are brittle, and impossible to scale or audit effectively. When using Firebase, authorization should always rely on Custom Claims (e.g., `admin: true`) set securely via the Admin SDK and verified using `getIdTokenResult()` on the frontend and `verifyIdToken()` on the backend.

**Action:** Whenever reviewing authentication or authorization code in Firebase projects, verify that custom claims are used for roles and permissions instead of hardcoded strings or easily spoofable user attributes. Provide utility scripts to manage these claims securely.
