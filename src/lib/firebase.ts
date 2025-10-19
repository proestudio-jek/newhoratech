import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWMZVt5HN-fWfcem_33cukV3xXsQBlzkk",
  authDomain: "studio-9537614342-74580.firebaseapp.com",
  projectId: "studio-9537614342-74580",
  storageBucket: "studio-9537614342-74580.appspot.com",
  messagingSenderId: "903389706855",
  appId: "1:903389706855:web:44b4024e18b9fc5302f2c2"
};

// Singleton para garantir que o Firebase seja inicializado apenas uma vez.
function getFirebaseClient() {
  if (getApps().length) {
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } else {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  }
}

export { getFirebaseClient };
