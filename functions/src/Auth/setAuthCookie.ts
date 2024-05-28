// functions/Auth/setAuthCookie.ts
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import cors from "cors";
import type { Request, Response } from "express";

const auth = admin.auth();

const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://app.brandbrainai.com",
  "https://auth.brandbrainai.com",
  "https://www.brandbrainai.com",
  "https://brandbrainai.com",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export const setAuthCookie = functions.https.onRequest((req: Request, res: Response) => {
  const corsHandler = cors(corsOptions);
  corsHandler(req, res, async () => {
    const { idToken } = req.body;
    const token = idToken.toString();

    try {
      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;
      console.log("uid:", uid);

      // Set session expiration time (5 Days)
      const expiresIn = 60 * 60 * 24 * 5 * 1000;

      // Create the session cookie
      let sessionCookie: string;
      try {
        sessionCookie = await auth.createSessionCookie(token, { expiresIn });
      } catch (error) {
        console.log("Error creating session cookie:", error);
        res.status(500).send({ error: "Internal Server Error" });
        return;
      }

      console.log("Session Cookie:", sessionCookie);
      // Set the cookie with the appropriate options
      const options: CookieOptions = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        domain: ".brandbrainai.com", // Make it accessible across all subdomains
        path: "/",
        sameSite: "lax" as const, // Correctly specify the literal type
      };

      res.cookie("__session", sessionCookie, options);
      res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Error setting auth cookie:", error);
      res.status(401).send({ error: "Unauthorized" });
    }
  });
});

interface CookieOptions {
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  domain: string;
  path: string;
  sameSite: "lax" | "strict" | "none";
}
