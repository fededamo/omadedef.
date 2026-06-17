import { initializeApp } from 'firebase-admin/app';
import { securityRules } from 'firebase-admin/security-rules';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./firebase-applet-config.json');

initializeApp({ projectId: config.projectId });

async function run() {
  try {
    const rules = readFileSync('firestore.rules', 'utf8');
    const name = `projects/${config.projectId}/databases/${config.firestoreDatabaseId}/rulesets`;
    // The Admin SDK might not have a direct method for specific firestore DB rules.
    // Let's use it for the default if it helps, but we need it for our DB.
  } catch (e) {
    console.error(e)
  }
}
run();
