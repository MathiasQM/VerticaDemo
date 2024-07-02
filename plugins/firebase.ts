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
    apiKey: "AIzaSyBxEGaO7Yw-1A89KO1DAn79vDMuAwoT-Aw",
    authDomain: "webauthndemo-d542b.firebaseapp.com",
    projectId: "webauthndemo-d542b",
    storageBucket: "webauthndemo-d542b.appspot.com",
    messagingSenderId: "367123721940",
    appId: "1:367123721940:web:5deecff69243cc2fa85541",
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
