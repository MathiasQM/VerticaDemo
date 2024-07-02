import { getAuth, signInWithCustomToken } from "firebase/auth";
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore";

// Utility functions

// Convert ArrayBuffer to Base64 URL-safe string
export const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// Convert Base64 URL-safe string to ArrayBuffer
export const base64urlToArrayBuffer = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Set session cookie
export const setSessionCookie = async (idToken: string): Promise<void> => {
  const response = await fetch("https://vertica.mathiasqm.dk/setAuthCookie", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to set session cookie");
  }
};

// Sign in with custom token and get ID token
export const signInWithCustomTokenAndGetIdToken = async (customToken: string): Promise<string> => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error("Error signing in with custom token:", error);
    throw error;
  }
};

// Check if email exists in Firestore
export const checkIfEmailExists = async (email: string): Promise<{ emailExists: boolean; authMethods: string[] }> => {
  const db = getFirestore();
  const usersCollection = collection(db, "Users");
  const q = query(usersCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  let authMethods: string[] = [];
  if (!querySnapshot.empty) {
    // Assuming email is unique and there's only one matching document
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    authMethods = data.authMethods || [];
  }

  return { emailExists: !querySnapshot.empty, authMethods };
};
