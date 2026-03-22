import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider, db } from './firebase'
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)
          if (!snap.exists()) {
            await setDoc(ref, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL,
              status: 'offline',
              current_game: null,
              scheduled_time: null,
              createdAt: new Date().toISOString()
            })
          }
          const updatedSnap = await getDoc(ref)
          setUser({ ...firebaseUser, ...updatedSnap.data() })
        } catch(e) {
          console.error(e)
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithGoogle = async () => {
    await signInWithRedirect(auth, googleProvider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
