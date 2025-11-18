'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserData, getUserData } from './db-service'

interface AuthContextType {
  user: User | null
  loading: boolean
  initializing: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  console.log('🔐 AuthProvider render, user:', user?.email || 'none', 'loading:', loading)

  useEffect(() => {
    console.log('🔐 AuthProvider useEffect - setting up auth listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.email || 'signed out')
      setUser(user)
      
      // Create user document if it's their first time
      if (user) {
        try {
          const existingUser = await getUserData(user.uid)
          if (!existingUser) {
            await createUserData(user.uid, {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            })
          }
        } catch (error) {
          console.error('Error handling user creation:', error)
        }
      }
      
      setInitializing(false)
      setLoading(false)
    })

    return () => {
      console.log('🔐 AuthProvider cleanup')
      unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setLoading(true)
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, initializing, signOut }}>
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
