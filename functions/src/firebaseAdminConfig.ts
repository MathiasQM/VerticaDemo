// functions/firebaseAdminConfig.ts
import admin from "firebase-admin";
import serviceAccount from "./service-account.json";

// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}
const db = admin.firestore();

export default db;
