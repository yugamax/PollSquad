'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserData, getUserData } from './db-service'

interface AuthContextType {
  user: User | null
  loading: boolean
  userPoints: number
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)

  // Function to refresh user data from database
  const refreshUserData = async () => {
    if (!user) {
      setUserPoints(0)
      return
    }

    try {
      console.log('🔄 AuthProvider: Refreshing user data for:', user.uid)
      const userData = await getUserData(user.uid)
      
      if (userData) {
        setUserPoints(userData.points || 0)
        console.log('✅ AuthProvider: User points updated:', userData.points || 0)
      } else {
        console.log('⚠️ AuthProvider: No user data found, creating new user document')
        // Create user document if it doesn't exist
        await createUserData(user.uid, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          points: 30 // Starting points
        })
        setUserPoints(30)
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error refreshing user data:', error)
      setUserPoints(0)
    }
  }

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
      setUser(null)
      setUserPoints(0)
      console.log('🔓 Sign out successful')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email || 'signed out')
      
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // User signed in, create/update user data and load points
        try {
          let userData = await getUserData(firebaseUser.uid)
          
          if (!userData) {
            console.log('📝 AuthProvider: Creating new user document')
            await createUserData(firebaseUser.uid, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              points: 30 // Starting points
            })
            setUserPoints(30)
          } else {
            setUserPoints(userData.points || 0)
            console.log('✅ AuthProvider: Loaded user points:', userData.points || 0)
          }
        } catch (error) {
          console.error('❌ AuthProvider: Error handling user data:', error)
          setUserPoints(0)
        }
      } else {
        // User signed out
        setUserPoints(0)
      }
      
      setLoading(false)
    })

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener')
      unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    userPoints,
    signOut,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
