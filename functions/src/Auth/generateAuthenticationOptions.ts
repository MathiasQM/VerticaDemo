// functions/Auth/generateAuthenticationOptions.ts
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import db from "../firebaseAdminConfig";
import { generateChallenge } from "./utils";

const auth = admin.auth();

interface GenerateAuthenticationOptionsData {
  email: string;
  rpId: string;
}

interface GenerateAuthenticationOptionsResult {
  challenge: string;
  name: string;
  rpId: string;
  allowCredentials: Array<{
    id: string;
    type: string;
    transports: string[];
  }>;
  userVerification: string;
  timeout: number;
}

export const generateAuthenticationOptions = functions.https.onCall(
  async (
    data: GenerateAuthenticationOptionsData,
    context: functions.https.CallableContext
  ): Promise<GenerateAuthenticationOptionsResult> => {
    const { email, rpId } = data;

    // Get the user by email to retrieve their UID
    const user = await auth.getUserByEmail(email);
    const uid = user.uid;

    const userDoc = await db.collection("Users").doc(uid).get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const challenge = generateChallenge();

    await userDoc.ref.set({ challenge: Buffer.from(challenge).toString("base64url") }, { merge: true });

    return {
      challenge: Buffer.from(challenge).toString("base64url"),
      name: "BranBrain AI",
      rpId: rpId,
      allowCredentials: [
        {
          id: Buffer.from(userData!.credential.rawId, "base64url").toString("base64url"),
          type: "public-key",
          transports: ["nfc", "ble", "internal"],
        },
      ],
      userVerification: "preferred",
      timeout: 60000,
    };
  }
);
