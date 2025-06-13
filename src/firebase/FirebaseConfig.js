import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { firebaseConfig, recaptcha } from "../config/keys";

// 🚀 Inicializa Firebase
const app = initializeApp(firebaseConfig);

if (process.env.NODE_ENV === "development") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(recaptcha),
  isTokenAutoRefreshEnabled: true,
});

const auth = getAuth(app);
const authGoogle = new GoogleAuthProvider(app);

const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

export { app, appCheck, auth, authGoogle, db };
