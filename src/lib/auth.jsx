import { createContext, useContext, useEffect, useState } from "react"
import { auth, googleProvider, db } from "./firebase"
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const ref = doc(db, "users", result.user.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            avatar: result.user.photoURL,
            status: "offline",
            createdAt: new Date().toISOString()
          })
        }
      }
    }).catch(console.error)

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null)
    })
    return unsub
  }, [])

  const loginWithGoogle = () => signInWithRedirect(auth, googleProvider)
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
