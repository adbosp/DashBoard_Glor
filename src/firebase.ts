import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC9GkQh5ls5HfNtTGGU7CH-9jCNcAxmrfA",
  authDomain: "glorgames-web.firebaseapp.com",
  projectId: "glorgames-web",

  // 🔥 FIX Ở ĐÂY
  storageBucket: "glorgames-web.appspot.com",

  messagingSenderId: "356613565549",
  appId: "1:356613565549:web:ed0e6d63606cd15d902364",
  measurementId: "G-C4FM7M4JCW"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
