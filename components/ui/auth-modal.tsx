'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, message, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Sign-in error:', error)
      setError(error.message || 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm mx-4"
          >
            <div className="card-elevated rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Sign In Required</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-muted-foreground mb-4 text-sm">
                {message || 'Please sign in to access this feature.'}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
