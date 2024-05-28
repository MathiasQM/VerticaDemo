// functions/Auth/verifyOtp.ts
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import db from "../firebaseAdminConfig";

const auth = admin.auth();

interface VerifyOTPData {
  email: string;
  otp: string;
  dontcreateUser?: boolean;
}

interface VerifyOTPResult {
  res?: string;
  token?: string;
}

export const verifyOTP = functions.https.onCall(
  async (
    data: VerifyOTPData,
    context: functions.https.CallableContext
  ): Promise<VerifyOTPResult> => {
    const { email, otp, dontcreateUser } = data;

    const OTPDoc = await db.collection("OTP").doc(email).get();
    const OTPData = OTPDoc.data();

    if (!OTPData || OTPData.code !== otp || Date.now() > OTPData.expiresAt) {
      console.log("OTP:", otp, OTPData?.code);
      console.log("ExpiresAt:", Date.now(), OTPData?.expiresAt);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid or expired OTP"
      );
    }

    // Clear OTP from Firestore
    await db.collection("OTP").doc(email).delete();

    if (dontcreateUser === true) {
      return { res: "success" };
    }

    // Create user and get UID to create a custom token
    let uid: string;

    try {
      // Check if user exists
      const user = await auth.getUserByEmail(email);
      const userDoc = await db.collection("Users").doc(user.uid).get();
      uid = user.uid;
      console.log("UserDoc:", userDoc.data(), user);
      if (
        !userDoc.data()?.authMethods ||
        !userDoc.data()?.authMethods.includes("OTP")
      ) {
        console.log("Did not include OTP - Adding");
        await db
          .collection("Users")
          .doc(uid)
          .update({
            authMethods: admin.firestore.FieldValue.arrayUnion("OTP"),
          });
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // Create new user if not found
        const newUser = await auth.createUser({ email });
        uid = newUser.uid;
        await db.collection("Users").doc(uid).set({ email });
        await db
          .collection("Users")
          .doc(uid)
          .update({
            authMethods: admin.firestore.FieldValue.arrayUnion("OTP"),
          });
      } else {
        // Rethrow the error if it's not a user-not-found error
        throw new functions.https.HttpsError(
          "internal",
          "Error fetching user data"
        );
      }
    }

    // Create a custom token and return it
    const token = await auth.createCustomToken(uid);
    return { token };
  }
);
