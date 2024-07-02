// functions/Auth/verifyAuthentication.js
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import db from '../firebaseAdminConfig.js';
import { getClientData } from './utils.js';


const auth = admin.auth();

export const verifyAuthentication = functions.https.onCall(async (data, context) => {
  const { assertion, email } = data;

   // Get the user by email to retrieve their UID
   const user = await auth.getUserByEmail(email);
   const uid = user.uid;

  const userDoc = await db.collection('Users').doc(uid).get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const { challenge } = userDoc.data();
  const clientData = getClientData(assertion.response.clientDataJSON);
  if (clientData.challenge !== challenge) {
    throw new functions.https.HttpsError('invalid-argument', 'Challenge mismatch');
  }

  const token = await auth.createCustomToken(uid);
  return { token };
});
