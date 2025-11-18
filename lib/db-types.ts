import { Timestamp } from 'firebase/firestore'

export interface PollOption {
  id: string
  text: string
  votesCount: number
}

export interface PollQuestion {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  allowMultiple?: boolean // NEW: Allow multiple selections for this question
}

export interface Poll {
  pollId: string
  ownerUid: string
  ownerName: string
  ownerImage?: string
  title: string
  description?: string
  questions: PollQuestion[]
  tags: string[]
  totalVotes: number
  createdAt: Date
  expiresAt?: Date
  boostedUntil?: Date
  visible: boolean
  voters?: string[] // Track users who have voted
  allowMultipleChoices?: boolean // NEW: Global setting for the entire poll
}

export interface Vote {
  voteId: string
  pollId: string
  questionId: string
  userUid: string
  selectedOptions: string[]
  createdAt: Date
}

export interface User {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  points: number
  completedPolls: string[] // NEW: Track completed polls for points
  createdAt: Date
  settings: {
    emailNotifications: boolean
    profileVisibility: boolean // NEW: Control profile visibility
  }
  profile?: { // NEW: Extended profile information
    bio?: string
    college?: string
    course?: string
    year?: string
    location?: string
    interests?: string[]
  }
}

export interface DataRequest {
  reqId: string
  pollId: string
  requesterUid: string
  requesterName: string
  requesterEmail: string
  pollTitle: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: Date
  respondedAt?: Date
  approverUid?: string
}
