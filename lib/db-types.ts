export interface User {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  points: number
  createdAt: Date
  settings: {
    emailNotifications: boolean
  }
}

export interface PollOption {
  id: string
  text: string
  votesCount: number
}

export interface Poll {
  pollId: string
  ownerUid: string
  ownerName: string
  ownerImage?: string
  title: string
  body?: string
  options: PollOption[]
  tags: string[]
  totalVotes: number
  createdAt: Date
  expiresAt?: Date
  boostedUntil?: Date
  visible: boolean
  imageUrl?: string
}

export interface Vote {
  voteId: string
  pollId: string
  userUid: string
  selectedOptions: string[]
  createdAt: Date
}

export interface DataRequest {
  reqId: string
  pollId: string
  requesterUid: string
  requesterName: string
  requesterEmail: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: Date
  respondedAt?: Date
  approverUid?: string
}

export interface Export {
  exportId: string
  pollId: string
  ownerUid: string
  format: 'csv' | 'xlsx'
  fileUrl: string
  createdAt: Date
}
