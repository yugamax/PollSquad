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
  setDoc,
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
  await setDoc(doc(db, 'users', uid), {
    uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    points: 0,
    createdAt: serverTimestamp(),
    settings: {
      emailNotifications: true,
      profileVisibility: true // Default to visible
    },
    profile: {
      bio: '',
      college: '',
      course: '',
      year: '',
      location: '',
      interests: []
    }
  })
}

// Add function to get user profile for display
export async function getUserProfile(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) return null
    
    const userData = userDoc.data() as User
    
    // Only return profile info if visibility is enabled
    if (!userData.settings?.profileVisibility) {
      return {
        displayName: userData.displayName,
        photoURL: null, // Hide profile picture
        profile: null // Hide profile details
      }
    }
    
    return {
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      profile: userData.profile
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Poll operations
export async function createPoll(poll: Omit<Poll, 'pollId' | 'createdAt' | 'totalVotes'>) {
  try {
    console.log('Creating poll in Firestore:', poll)
    
    // Filter out undefined values to prevent Firestore errors
    const pollData = {
      ownerUid: poll.ownerUid,
      ownerName: poll.ownerName,
      ...(poll.ownerImage && { ownerImage: poll.ownerImage }),
      title: poll.title,
      ...(poll.description && { description: poll.description }),
      questions: poll.questions,
      tags: poll.tags || [],
      createdAt: serverTimestamp(),
      totalVotes: 0,
      visible: true
    }
    
    console.log('Filtered poll data for Firestore:', pollData)
    
    const pollRef = await addDoc(collection(db, 'polls'), pollData)
    
    console.log('Poll created successfully with ID:', pollRef.id)
    return pollRef.id
  } catch (error) {
    console.error('Error creating poll in Firestore:', error)
    throw error
  }
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
  console.log('🚀 getFeedPolls called - starting execution')
  
  try {
    console.log('🔗 Testing Firestore connection...')
    console.log('Project ID:', db.app.options.projectId)
    
    const pollsCollection = collection(db, 'polls')
    console.log('📊 Fetching polls from Firestore...')
    
    const snapshot = await getDocs(pollsCollection)
    console.log('✅ getDocs completed, snapshot size:', snapshot.size)
    
    if (snapshot.empty) {
      console.log('📭 No polls found in database')
      return []
    }

    const polls = []
    snapshot.docs.forEach((doc, index) => {
      try {
        const data = doc.data()
        console.log(`📋 Processing poll ${index + 1}:`, doc.id)
        
        if (data.visible === true && data.questions && Array.isArray(data.questions)) {
          const poll = {
            pollId: doc.id,
            ownerUid: data.ownerUid || 'unknown',
            ownerName: data.ownerName || 'Anonymous',
            ownerImage: data.ownerImage,
            title: data.title || 'Untitled',
            description: data.description,
            questions: data.questions,
            tags: data.tags || [],
            totalVotes: data.totalVotes || 0,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            boostedUntil: data.boostedUntil?.toDate?.(),
            expiresAt: data.expiresAt?.toDate?.(),
            visible: true
          }
          polls.push(poll)
          console.log('✅ Added poll to results:', poll.title)
        } else {
          console.log('❌ Skipped poll (invalid structure):', doc.id)
        }
      } catch (docError) {
        console.error(`❌ Error processing poll ${doc.id}:`, docError)
      }
    })

    // Sort by date (newest first)
    polls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    console.log(`🎯 Final result: ${polls.length} valid polls`)
    return polls
    
  } catch (error) {
    console.error('💥 getFeedPolls FATAL ERROR:', error)
    
    if (error.code === 'permission-denied') {
      console.error('🔒 PERMISSION DENIED: Check Firestore security rules')
      console.error('   Make sure polls collection allows public read access')
    } else if (error.code === 'unavailable') {
      console.error('🛡️ FIRESTORE UNAVAILABLE: Network or connection issue')
    }
    
    // Re-throw the error so the UI can handle it
    throw error
  }
}

export async function getUserPolls(uid: string) {
  try {
    const constraints: QueryConstraint[] = [
      where('ownerUid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    ]
    
    return getPolls(constraints)
  } catch (error) {
    console.error('Error fetching user polls:', error)
    return []
  }
}

// Vote operations
export async function submitVote(vote: Omit<Vote, 'voteId' | 'createdAt'>) {
  console.log('🗳️ Submitting vote:', vote)
  
  try {
    // First, check if user has already voted on this question
    const existingVotes = await getUserVotesForPoll(vote.userUid, vote.pollId)
    const alreadyVoted = existingVotes.some(v => v.questionId === vote.questionId)
    
    if (alreadyVoted) {
      throw new Error('User has already voted on this question')
    }

    // Add the vote record
    const voteRef = await addDoc(collection(db, 'votes'), {
      ...vote,
      createdAt: serverTimestamp()
    })
    
    console.log('✅ Vote recorded with ID:', voteRef.id)

    // Update poll question vote counts
    const poll = await getPoll(vote.pollId)
    if (poll) {
      console.log('📊 Updating poll vote counts for:', vote.pollId)
      
      const updatedQuestions = poll.questions.map(q => {
        if (q.id === vote.questionId) {
          console.log(`🎯 Updating question: ${q.question}`)
          console.log(`📈 Selected options:`, vote.selectedOptions)
          
          const updatedOptions = q.options.map(opt => {
            const newVoteCount = vote.selectedOptions.includes(opt.id)
              ? opt.votesCount + 1
              : opt.votesCount
            
            console.log(`   Option "${opt.text}": ${opt.votesCount} -> ${newVoteCount}`)
            
            return {
              ...opt,
              votesCount: newVoteCount
            }
          })
          
          const newQuestionTotal = q.totalVotes + 1
          console.log(`🔢 Question total votes: ${q.totalVotes} -> ${newQuestionTotal}`)
          
          return {
            ...q,
            options: updatedOptions,
            totalVotes: newQuestionTotal
          }
        }
        return q
      })
      
      // Calculate new total votes for the entire poll
      const newTotalVotes = updatedQuestions.reduce((sum, q) => sum + q.totalVotes, 0)
      console.log(`🏆 Poll total votes: ${poll.totalVotes} -> ${newTotalVotes}`)
      
      // Update the poll document
      await updatePoll(vote.pollId, {
        questions: updatedQuestions,
        totalVotes: newTotalVotes
      })
      
      console.log('✅ Poll vote counts updated successfully')
    }
    
    return voteRef.id
  } catch (error) {
    console.error('❌ Error submitting vote:', error)
    throw error
  }
}

export async function getUserVotesForPoll(uid: string, pollId: string) {
  console.log('🔍 Getting user votes for poll:', { uid, pollId })
  
  try {
    const constraints: QueryConstraint[] = [
      where('userUid', '==', uid),
      where('pollId', '==', pollId)
    ]
    
    const q = query(collection(db, 'votes'), ...constraints)
    const querySnapshot = await getDocs(q)
    
    const votes = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      voteId: doc.id,
      createdAt: doc.data().createdAt?.toDate()
    })) as Vote[]
    
    console.log('📊 Found votes:', votes.length)
    return votes
  } catch (error) {
    console.error('❌ Error getting user votes:', error)
    return []
  }
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
