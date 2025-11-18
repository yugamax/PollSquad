import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from './firebase'

// Interface for JSON export format
export interface UserDataJSON {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  points: number
  completedPolls: string[]
  createdAt: string
  lastUpdated?: string
  settings: {
    emailNotifications: boolean
    profileVisibility: boolean
  }
  profile?: {
    bio?: string
    college?: string
    course?: string
    year?: string
    location?: string
    interests?: string[]
  }
}

// Fetch all users in JSON format
export async function fetchAllUsersJSON(): Promise<UserDataJSON[]> {
  try {
    console.log('📥 Fetching all users from Firestore...')
    
    const usersCollection = collection(db, 'users')
    const snapshot = await getDocs(usersCollection)
    
    console.log(`📊 Firestore query completed. Documents found: ${snapshot.size}`)
    
    const users: UserDataJSON[] = []
    
    snapshot.docs.forEach((doc, index) => {
      try {
        const data = doc.data()
        console.log(`📋 Processing user ${index + 1}/${snapshot.size}: ${data.email || doc.id}`)
        
        const user: UserDataJSON = {
          uid: doc.id,
          displayName: data.displayName || '',
          email: data.email || '',
          photoURL: data.photoURL,
          points: data.points || 0,
          completedPolls: data.completedPolls || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastUpdated: data.lastUpdated?.toDate?.()?.toISOString(),
          settings: {
            emailNotifications: data.settings?.emailNotifications ?? true,
            profileVisibility: data.settings?.profileVisibility ?? true
          },
          profile: data.profile || {}
        }
        
        users.push(user)
      } catch (docError) {
        console.error(`❌ Error processing user document ${doc.id}:`, docError)
      }
    })
    
    console.log(`✅ Successfully processed ${users.length} users`)
    return users
    
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Permission denied. Make sure Firestore rules allow reading users collection.')
      throw new Error('Permission denied. Deploy updated Firestore rules to access user data.')
    } else if (error.code === 'unavailable') {
      console.error('🛡️ Firestore unavailable. Network or connection issue.')
      throw new Error('Database temporarily unavailable. Please try again.')
    }
    
    throw error
  }
}

// Fetch single user by UID in JSON format
export async function fetchUserByIdJSON(uid: string): Promise<UserDataJSON | null> {
  try {
    console.log(`📥 Fetching user by ID: ${uid}`)
    
    const userDoc = await getDoc(doc(db, 'users', uid))
    
    if (!userDoc.exists()) {
      console.log('❌ User not found')
      return null
    }
    
    const data = userDoc.data()
    
    const user: UserDataJSON = {
      uid: userDoc.id,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL,
      points: data.points || 0,
      completedPolls: data.completedPolls || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastUpdated: data.lastUpdated?.toDate?.()?.toISOString(),
      settings: {
        emailNotifications: data.settings?.emailNotifications ?? true,
        profileVisibility: data.settings?.profileVisibility ?? true
      },
      profile: data.profile || {}
    }
    
    console.log('✅ User fetched successfully')
    return user
    
  } catch (error) {
    console.error('❌ Error fetching user:', error)
    throw error
  }
}

// Fetch users with filters in JSON format
export async function fetchUsersWithFiltersJSON(options: {
  minPoints?: number
  maxPoints?: number
  college?: string
  limit?: number
  orderByField?: 'points' | 'createdAt'
  orderDirection?: 'asc' | 'desc'
}): Promise<UserDataJSON[]> {
  try {
    console.log('📥 Fetching users with filters:', options)
    
    let q = query(collection(db, 'users'))
    
    // Add filters
    if (options.minPoints !== undefined) {
      q = query(q, where('points', '>=', options.minPoints))
    }
    
    if (options.maxPoints !== undefined) {
      q = query(q, where('points', '<=', options.maxPoints))
    }
    
    if (options.college) {
      q = query(q, where('profile.college', '==', options.college))
    }
    
    // Add ordering
    if (options.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'))
    }
    
    // Add limit
    if (options.limit) {
      q = query(q, limit(options.limit))
    }
    
    const snapshot = await getDocs(q)
    
    const users: UserDataJSON[] = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      
      const user: UserDataJSON = {
        uid: doc.id,
        displayName: data.displayName || '',
        email: data.email || '',
        photoURL: data.photoURL,
        points: data.points || 0,
        completedPolls: data.completedPolls || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString(),
        settings: {
          emailNotifications: data.settings?.emailNotifications ?? true,
          profileVisibility: data.settings?.profileVisibility ?? true
        },
        profile: data.profile || {}
      }
      
      users.push(user)
    })
    
    console.log(`✅ Fetched ${users.length} users with filters`)
    return users
    
  } catch (error) {
    console.error('❌ Error fetching users with filters:', error)
    throw error
  }
}

// Export users data to downloadable JSON file
export function downloadUsersAsJSON(users: UserDataJSON[], filename: string = 'users-data.json') {
  try {
    const jsonString = JSON.stringify(users, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    
    console.log(`✅ Downloaded ${users.length} users as ${filename}`)
  } catch (error) {
    console.error('❌ Error downloading users JSON:', error)
    throw error
  }
}

// Get user statistics in JSON format
export async function getUserStatsJSON(): Promise<{
  totalUsers: number
  totalPoints: number
  averagePoints: number
  topUsers: UserDataJSON[]
  recentUsers: UserDataJSON[]
}> {
  try {
    console.log('📊 Fetching user statistics...')
    
    const allUsers = await fetchAllUsersJSON()
    
    const totalUsers = allUsers.length
    const totalPoints = allUsers.reduce((sum, user) => sum + user.points, 0)
    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
    
    // Top users by points
    const topUsers = [...allUsers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
    
    // Recent users
    const recentUsers = [...allUsers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
    
    const stats = {
      totalUsers,
      totalPoints,
      averagePoints,
      topUsers,
      recentUsers
    }
    
    console.log('✅ User statistics calculated:', {
      totalUsers,
      totalPoints,
      averagePoints
    })
    
    return stats
    
  } catch (error) {
    console.error('❌ Error fetching user stats:', error)
    throw error
  }
}
