"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.appId
);

export const app = firebaseReady && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = firebaseReady && app ? getAuth(app) : null;
export const db = firebaseReady && app ? getFirestore(app) : null;
export const storage = firebaseReady && app ? getStorage(app) : null;

export const allowedEmails = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const signupEnabled = process.env.NEXT_PUBLIC_ENABLE_SIGNUP === "true";

export function isAllowedEmail(email?: string | null) {
  if (!allowedEmails.length) return false;
  return Boolean(email && allowedEmails.includes(email.toLowerCase()));
}
