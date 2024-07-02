import * as functions from "firebase-functions";
import admin from "firebase-admin";
import cors from "cors";

const auth = admin.auth();

const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://webauthndemo-d542b.web.app",
  "https://webauthndemo-d542b.firebaseapp.com",
  "https://vertica.mathiasqm.dk",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export const setAuthCookie = functions.https.onRequest(async (req, res) => {
  const corsHandler = cors(corsOptions);
  corsHandler(req, res, async () => {
    const { idToken } = req.body;
    const token = idToken.toString();

    try {
      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;

      // Set session expiration time (5 Days)
      const expiresIn = 60 * 60 * 24 * 5 * 1000;

      // Create the session cookie
      let sessionCookie;
      try {
        sessionCookie = await auth.createSessionCookie(token, { expiresIn });
      } catch (error) {
        console.log("Error creating session cookie:", error);
      }

      console.log("Session Cookie:", sessionCookie);
      // Set the cookie with the appropriate options
      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        domain: ".mathiasqm.dk", // Make it accessible across all subdomains
        path: "/",
        sameSite: "Lax",
      };

      res.cookie("__session", sessionCookie, options);
      res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Error setting auth cookie:", error);
      res.status(401).send({ error: "Unauthorized" });
    }
  });
});
