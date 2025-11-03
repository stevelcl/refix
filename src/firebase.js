// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrrI11yORfMuqg1lZzEDNJ_IFN5wDXsW0",
  authDomain: "refix-78400.firebaseapp.com",
  projectId: "refix-78400",
  storageBucket: "refix-78400.firebasestorage.app",
  messagingSenderId: "1064929496059",
  appId: "1:1064929496059:web:dea0cfc8b143cd3ac0d95e",
  measurementId: "G-XP0G4PKQFM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

