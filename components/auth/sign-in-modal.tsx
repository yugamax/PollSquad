'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, Moon, Sun } from 'lucide-react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useTheme } from '@/lib/theme-context'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

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
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50"
            style={{ backdropFilter: 'blur(8px)' }}
          />

          {/* Notification-style Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm mx-4"
          >
            <div className="card-elevated rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground">
                    Sign In to PollSquad
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="inline-block text-3xl mb-2">🗳️</div>
                  <p className="text-sm text-muted-foreground">
                    Join PollSquad to create polls and earn points!
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
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

                <div className="mt-4 pt-3 border-t border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure • 🌟 Free • 📱 Mobile-friendly
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
