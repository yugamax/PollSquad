import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { DataRequest } from './db-types'

export async function submitDataRequest(
  pollId: string,
  requesterUid: string,
  requesterName: string,
  requesterEmail: string,
  pollTitle: string
): Promise<string> {
  const reqRef = await addDoc(collection(db, 'requests'), {
    pollId,
    requesterUid,
    requesterName,
    requesterEmail,
    pollTitle,
    status: 'pending',
    createdAt: serverTimestamp()
  })
  return reqRef.id
}

export async function getPendingRequestsForPoll(pollId: string): Promise<DataRequest[]> {
  const q = query(
    collection(db, 'requests'),
    where('pollId', '==', pollId),
    where('status', '==', 'pending')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    reqId: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    respondedAt: doc.data().respondedAt?.toDate()
  })) as DataRequest[]
}

export async function approveDataRequest(
  reqId: string,
  approverUid: string
): Promise<void> {
  await updateDoc(doc(db, 'requests', reqId), {
    status: 'approved',
    respondedAt: serverTimestamp(),
    approverUid
  })
}

export async function denyDataRequest(
  reqId: string,
  approverUid: string
): Promise<void> {
  await updateDoc(doc(db, 'requests', reqId), {
    status: 'denied',
    respondedAt: serverTimestamp(),
    approverUid
  })
}

export async function checkExistingRequest(
  pollId: string,
  requesterUid: string
): Promise<DataRequest | null> {
  const q = query(
    collection(db, 'requests'),
    where('pollId', '==', pollId),
    where('requesterUid', '==', requesterUid)
  )
  
  const snapshot = await getDocs(q)
  if (snapshot.docs.length === 0) return null
  
  const data = snapshot.docs[0].data()
  return {
    ...data,
    reqId: snapshot.docs[0].id,
    createdAt: data.createdAt?.toDate(),
    respondedAt: data.respondedAt?.toDate()
  } as DataRequest
}
