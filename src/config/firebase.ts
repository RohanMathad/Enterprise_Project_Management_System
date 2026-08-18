import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// 1. Initialize from Vite Environment Variables as requested
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let config = firebaseConfig;
let databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// 2. Fallback to AI Studio's auto-generated config if env vars are not set
try {
  // Safely import the config file using Vite's glob import
  const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
  const autoConfig = configs['../../firebase-applet-config.json'] as any;
  
  if (autoConfig && !config.apiKey) {
    config = autoConfig.default || autoConfig;
    databaseId = (config as any).firestoreDatabaseId;
  }
} catch (error) {
  console.warn('No auto-generated firebase config found.');
}

// 3. Initialize Firebase
const app = initializeApp(config);

// 4. Export Auth and Firestore instances
export const auth = getAuth(app);

// In AI Studio, we need to pass the explicit databaseId if provided
export const db = databaseId 
  ? initializeFirestore(app, {}, databaseId) 
  : getFirestore(app);
