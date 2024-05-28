// functions/Auth/checkEmail.ts
import * as functions from "firebase-functions";
import db from "../firebaseAdminConfig"; // Ensure the correct path is used
import type { CallableContext } from "firebase-functions/v1/https";

interface CheckEmailData {
  email: string;
}

interface CheckEmailResult {
  exists: boolean;
}

export const checkEmail = functions.https.onCall(
  // prettier-ignore
  async (data: CheckEmailData, context: CallableContext): Promise<CheckEmailResult> => {
    const { email } = data;
    console.log(email);
    const userQuerySnapshot = await db
      .collection("Users")
      .where("email", "==", email)
      .get();
    console.log(!userQuerySnapshot.empty);

    return { exists: !userQuerySnapshot.empty };
  }
);
