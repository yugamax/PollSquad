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
    points: 40, // UPDATED: Changed from 25 to 40 points
    completedPolls: [], // NEW: Track completed polls for points
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

// Vote operations - Enhanced to include vote tracking in poll document
export async function submitVote(vote: Omit<Vote, 'voteId' | 'createdAt'>) {
  console.log('🗳️ Submitting vote for user:', vote.userUid, 'on poll:', vote.pollId, 'question:', vote.questionId)
  
  try {
    // CRITICAL FIX: Only check votes for THIS specific user
    console.log('🔍 Checking if THIS USER has already voted...')
    const userSpecificVotes = await getUserVotesForPoll(vote.userUid, vote.pollId)
    const userAlreadyVoted = userSpecificVotes.some(v => 
      v.questionId === vote.questionId && 
      v.userUid === vote.userUid  // Ensure we're only checking this user's votes
    )
    
    console.log('📊 User specific votes found:', userSpecificVotes.length)
    console.log('❓ Has this user already voted on this question?', userAlreadyVoted)
    
    if (userAlreadyVoted) {
      console.log('⚠️ THIS USER has already voted on this question')
      throw new Error(`User ${vote.userUid} has already voted on question ${vote.questionId}`)
    }

    console.log('✅ This user has NOT voted on this question, proceeding...')

    // Add the vote record with explicit user tracking
    const voteData = {
      pollId: vote.pollId,
      questionId: vote.questionId,
      userUid: vote.userUid, // Ensure userUid is explicitly set
      selectedOptions: vote.selectedOptions,
      createdAt: serverTimestamp()
    }
    
    console.log('📝 Creating vote document with data:', voteData)
    const voteRef = await addDoc(collection(db, 'votes'), voteData)
    
    console.log('✅ Vote recorded with ID:', voteRef.id)

    // Update poll question vote counts AND add user to voters list
    const poll = await getPoll(vote.pollId)
    if (poll) {
      console.log('📊 Updating poll vote counts for:', vote.pollId)
      
      // Get current poll document to merge voter tracking
      const pollDoc = await getDoc(doc(db, 'polls', vote.pollId))
      const currentPollData = pollDoc.data()
      
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
      
      // Add user to voters list if not already present
      const currentVoters = currentPollData?.voters || []
      const updatedVoters = currentVoters.includes(vote.userUid) 
        ? currentVoters 
        : [...currentVoters, vote.userUid]
      
      // Update the poll document with vote counts and voter tracking
      await updatePoll(vote.pollId, {
        questions: updatedQuestions,
        totalVotes: newTotalVotes,
        voters: updatedVoters // Track voters in poll document
      })
      
      console.log('✅ Poll vote counts and voter list updated successfully')
    }
    
    return voteRef.id
  } catch (error) {
    console.error('❌ Error submitting vote:', error)
    throw error
  }
}

export async function getUserVotesForPoll(uid: string, pollId: string) {
  console.log('🔍 Getting votes for SPECIFIC USER:', uid, 'on poll:', pollId)
  
  try {
    // CRITICAL: Ensure we're only getting votes for THIS specific user
    const constraints: QueryConstraint[] = [
      where('userUid', '==', uid),  // MUST match exactly
      where('pollId', '==', pollId) // MUST match exactly
    ]
    
    const q = query(collection(db, 'votes'), ...constraints)
    const querySnapshot = await getDocs(q)
    
    const votes = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('📊 Found vote document:', doc.id, 'data:', data)
      return {
        ...data,
        voteId: doc.id,
        createdAt: data.createdAt?.toDate()
      }
    }) as Vote[]
    
    console.log('📊 Total votes found for user', uid, 'on poll', pollId, ':', votes.length)
    
    // Double-check that all votes belong to the requested user
    const validVotes = votes.filter(vote => vote.userUid === uid)
    if (validVotes.length !== votes.length) {
      console.warn('⚠️ Found votes that dont belong to requested user!')
    }
    
    return validVotes
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

// SIMPLIFIED: Check if user has completed all questions using voters array in poll
export async function hasUserCompletedPoll(userUid: string, pollId: string): Promise<boolean> {
  try {
    console.log('🔍 Checking if user has completed entire poll via voters array:', userUid, pollId)
    
    // Get the poll to check voters array and questions
    const poll = await getPoll(pollId)
    if (!poll || !poll.questions) {
      console.log('❌ Poll not found or has no questions')
      return false
    }
    
    // Check if user is in voters array (they've voted at least once)
    if (!poll.voters || !poll.voters.includes(userUid)) {
      console.log('❌ User not found in voters array')
      return false
    }
    
    // Get detailed votes to check completion
    const userVotes = await getUserVotesForPoll(userUid, pollId)
    console.log('📊 User votes found:', userVotes.length, 'Poll questions:', poll.questions.length)
    
    // Check if user has voted on every question
    const votedQuestionIds = new Set(userVotes.map(vote => vote.questionId))
    const hasVotedOnAllQuestions = poll.questions.every(q => votedQuestionIds.has(q.id))
    
    console.log('🎯 Poll completion status:', {
      totalQuestions: poll.questions.length,
      votedQuestions: votedQuestionIds.size,
      completed: hasVotedOnAllQuestions,
      inVotersArray: poll.voters.includes(userUid)
    })
    
    return hasVotedOnAllQuestions
  } catch (error) {
    console.error('❌ Error checking poll completion:', error)
    return false
  }
}

// SIMPLIFIED: Check if user already received points using user document
export async function hasReceivedPollCompletionPoints(userUid: string, pollId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userUid))
    if (!userDoc.exists()) {
      console.log('❌ User document not found')
      return false
    }
    
    const userData = userDoc.data()
    const completedPolls = userData.completedPolls || []
    const hasCompleted = completedPolls.includes(pollId)
    
    console.log('🔍 Poll completion check for user', userUid, 'poll', pollId, '- Already completed:', hasCompleted)
    return hasCompleted
  } catch (error) {
    console.error('❌ Error checking poll completion points:', error)
    return false
  }
}

// NEW: Check if user has voted on any question in a poll using voters array
export async function hasUserVotedOnPoll(userUid: string, pollId: string): Promise<boolean> {
  try {
    console.log('🔍 Checking if user has voted on poll via voters array:', userUid, pollId)
    
    const poll = await getPoll(pollId)
    if (!poll) {
      console.log('❌ Poll not found')
      return false
    }
    
    const hasVoted = poll.voters && poll.voters.includes(userUid)
    console.log('🗳️ User voting status:', hasVoted)
    
    return hasVoted
  } catch (error) {
    console.error('❌ Error checking user vote status:', error)
    return false
  }
}
