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
  try {
    console.log('🔍 getUserData: Fetching user data for UID:', uid)
    
    const userDocRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      console.log('❌ getUserData: User document not found for UID:', uid)
      return null
    }
    
    const userData = userDoc.data()
    console.log('✅ getUserData: User data found:', userData.displayName || userData.email)
    
    return {
      uid: userDoc.id,
      ...userData,
      createdAt: userData.createdAt || null
    }
  } catch (error) {
    console.error('❌ getUserData: Error fetching user data:', error)
    throw error
  }
}

// NEW: Function to check if a user's profile is publicly visible
export async function isProfilePublic(uid: string): Promise<boolean> {
  try {
    const userData = await getUserData(uid)
    if (!userData) return false
    
    // Profile is public by default, or if explicitly set to true
    return userData.settings?.profileVisibility !== false
  } catch (error) {
    console.error('❌ Error checking profile visibility:', error)
    return false
  }
}

// NEW: Function to get public profile data (respects visibility settings)
export async function getPublicProfileData(uid: string, requestingUserUid?: string) {
  try {
    console.log('🔍 getPublicProfileData: Fetching for UID:', uid, 'requested by:', requestingUserUid)
    
    const userData = await getUserData(uid)
    if (!userData) {
      console.log('❌ getPublicProfileData: User not found')
      return null
    }
    
    // If it's the user's own profile, return full data
    if (requestingUserUid === uid) {
      console.log('✅ getPublicProfileData: Own profile, returning full data')
      return userData
    }
    
    // Check if profile is publicly visible
    const isPublic = userData.settings?.profileVisibility !== false
    if (!isPublic) {
      console.log('❌ getPublicProfileData: Profile is private')
      return { isPrivate: true }
    }
    
    console.log('✅ getPublicProfileData: Profile is public, returning data')
    return userData
    
  } catch (error) {
    console.error('❌ getPublicProfileData: Error:', error)
    throw error
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
  try {
    console.log('🗑️ Starting poll deletion process for:', pollId)
    
    // First, delete all votes associated with this poll
    await deleteAllPollVotes(pollId)
    
    // Then delete the poll document
    await deleteDoc(doc(db, 'polls', pollId))
    
    console.log('✅ Poll and all associated votes deleted successfully')
  } catch (error) {
    console.error('❌ Error deleting poll:', error)
    throw error
  }
}

// NEW: Delete all votes for a specific poll
export async function deleteAllPollVotes(pollId: string) {
  try {
    console.log('🗑️ Deleting all votes for poll:', pollId)
    
    // Query all votes for this poll
    const votesQuery = query(
      collection(db, 'votes'),
      where('pollId', '==', pollId)
    )
    
    const votesSnapshot = await getDocs(votesQuery)
    console.log(`📊 Found ${votesSnapshot.size} votes to delete`)
    
    // Delete all votes in batches for better performance
    const deletePromises = votesSnapshot.docs.map(voteDoc => 
      deleteDoc(doc(db, 'votes', voteDoc.id))
    )
    
    await Promise.all(deletePromises)
    console.log(`✅ Successfully deleted ${votesSnapshot.size} votes`)
    
    return votesSnapshot.size
  } catch (error) {
    console.error('❌ Error deleting poll votes:', error)
    throw error
  }
}

// NEW: Clean up user's completed polls array when poll is deleted
export async function removeFromUserCompletedPolls(pollId: string) {
  try {
    console.log('🧹 Cleaning up user completed polls for deleted poll:', pollId)
    
    // Query all users who have this poll in their completedPolls array
    const usersQuery = query(
      collection(db, 'users'),
      where('completedPolls', 'array-contains', pollId)
    )
    
    const usersSnapshot = await getDocs(usersQuery)
    console.log(`👥 Found ${usersSnapshot.size} users to update`)
    
    // Remove the poll from each user's completedPolls array
    const updatePromises = usersSnapshot.docs.map(userDoc => {
      const userData = userDoc.data()
      const updatedCompletedPolls = (userData.completedPolls || []).filter(id => id !== pollId)
      
      return updateDoc(doc(db, 'users', userDoc.id), {
        completedPolls: updatedCompletedPolls,
        lastUpdated: serverTimestamp()
      })
    })
    
    await Promise.all(updatePromises)
    console.log(`✅ Updated ${usersSnapshot.size} user records`)
    
    return usersSnapshot.size
  } catch (error) {
    console.error('❌ Error cleaning up user completed polls:', error)
    throw error
  }
}

// NEW: Delete all data requests for a specific poll
export async function deletePollDataRequests(pollId: string) {
  try {
    console.log('🗑️ Deleting all data requests for poll:', pollId)
    
    const requestsQuery = query(
      collection(db, 'requests'),
      where('pollId', '==', pollId)
    )
    
    const requestsSnapshot = await getDocs(requestsQuery)
    console.log(`📋 Found ${requestsSnapshot.size} data requests to delete`)
    
    const deletePromises = requestsSnapshot.docs.map(requestDoc => 
      deleteDoc(doc(db, 'requests', requestDoc.id))
    )
    
    await Promise.all(deletePromises)
    console.log(`✅ Deleted ${requestsSnapshot.size} data requests`)
    
    return requestsSnapshot.size
  } catch (error) {
    console.error('❌ Error deleting poll data requests:', error)
    throw error
  }
}

// UPDATED: Enhanced poll deletion with complete cleanup
export async function deletePollWithCleanup(pollId: string) {
  try {
    console.log('🗑️ Starting complete poll deletion with cleanup for:', pollId)
    
    // Step 1: Delete all votes
    const deletedVotes = await deleteAllPollVotes(pollId)
    
    // Step 2: Clean up user completed polls arrays
    const updatedUsers = await removeFromUserCompletedPolls(pollId)
    
    // Step 3: Delete all data requests for this poll
    const deletedRequests = await deletePollDataRequests(pollId)
    
    // Step 4: Finally delete the poll itself
    await deleteDoc(doc(db, 'polls', pollId))
    
    console.log('✅ Complete poll deletion finished:', {
      pollId,
      deletedVotes,
      updatedUsers,
      deletedRequests
    })
    
    return {
      deletedVotes,
      updatedUsers,
      deletedRequests
    }
  } catch (error) {
    console.error('❌ Error in complete poll deletion:', error)
    throw error
  }
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
    console.log('📊 Fetching all polls from Firestore...')
    
    const snapshot = await getDocs(pollsCollection)
    console.log('✅ getDocs completed successfully')
    console.log('📈 Snapshot size:', snapshot.size)
    
    if (snapshot.empty) {
      console.log('📭 No polls found in database')
      return []
    }

    const polls = []
    const userProfiles = new Map() // Cache user profiles to avoid duplicate fetches
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data()
        console.log(`📋 Processing poll ${polls.length + 1}:`, doc.id)
        
        if (data.visible === true && data.questions && Array.isArray(data.questions)) {
          // Get user profile data for college info
          let ownerCollege = null
          if (data.ownerUid && !userProfiles.has(data.ownerUid)) {
            try {
              const userData = await getPublicProfileData(data.ownerUid)
              if (userData && !userData.isPrivate) {
                ownerCollege = userData.profile?.college
                userProfiles.set(data.ownerUid, userData)
              } else {
                userProfiles.set(data.ownerUid, null) // Cache null for private profiles
              }
            } catch (userError) {
              console.warn('Could not fetch user data for:', data.ownerUid)
              userProfiles.set(data.ownerUid, null) // Cache null to avoid retry
            }
          } else if (userProfiles.has(data.ownerUid)) {
            const userData = userProfiles.get(data.ownerUid)
            if (userData && !userData.isPrivate) {
              ownerCollege = userData.profile?.college
            }
          }

          const poll = {
            pollId: doc.id,
            ownerUid: data.ownerUid || 'unknown',
            ownerName: data.ownerName || 'Anonymous',
            ownerImage: data.ownerImage,
            ownerCollege: ownerCollege, // Include college info if profile is public
            title: data.title || 'Untitled',
            description: data.description,
            questions: data.questions,
            tags: data.tags || [],
            totalVotes: data.totalVotes || 0,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            boostedUntil: data.boostedUntil?.toDate?.(),
            expiresAt: data.expiresAt?.toDate?.(),
            visible: true,
            boosted: data.boosted || false,
            boostHours: data.boostHours || 0
          }
          polls.push(poll)
          console.log('✅ Added poll to results:', poll.title, poll.boosted ? '(BOOSTED)' : '', ownerCollege ? `(${ownerCollege})` : '')
        } else {
          console.log('❌ Skipped poll (invalid structure):', doc.id)
        }
      } catch (docError) {
        console.error(`❌ Error processing poll ${doc.id}:`, docError)
      }
    }

    // Sort by boost status first, then by date (boosted polls at top)
    polls.sort((a, b) => {
      // Check if polls are currently boosted
      const now = new Date()
      const aIsBoosted = a.boostedUntil && a.boostedUntil > now
      const bIsBoosted = b.boostedUntil && b.boostedUntil > now
      
      if (aIsBoosted && !bIsBoosted) return -1
      if (!aIsBoosted && bIsBoosted) return 1
      
      // If both are boosted or both are not boosted, sort by creation date
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    
    console.log(`🎯 Final result: ${polls.length} valid polls (${polls.filter(p => p.boostedUntil && p.boostedUntil > new Date()).length} boosted)`)
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
    console.log('🔍 Getting user polls for:', uid)
    
    // FIXED: Use simpler query without orderBy to avoid index requirements initially
    const constraints: QueryConstraint[] = [
      where('ownerUid', '==', uid)
    ]
    
    const q = query(collection(db, 'polls'), ...constraints)
    const querySnapshot = await getDocs(q)
    
    const polls = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      pollId: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      boostedUntil: doc.data().boostedUntil?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate()
    })) as Poll[]
    
    // Sort in JavaScript instead of Firestore to avoid index requirement
    polls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    console.log(`✅ Found ${polls.length} polls for user ${uid}`)
    return polls.slice(0, 100) // Limit to 100 most recent
    
  } catch (error) {
    console.error('❌ Error fetching user polls:', error)
    
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.error('🔥 Firestore index required. Please run: firebase deploy --only firestore:indexes')
      
      // Fallback: try without ordering
      try {
        const simpleQuery = query(collection(db, 'polls'), where('ownerUid', '==', uid))
        const snapshot = await getDocs(simpleQuery)
        const polls = snapshot.docs.map(doc => ({
          ...doc.data(),
          pollId: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
          boostedUntil: doc.data().boostedUntil?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate()
        })) as Poll[]
        
        // Sort in JavaScript
        polls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        return polls.slice(0, 100)
        
      } catch (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError)
        return []
      }
    }
    
    return []
  }
}

// Vote operations - Enhanced to include vote tracking in poll document
export async function submitVote(vote: Omit<Vote, 'voteId' | 'createdAt'>) {
  console.log('🗳️ Submitting vote for user:', vote.userUid, 'on poll:', vote.pollId, 'question:', vote.questionId)
  
  try {
    // CRITICAL FIX: More precise vote checking
    console.log('🔍 Checking if THIS SPECIFIC USER has already voted on THIS SPECIFIC QUESTION...')
    
    // Query for votes from this exact user on this exact question
    const existingVoteQuery = query(
      collection(db, 'votes'),
      where('userUid', '==', vote.userUid),
      where('pollId', '==', vote.pollId),
      where('questionId', '==', vote.questionId)
    )
    
    const existingVoteSnapshot = await getDocs(existingVoteQuery)
    
    console.log('📊 Vote check results:', {
      userUid: vote.userUid,
      pollId: vote.pollId, 
      questionId: vote.questionId,
      existingVotes: existingVoteSnapshot.size
    })
    
    if (existingVoteSnapshot.size > 0) {
      console.log('⚠️ User has already voted on this specific question')
      console.log('📋 Existing vote details:', existingVoteSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })))
      throw new Error(`User ${vote.userUid} has already voted on question ${vote.questionId}`)
    }

    console.log('✅ No existing vote found, proceeding with vote submission...')

    // Add the vote record with explicit user tracking
    const voteData = {
      pollId: vote.pollId,
      questionId: vote.questionId,
      userUid: vote.userUid, // Ensure userUid is explicitly set
      selectedOptions: vote.selectedOptions,
      createdAt: serverTimestamp()
    }
    
    console.log('📝 Creating vote document with data:', voteData)
    
    let voteRef
    try {
      voteRef = await addDoc(collection(db, 'votes'), voteData)
      console.log('✅ Vote recorded with ID:', voteRef.id)
    } catch (voteError) {
      console.error('❌ Error creating vote document:', voteError)
      if (voteError.code === 'permission-denied') {
        throw new Error('Permission denied when creating vote. Please check Firestore rules.')
      }
      throw voteError
    }

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
      try {
        await updatePoll(vote.pollId, {
          questions: updatedQuestions,
          totalVotes: newTotalVotes,
          voters: updatedVoters,
          lastUpdated: serverTimestamp()
        })
        console.log('✅ Poll vote counts and voter list updated successfully')
      } catch (updateError) {
        console.error('❌ Error updating poll counts:', updateError)
        if (updateError.code === 'permission-denied') {
          throw new Error('Permission denied when updating poll counts. Please check Firestore rules.')
        }
        throw updateError
      }
    }
    
    return voteRef.id
  } catch (error) {
    console.error('❌ Error submitting vote:', error)
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      console.error('🔒 Permission denied details:', error.message)
      throw new Error('Permission denied. Please ensure you are signed in and try again.')
    } else if (error.code === 'unavailable') {
      throw new Error('Database temporarily unavailable. Please try again.')
    } else if (error.message?.includes('already voted')) {
      throw error // Re-throw as-is for duplicate vote detection
    }
    
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
      console.log('📊 Found vote document:', doc.id, 'userUid:', data.userUid, 'matches requested uid:', data.userUid === uid)
      return {
        ...data,
        voteId: doc.id,
        createdAt: data.createdAt?.toDate()
      }
    }) as Vote[]
    
    console.log('📊 Total votes found for user', uid, 'on poll', pollId, ':', votes.length)
    
    // Extra validation to ensure all votes belong to the requested user
    const validVotes = votes.filter(vote => vote.userUid === uid)
    if (validVotes.length !== votes.length) {
      console.warn('⚠️ Found votes that dont belong to requested user!', {
        total: votes.length,
        valid: validVotes.length,
        requestedUid: uid
      })
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
      inVotersArray: poll.voters.includes(userUid),
      isOwner: poll.ownerUid === userUid // NEW: Track if user is owner
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

// NEW: Create or update user document with initial data
export async function createUserData(uid: string, userData: any) {
  try {
    console.log('🔄 createUserData: Creating user document for UID:', uid)
    
    const userDocRef = doc(db, 'users', uid)
    
    // Check if user document already exists
    const existingDoc = await getDoc(userDocRef)
    if (existingDoc.exists()) {
      console.log('✅ createUserData: User document already exists, updating...')
      // Update existing document with new data
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: serverTimestamp()
      })
    } else {
      console.log('📝 createUserData: Creating new user document...')
      // Create new document
      await setDoc(userDocRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        points: userData.points || 30, // Default starting points
        completedPolls: [],
        settings: {
          profileVisibility: true, // Default to public
          emailNotifications: true
        },
        profile: userData.profile || {}
      })
    }
    
    console.log('✅ createUserData: User document created/updated successfully')
    return true
  } catch (error) {
    console.error('❌ createUserData: Error creating user document:', error)
    throw error
  }
}
