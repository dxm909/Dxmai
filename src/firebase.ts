import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, onSnapshot, updateDoc } from "firebase/firestore";

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();

export const getNextUserNumber = async () => {
  const counterRef = doc(db, 'counters', 'users');
  const counterDoc = await getDoc(counterRef);
  
  if (!counterDoc.exists()) {
    await setDoc(counterRef, { count: 1 });
    return 1;
  }
  
  const newCount = (counterDoc.data().count || 0) + 1;
  await updateDoc(counterRef, { count: newCount });
  return newCount;
};

export { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, serverTimestamp, onSnapshot, sendPasswordResetEmail, updateProfile, updateDoc };
export type { User };
