// functions/Auth/checkEmail.js
import * as functions from 'firebase-functions';
import db from '../firebaseAdminConfig.js';

export const checkEmail = functions.https.onCall(async (data, context) => {
    const { email } = data;
    console.log(email);
    const userQuerySnapshot = await db.collection('Users').where('email', '==', email).get();
    console.log(!userQuerySnapshot.empty);
  
    return { exists: !userQuerySnapshot.empty };
  });
  