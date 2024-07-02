import { defineNuxtConfig } from "nuxt/config";
import dotenv from "dotenv";

dotenv.config();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/styles/tailwind.css"],
  modules: ["nuxt-icons", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
  typescript: {
    typeCheck: true,
    strict: true,
  },
  runtimeConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  nitro: {
    prerender: {
      routes: ["/"],
      ignore: ["/protected"],
    },
  },
  plugins: [{ src: "~/plugins/firebase.ts", ssr: false }],
});
