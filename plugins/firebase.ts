import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { defineNuxtPlugin } from "#app";
// @ts-ignore
import { useRuntimeConfig } from "#imports";
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
  const config = useRuntimeConfig();

  // Firebase configuration
  const firebaseConfig: FirebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
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
