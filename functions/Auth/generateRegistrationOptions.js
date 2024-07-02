// functions/Auth/generateRegistrationOptions.js
import * as functions from "firebase-functions";
import db from "../firebaseAdminConfig.js";
import { generateChallenge } from "./utils.js";
import admin from "firebase-admin";

const auth = admin.auth();

export const generateRegistrationOptions = functions.https.onCall(async (data, context) => {
  const { email, rpId } = data;

  // Get the user by email to retrieve their UID
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    user = await auth.createUser({ email });
  }

  const uid = user.uid;

  const challenge = generateChallenge();
  const challengeBase64url = Buffer.from(challenge, "base64").toString("base64url");

  await db.collection("Users").doc(uid).set({ challenge: challengeBase64url }, { merge: true });
  await db
    .collection("Users")
    .doc(uid)
    .update({
      authMethods: admin.firestore.FieldValue.arrayUnion("webauthn"),
    });

  return {
    challenge: challengeBase64url,
    rp: {
      name: "BranBrain AI",
      id: rpId,
    },
    user: {
      id: Buffer.from(uid).toString("base64url"),
      name: email,
      displayName: email,
    },
    pubKeyCredParams: [
      {
        type: "public-key",
        alg: -7, // ES256 algorithm
      },
      {
        type: "public-key",
        alg: -257, // RS256 algorithm
      },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "preferred",
    },
    timeout: 60000,
    attestation: "direct",
  };
});
