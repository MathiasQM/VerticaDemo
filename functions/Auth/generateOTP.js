// functions/Auth/generateOtp.js
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import db from "../firebaseAdminConfig.js";
// import { v4 as uuidv4 } from 'uuid';
import nodemailer from "nodemailer";

const gmailEmail = functions.config().email.system.mail;
const gmailPassword = functions.config().email.system.password;

const auth = admin.auth();

export const generateOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;
  console.log("Email:", email);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

  // Save OTP to Firestore
  await db.collection("OTP").doc(email).set({ code: otp, expiresAt: expiresAt }, { merge: true });

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
    from: "vertica@mathiasqm.dk",
    to: email,
    subject: `Your OTP Code: ${otp}`,
    text: `Your OTP code is ${otp}`,
  };

  await transporter.sendMail(mailOptions);

  // return { message: 'OTP sent' };
});
