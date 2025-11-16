'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginButton } from './login-button'

export function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-accent/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-2" style={{ color: 'var(--primary)' }}>
            PollSquad
          </h1>
          <p className="text-2xl font-bold text-foreground mb-2">
            Vote. Earn. Boost.
          </p>
          <p className="text-muted-foreground">
            Join our community and share your opinions!
          </p>
        </div>

        {/* Comic card */}
        <div className="bg-white rounded-3xl p-8 comic-shadow border-4 border-primary/20 text-center">
          <div className="mb-8">
            <div className="inline-block text-6xl mb-4">🗳️</div>
            <h2 className="text-3xl font-black mb-4">
              Welcome to <span className="text-primary">PollSquad!</span>
            </h2>
            <p className="text-muted-foreground mb-2">
              Sign in to explore polls, earn points, and boost your voice!
            </p>
          </div>

          <LoginButton />

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              🔒 Secure authentication with Google Sign-In
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: '⭐', label: 'Earn Points' },
            { icon: '🚀', label: 'Boost Polls' },
            { icon: '📊', label: 'View Results' }
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white rounded-2xl p-4 comic-shadow text-center border-2 border-accent/50"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="font-bold text-sm">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
