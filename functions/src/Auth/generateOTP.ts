// functions/Auth/generateOtp.ts
import * as functions from "firebase-functions";
import db from "../firebaseAdminConfig";
import nodemailer from "nodemailer";

const gmailEmail = functions.config().email.system.mail;
const gmailPassword = functions.config().email.system.password;

interface GenerateOTPData {
  email: string;
}

interface GenerateOTPResult {
  message: string;
}

export const generateOTP = functions.https.onCall(
  async (
    data: GenerateOTPData,
    context: functions.https.CallableContext
  ): Promise<GenerateOTPResult> => {
    const { email } = data;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // Save OTP to Firestore
    await db
      .collection("OTP")
      .doc(email)
      .set({ code: otp, expiresAt: expiresAt }, { merge: true });

    // Send OTP to user's email
    const transporter = nodemailer.createTransport({
      host: "smtp.simply.com",
      port: 587, // 465 for secure
      secure: false, // True for 465, false for other ports
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });

    const mailOptions = {
      from: "brandbrainai@mathiasqm.dk",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return { message: "OTP sent" };
  }
);
