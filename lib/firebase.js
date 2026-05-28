import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import {
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrBOG2YsdQTig4ouklgzlsanVOSqAJzzk",
  authDomain: "growthpact-322d6.firebaseapp.com",
  projectId: "growthpact-322d6",
  storageBucket: "growthpact-322d6.firebasestorage.app",
  messagingSenderId: "500846844343",
  appId: "1:500846844343:web:c5c9bf6d0cfbcb4afb3032",
};

// Initialise app (guard against double-init in hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

// Firestore with offline cache so app loads even without internet
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    }),
  });
} catch {
  // Already initialised (hot reload)
  const { getFirestore } = require("firebase/firestore");
  db = getFirestore(app);
}

export const storage = getStorage(app);
export { auth, db };
export default app;
