// functions/Auth/verifyOtp.js
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import db from "../firebaseAdminConfig.js";

const auth = admin.auth();

export const verifyOTP = functions.https.onCall(async (data, context) => {
  const { email, otp, dontcreateUser } = data;

  const OTPDoc = await db.collection("OTP").doc(email).get();
  const OTPData = OTPDoc.data();
  console.log("OTPData:", OTPData);
  console.log("OTPData:", OTPData.code);

  if (OTPData.code !== otp) {
    console.log("OTP:", otp, OTPData.code);
    return { res: "Wrong OTP - Try again" };
  }
  if (Date.now() > OTPData.expiresAt) {
    console.log("ExpiresAt:", Date.now(), OTPData.expiresAt);
    return { res: "Expired otp - Resending..." };
  }

  // Clear OTP from Firestore
  await db.collection("OTP").doc(email).delete();

  if (dontcreateUser === true) {
    return { res: "success" };
  }

  // Create user and get UID to create a custom token
  let uid;

  try {
    // Check if user exists
    const user = await auth.getUserByEmail(email);
    const userDoc = await db.collection("Users").doc(user.uid).get();
    uid = user.uid;
    console.log("UserDoc:", userDoc.data(), user);
    if (!userDoc.authMethods || userDoc.authMethods.includes("OTP") === false) {
      console.log("did not include OTP - ADding");
      await db
        .collection("Users")
        .doc(uid)
        .update({ authMethods: admin.firestore.FieldValue.arrayUnion("OTP") });
    }
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // Create new user if not found
      const newUser = await auth.createUser({ email });
      uid = newUser.uid;
      await db.collection("Users").doc(uid).set({ email });
      await db
        .collection("Users")
        .doc(uid)
        .update({ authMethods: admin.firestore.FieldValue.arrayUnion("OTP") });
    } else {
      // Rethrow the error if it's not a user-not-found error
      throw new functions.https.HttpsError("internal", "Error fetching user data");
    }
  }

  // Create a custom token and return it
  const token = await auth.createCustomToken(uid);
  return { token };
});
