// functions/Auth/utils.js
import crypto from "crypto";
import admin from "firebase-admin";

const auth = admin.auth();
export const generateChallenge = () => {
  return crypto.randomBytes(32).toString("base64");
};

export const getClientData = (clientDataJSON) => {
  return JSON.parse(Buffer.from(clientDataJSON, "base64").toString());
};

export const setAuthCookie = async (responseOrContext, token, isCallable = false) => {
  try {
    // Verify the custom token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Set session expiration time (5 Days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });

    // Set the cookie with the appropriate options
    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      domain: ".mathiasqm.dk", // Make it accessible across all subdomains
      sameSite: "Lax",
    };

    // Set the cookie based on whether it's a callable or onRequest context
    if (isCallable) {
      responseOrContext.rawRequest.res.cookie("__session", sessionCookie, options);
    } else {
      responseOrContext.cookie("__session", sessionCookie, options);
      responseOrContext.json({ status: "success" });
    }
  } catch (error) {
    console.error("Error setting auth cookie:", error);
    if (isCallable) {
      responseOrContext.rawRequest.res.status(401).send({ error: "Unauthorized" });
    } else {
      responseOrContext.status(401).send({ error: "Unauthorized" });
    }
  }
};
