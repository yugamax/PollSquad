'use client'

import { useAuth } from '../../lib/auth-context'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function Header() {
  const { user, userPoints, refreshUserData } = useAuth()
  const [displayPoints, setDisplayPoints] = useState(0)

  // Force refresh on mount and when user changes
  useEffect(() => {
    if (user) {
      console.log('🔄 Header: Force refreshing points from database')
      refreshUserData()
    }
  }, [user?.uid, refreshUserData])

  // Update display immediately when context changes
  useEffect(() => {
    console.log('📊 Header: Points updated from context:', userPoints)
    setDisplayPoints(userPoints)
  }, [userPoints])

  // Manual refresh function for testing
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh clicked')
    await refreshUserData()
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="group">
            <h1 className="text-4xl font-black text-primary group-hover:scale-105 transition-transform">
              PollSquad
            </h1>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 bg-warning/10 text-warning px-3 py-2 rounded-full border border-warning/20 cursor-pointer hover:bg-warning/20 transition-colors"
                onClick={handleManualRefresh}
                title="Click to refresh points from database"
              >
                <span className="text-lg">⭐</span>
                <span className="font-bold">{displayPoints}</span>
                <span className="text-sm">points</span>
              </div>

              <Link
                href="/requests"
                className="text-sm font-bold text-accent hover:text-accent-dark transition-colors"
              >
                📥 Requests
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-3 bg-primary/10 rounded-2xl p-2 border-2 border-primary/20 comic-shadow">
                {user.photoURL && (
                  <img
                    src={user.photoURL || "/placeholder.svg"}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-primary"
                  />
                )}
                <span className="font-bold text-sm truncate max-w-[100px]">
                  {user.displayName?.split(' ')[0]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
