// functions/Auth/verifyRegistration.ts
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import db from "../firebaseAdminConfig";
import { getClientData } from "./utils";

const auth = admin.auth();

interface VerifyRegistrationData {
  credential: {
    response: {
      clientDataJSON: string;
    };
  };
  email: string;
}

interface VerifyRegistrationResult {
  token: string;
}

export const verifyRegistration = functions.https.onCall(
  async (
    data: VerifyRegistrationData,
    context: functions.https.CallableContext
  ): Promise<VerifyRegistrationResult> => {
    const { credential, email } = data;

    // Get the user by email to retrieve their UID
    const user = await auth.getUserByEmail(email);
    const uid = user.uid;

    const userDoc = await db.collection("Users").doc(uid).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();
    const challenge = userData?.challenge;
    const clientData = getClientData(credential.response.clientDataJSON);
    console.log("From firestore:", challenge);
    console.log("From client:", clientData.challenge);

    if (clientData.challenge !== challenge) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Challenge mismatch"
      );
    }

    await db.collection("Users").doc(uid).set(
      {
        email,
        credential,
      },
      { merge: true }
    );

    const token = await auth.createCustomToken(uid);
    return { token };
  }
);
