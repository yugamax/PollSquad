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
  createdAt: Date
  settings: {
    emailNotifications: boolean
    profileVisibility: boolean // New field
  }
  profile?: { // New profile section
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
