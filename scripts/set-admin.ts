import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const firebaseConfig = require('../firebase-applet-config.json');

initializeApp({
  projectId: firebaseConfig.projectId
});

async function setAdmin(email: string) {
  try {
    const user = await getAuth().getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully assigned admin role to ${email}`);
  } catch (error) {
    console.error('Error assigning admin role:', error);
  }
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: pnpm set-admin <email>');
  process.exit(1);
}

setAdmin(args[0]);
