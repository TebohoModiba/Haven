import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4hci1QSdzd05MIheKAHPThi44nFPWXx0",
  authDomain: "haven-1cc84.firebaseapp.com",
  projectId: "haven-1cc84",
  storageBucket: "haven-1cc84.firebasestorage.app",
  messagingSenderId: "569778460243",
  appId: "1:569778460243:web:437f878df20faf76bb98a6",
  measurementId: "G-KQPMWVBDCQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
