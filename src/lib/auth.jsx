import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider, db } from './firebase'
import { signInWithRedirect, signInWithPopup, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const isPWA = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

async function ensureUserDoc(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const base = (firebaseUser.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user'
    const tag = Math.floor(1000 + Math.random() * 9000)
    await setDoc(ref, {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      avatar: firebaseUser.photoURL,
      username: base + '#' + tag,
      status: 'offline',
      current_game: null,
      scheduled_time: null,
      bio: '',
      favoriteGames: [],
      createdAt: new Date().toISOString()
    })
  }
  const fresh = await getDoc(ref)
  return { ...firebaseUser, ...fresh.data() }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Manejar resultado de redirect (solo en navegador normal)
    if (!isPWA()) {
      getRedirectResult(auth).catch(console.error)
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await ensureUserDoc(firebaseUser)
          setUser(userData)
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
    try {
      // En PWA o móvil usar popup, en escritorio usar redirect
      if (isPWA() || isMobile()) {
        await signInWithPopup(auth, googleProvider)
      } else {
        await signInWithRedirect(auth, googleProvider)
      }
    } catch (e) {
      // Si popup falla, intentar redirect
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider)
      } else {
        console.error(e)
      }
    }
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
