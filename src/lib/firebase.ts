import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDuw8fn44AAJxJHt_MPEZVF2ogV1kin3GI",
  authDomain: "bakkers-website-847ba.firebaseapp.com",
  projectId: "bakkers-website-847ba",
  storageBucket: "bakkers-website-847ba.firebasestorage.app",
  messagingSenderId: "794560996753",
  appId: "1:794560996753:web:09b0beb75b672336746630",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
