import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Handle auth state changes and store token
auth.onAuthStateChanged(async (user) => {
    if (user) {
      const token = await user.getIdToken();
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  });
export {auth};

// Export providers
export const provider = new GoogleAuthProvider();
// Force account selection on Google Sign-In
provider.setCustomParameters({
    prompt: 'select_account',
});


// export db functions
export const db = getFirestore(app);