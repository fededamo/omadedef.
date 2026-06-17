import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./firebase-applet-config.json');

initializeApp({ projectId: config.projectId });
const db = getFirestore(config.firestoreDatabaseId);

async function run() {
  try {
    const snap = await db.collection('users').get();
    console.log("SUCCESS items:", snap.size);
  } catch(e) {
    console.error("ERROR 1:", e.message);
  }

  try {
    const defaultDb = getFirestore();
    const snapDef = await defaultDb.collection('users').get();
    console.log("DEFAULT DB items:", snapDef.size);
  } catch(e) {
    console.error("ERROR DEFAULT DB:", e.message);
  }
}
run();
