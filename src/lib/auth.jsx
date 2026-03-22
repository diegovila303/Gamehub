import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider, db } from './firebase'
import { signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

const AuthContext = createContext(null)

async function generateUsername(displayName) {
  const base = (displayName || 'user').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user'
  const tag = Math.floor(1000 + Math.random() * 9000)
  return `${base}#${tag}`
}

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
            const username = await generateUsername(firebaseUser.displayName)
            await setDoc(ref, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL,
              username,
              status: 'offline',
              current_game: null,
              scheduled_time: null,
              bio: '',
              favoriteGames: [],
              createdAt: new Date().toISOString()
            })
            const newSnap = await getDoc(ref)
            setUser({ ...firebaseUser, ...newSnap.data() })
          } else {
            setUser({ ...firebaseUser, ...snap.data() })
          }
        } catch (e) {
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
