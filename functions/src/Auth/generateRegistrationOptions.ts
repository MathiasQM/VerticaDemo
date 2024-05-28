// functions/Auth/generateRegistrationOptions.ts
import * as functions from "firebase-functions";
import db from "../firebaseAdminConfig";
import { generateChallenge } from "./utils";
import admin from "firebase-admin";

const auth = admin.auth();

interface GenerateRegistrationOptionsData {
  email: string;
  rpId: string;
}

interface GenerateRegistrationOptionsResult {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection: {
    userVerification: string;
  };
  timeout: number;
  attestation: string;
}

export const generateRegistrationOptions = functions.https.onCall(
  async (
    data: GenerateRegistrationOptionsData,
    context: functions.https.CallableContext
  ): Promise<GenerateRegistrationOptionsResult> => {
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
    const challengeBase64url = Buffer.from(challenge, "base64").toString(
      "base64url"
    );

    await db
      .collection("Users")
      .doc(uid)
      .set({ challenge: challengeBase64url }, { merge: true });
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
        // id: 'https://auth.brandbrainai.com/',
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
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "direct",
    };
  }
);
