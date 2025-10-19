
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWMZVt5HN-fWfcem_33cukV3xXsQBlzkk",
  authDomain: "studio-9537614342-74580.firebaseapp.com",
  projectId: "studio-9537614342-74580",
  storageBucket: "studio-9537614342-74580.appspot.com",
  messagingSenderId: "903389706855",
  appId: "1:903389706855:web:44b4024e18b9fc5302f2c2"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, db, auth };
