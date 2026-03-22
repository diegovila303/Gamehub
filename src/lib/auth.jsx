import { createContext, useContext, useEffect, useState } from "react"
import { auth, googleProvider, db } from "./firebase"
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
            status: "offline",
            createdAt: new Date().toISOString()
          })
        }
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
    })
    return unsub
  }, [])

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading: user === undefined, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
