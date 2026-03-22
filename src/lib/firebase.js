import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAjb3lebYcLyhkmUU0UZySO-Xy-NuFQwyE",
  authDomain: "gamehub-b14c7.firebaseapp.com",
  projectId: "gamehub-b14c7",
  storageBucket: "gamehub-b14c7.firebasestorage.app",
  messagingSenderId: "612991758867",
  appId: "1:612991758867:web:2de3c42f6def300a9845e6",
  measurementId: "G-NL8YTQB5W1"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
