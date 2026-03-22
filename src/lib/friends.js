import { useEffect, useState } from 'react'
import { db } from './firebase'
import { useAuth } from './auth'
import { createNotification } from './notifications'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc
} from 'firebase/firestore'

export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])

  useEffect(() => {
    if (!user) return

    const q1 = query(collection(db, 'friendRequests'),
      where('to', '==', user.uid), where('status', '==', 'pending'))
    const u1 = onSnapshot(q1, async snap => {
      const requests = await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        const fromSnap = await getDoc(doc(db, 'users', data.from))
        return { id: d.id, ...data, fromUser: fromSnap.data() }
      }))
      setIncoming(requests)
    })

    const q2 = query(collection(db, 'friendRequests'),
      where('from', '==', user.uid), where('status', '==', 'pending'))
    const u2 = onSnapshot(q2, snap => {
      setOutgoing(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    let fromFriends = []
    let toFriends = []

    const mergeFriends = () => setFriends([...fromFriends, ...toFriends])

    const q3 = query(collection(db, 'friendRequests'),
      where('from', '==', user.uid), where('status', '==', 'accepted'))
    const u3 = onSnapshot(q3, async snap => {
      const list = await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        const friendSnap = await getDoc(doc(db, 'users', data.to))
        return { requestId: d.id, ...friendSnap.data() }
      }))
      fromFriends = list
      mergeFriends()
    })

    const q4 = query(collection(db, 'friendRequests'),
      where('to', '==', user.uid), where('status', '==', 'accepted'))
    const u4 = onSnapshot(q4, async snap => {
      const list = await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        const friendSnap = await getDoc(doc(db, 'users', data.from))
        return { requestId: d.id, ...friendSnap.data() }
      }))
      toFriends = list
      mergeFriends()
    })

    return () => { u1(); u2(); u3(); u4() }
  }, [user])

  const sendRequest = async (toUid) => {
    if (!user) return
    const existing = query(collection(db, 'friendRequests'),
      where('from', '==', user.uid), where('to', '==', toUid))
    const snap = await getDocs(existing)
    if (!snap.empty) return { error: 'Ya enviaste una solicitud' }

    const existing2 = query(collection(db, 'friendRequests'),
      where('from', '==', toUid), where('to', '==', user.uid))
    const snap2 = await getDocs(existing2)
    if (!snap2.empty) return { error: 'Este usuario ya te envió una solicitud' }

    await addDoc(collection(db, 'friendRequests'), {
      from: user.uid,
      to: toUid,
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    // Notificar al destinatario
    await createNotification(toUid, 'friend_request', {
      fromUid: user.uid,
      message: `${user.displayName} te envió una solicitud de amistad`
    })

    return { success: true }
  }

  const acceptRequest = async (requestId, fromUid) => {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' })
    // Notificar al que envió la solicitud
    if (fromUid) {
      await createNotification(fromUid, 'friend_request', {
        fromUid: user.uid,
        message: `${user.displayName} aceptó tu solicitud de amistad`
      })
    }
  }

  const rejectRequest = async (requestId) => {
    await deleteDoc(doc(db, 'friendRequests', requestId))
  }

  const removeFriend = async (requestId) => {
    await deleteDoc(doc(db, 'friendRequests', requestId))
  }

  const searchByUsername = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username))
    const snap = await getDocs(q)
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  }

  return { friends, incoming, outgoing, sendRequest, acceptRequest, rejectRequest, removeFriend, searchByUsername }
}
