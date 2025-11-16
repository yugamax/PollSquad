'use client'

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useState } from 'react'

export function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl text-lg comic-shadow hover:comic-shadow-hover transition-all disabled:opacity-50"
    >
      {loading ? 'Signing in...' : '🔐 Sign In with Google'}
    </button>
  )
}
