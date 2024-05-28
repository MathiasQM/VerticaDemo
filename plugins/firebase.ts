import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { defineNuxtPlugin } from "#app";
import type { NuxtApp } from "#app";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  // Firebase configuration
  const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || "",
  };

  let app: FirebaseApp;

  // Initialize Firebase
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp(); // If already initialized, use that instance
  }

  // Provide Firebase services to the app
  nuxtApp.provide("firebase", { app });
});
