'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signOut as firebaseSignOut,
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserData, getUserData } from './db-service'

interface AuthContextType {
  user: User | null
  userPoints: number // NEW: Add user points to context
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void> // NEW: Function to refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userPoints, setUserPoints] = useState<number>(0) // NEW: Track user points
  const [loading, setLoading] = useState(true)

  // NEW: Add missing signInWithGoogle function
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      console.log('🔐 Google sign-in successful:', result.user.uid)
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  // NEW: Add missing signOut function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      console.log('🔓 Sign out successful')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Function to refresh user data from database
  const refreshUserData = async () => {
    if (user) {
      try {
        console.log('🔄 AUTH CONTEXT: Force refreshing from DB for user:', user.uid)
        const userData = await getUserData(user.uid)
        if (userData) {
          const dbPoints = userData.points || 0
          console.log('📊 AUTH CONTEXT: Database points retrieved:', dbPoints)
          setUserPoints(dbPoints)
          
          // Clear any browser storage that might interfere
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userPoints')
            sessionStorage.removeItem('userPoints')
            
            // Dispatch event to notify all components
            window.dispatchEvent(new CustomEvent('forcePointsRefresh', { 
              detail: { points: dbPoints, timestamp: Date.now() } 
            }))
          }
          
          console.log('✅ AUTH CONTEXT: Points updated to:', dbPoints)
        } else {
          console.log('⚠️ AUTH CONTEXT: No user data found, setting to 0')
          setUserPoints(0)
        }
      } catch (error) {
        console.error('❌ AUTH CONTEXT: Error refreshing user data:', error)
        setUserPoints(0)
      }
    } else {
      setUserPoints(0)
    }
  }

  useEffect(() => {
    console.log('🔐 AuthProvider useEffect - setting up auth listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email || 'signed out')
      setUser(firebaseUser)
      
      // Create user document if it's their first time
      if (firebaseUser) {
        console.log('🔐 User signed in:', firebaseUser.uid)
        
        try {
          // ALWAYS fetch fresh data from database - ignore any cached values
          let userData = await getUserData(firebaseUser.uid)
          
          if (!userData) {
            console.log('👤 Creating new user document')
            await createUserData(firebaseUser.uid, {
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL
            })
            userData = await getUserData(firebaseUser.uid)
          }
          
          const userWithId: User = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL,
            ...userData
          }
          
          setUser(userWithId)
          
          // CRITICAL: Always use database points, never cache
          const dbPoints = userData?.points || 0
          setUserPoints(dbPoints)
          console.log('📊 INITIAL User points set from database:', dbPoints)
          
          // Clear any cached data immediately
          if (typeof window !== 'undefined') {
            localStorage.clear()
            sessionStorage.clear()
          }
          
        } catch (error) {
          console.error('Error setting up user:', error)
          setUser(null)
          setUserPoints(0)
        }
      } else {
        console.log('🔓 User signed out')
        setUser(null)
        setUserPoints(0)
      }
      setLoading(false)
    })

    return () => {
      console.log('🔐 AuthProvider cleanup')
      unsubscribe()
    }
  }, [])

  // Listen for points update events
  useEffect(() => {
    const handlePointsUpdate = () => {
      console.log('🔄 Auth context: Points update event received, refreshing...')
      refreshUserData()
    }

    const handleAllPointsUpdate = () => {
      console.log('🔄 Auth context: All users points updated, refreshing...')
      refreshUserData()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('userPointsUpdated', handlePointsUpdate)
      window.addEventListener('allUserPointsUpdated', handleAllPointsUpdate)
      
      return () => {
        window.removeEventListener('userPointsUpdated', handlePointsUpdate)
        window.removeEventListener('allUserPointsUpdated', handleAllPointsUpdate)
      }
    }
  }, [user])

  // Clear any cached data when user signs in
  useEffect(() => {
    if (user) {
      // Clear any localStorage cached points
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userPoints')
        sessionStorage.removeItem('userPoints')
      }
    }
  }, [user?.uid])

  const contextValue: AuthContextType = {
    user,
    userPoints, // NEW: Expose user points
    loading,
    signInWithGoogle,
    signOut,
    refreshUserData // NEW: Expose refresh function
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
