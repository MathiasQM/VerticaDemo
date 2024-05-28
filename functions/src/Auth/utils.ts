// functions/Auth/utils.ts
import crypto from "crypto";
import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v1/https";
import type { CallableContext } from "firebase-functions/v1/https";

const auth = admin.auth();

export const generateChallenge = (): string => {
  return crypto.randomBytes(32).toString("base64");
};

export const getClientData = (clientDataJSON: string): Record<string, any> => {
  return JSON.parse(Buffer.from(clientDataJSON, "base64").toString());
};

interface HttpResponse {
  cookie: (name: string, value: string, options: CookieOptions) => void;
  status: (code: number) => {
    send: (body: any) => void;
    json: (body: any) => void;
  };
}

interface CookieOptions {
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  domain: string;
  path: string;
  sameSite: "lax" | "strict" | "none";
}

export const setAuthCookie = async (
  responseOrContext: CallableContext | { req: { headers: { cookie: string } }; res: HttpResponse },
  token: string,
  isCallable = false
): Promise<void> => {
  try {
    // Verify the custom token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    console.log("uid:", uid);
    // Set session expiration time (5 Days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });

    // Set the cookie with the appropriate options
    const options: CookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      domain: ".brandbrainai.com",
      path: "/",
      sameSite: "lax",
    };

    // Set the cookie based on whether it's a callable or onRequest context
    if (isCallable) {
      const context = responseOrContext as CallableContext;
      if (!context.rawRequest || !context.rawRequest.res) {
        throw new HttpsError("internal", "Response object is not available.");
      }
      context.rawRequest.res.cookie("__session", sessionCookie, options);
      context.rawRequest.res.status(200).json({ status: "success" });
    } else {
      const { res } = responseOrContext as {
        req: { headers: { cookie: string } };
        res: HttpResponse;
      };
      res.cookie("__session", sessionCookie, options);
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    console.error("Error setting auth cookie:", error);
    if (isCallable) {
      const context = responseOrContext as CallableContext;
      if (context.rawRequest && context.rawRequest.res) {
        context.rawRequest.res.status(401).send({ error: "Unauthorized" });
      }
    } else {
      const { res } = responseOrContext as {
        req: { headers: { cookie: string } };
        res: HttpResponse;
      };
      res.status(401).send({ error: "Unauthorized" });
    }
  }
};
