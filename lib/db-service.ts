import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Query,
  QueryConstraint,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { Poll, Vote, DataRequest, User, PollOption } from './db-types'

// User operations
export async function getUserData(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid))
  return userDoc.data() as User | undefined
}

export async function createUserData(uid: string, user: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), {
    uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    points: 0,
    createdAt: serverTimestamp(),
    settings: {
      emailNotifications: true
    }
  })
}

// Poll operations
export async function createPoll(poll: Omit<Poll, 'pollId' | 'createdAt' | 'totalVotes'>) {
  const pollRef = await addDoc(collection(db, 'polls'), {
    ...poll,
    createdAt: serverTimestamp(),
    totalVotes: 0
  })
  return pollRef.id
}

export async function getPoll(pollId: string) {
  const docSnap = await getDoc(doc(db, 'polls', pollId))
  if (!docSnap.exists()) return null
  
  const data = docSnap.data()
  return {
    ...data,
    pollId: docSnap.id,
    createdAt: data.createdAt?.toDate(),
    boostedUntil: data.boostedUntil?.toDate(),
    expiresAt: data.expiresAt?.toDate()
  } as Poll
}

export async function updatePoll(pollId: string, updates: Partial<Poll>) {
  await updateDoc(doc(db, 'polls', pollId), {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deletePoll(pollId: string) {
  await deleteDoc(doc(db, 'polls', pollId))
}

export async function getPolls(constraints: QueryConstraint[] = []) {
  const q = query(collection(db, 'polls'), ...constraints)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    pollId: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    boostedUntil: doc.data().boostedUntil?.toDate(),
    expiresAt: doc.data().expiresAt?.toDate()
  })) as Poll[]
}

export async function getFeedPolls() {
  const now = new Date()
  const constraints: QueryConstraint[] = [
    where('visible', '==', true),
    where('expiresAt', '>', now),
    orderBy('boostedUntil', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(50)
  ]
  
  return getPolls(constraints)
}

export async function getUserPolls(uid: string) {
  const constraints: QueryConstraint[] = [
    where('ownerUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(100)
  ]
  
  return getPolls(constraints)
}

// Vote operations
export async function submitVote(vote: Omit<Vote, 'voteId' | 'createdAt'>) {
  const voteRef = await addDoc(collection(db, 'votes'), {
    ...vote,
    createdAt: serverTimestamp()
  })
  
  // Update poll vote counts
  const poll = await getPoll(vote.pollId)
  if (poll) {
    const updatedOptions = poll.options.map(opt => ({
      ...opt,
      votesCount: vote.selectedOptions.includes(opt.id)
        ? opt.votesCount + 1
        : opt.votesCount
    }))
    
    await updatePoll(vote.pollId, {
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1
    })
  }
  
  return voteRef.id
}

export async function getUserVotesForPoll(uid: string, pollId: string) {
  const constraints: QueryConstraint[] = [
    where('userUid', '==', uid),
    where('pollId', '==', pollId)
  ]
  
  const q = query(collection(db, 'votes'), ...constraints)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    voteId: doc.id,
    createdAt: doc.data().createdAt?.toDate()
  })) as Vote[]
}

// Data Request operations
export async function createDataRequest(request: Omit<DataRequest, 'reqId' | 'createdAt'>) {
  const reqRef = await addDoc(collection(db, 'requests'), {
    ...request,
    createdAt: serverTimestamp()
  })
  return reqRef.id
}

export async function getPollDataRequests(pollId: string) {
  const constraints: QueryConstraint[] = [
    where('pollId', '==', pollId),
    orderBy('createdAt', 'desc')
  ]
  
  const q = query(collection(db, 'requests'), ...constraints)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    reqId: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    respondedAt: doc.data().respondedAt?.toDate()
  })) as DataRequest[]
}

export async function updateDataRequest(reqId: string, status: 'approved' | 'denied', approverUid: string) {
  await updateDoc(doc(db, 'requests', reqId), {
    status,
    respondedAt: serverTimestamp(),
    approverUid
  })
}
