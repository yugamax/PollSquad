'use client'

import { useAuth } from '@/lib/auth-context'
import { getUserData } from '@/lib/db-service'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { User } from '@/lib/db-types'

export function Header() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<User | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const data = await getUserData(user.uid)
          setUserData(data || null)
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }
    }

    loadUserData()
  }, [user])

  return (
    <header className="bg-white border-b-4 border-primary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="group">
          <h1 className="text-4xl font-black text-primary group-hover:scale-105 transition-transform">
            PollSquad
          </h1>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            {/* Points Display */}
            <div className="bg-warning/10 rounded-full px-6 py-2 border-2 border-warning font-bold flex items-center gap-2 comic-shadow">
              <span className="text-2xl">⭐</span>
              <span className="text-lg">{userData?.points || 0} pts</span>
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
    </header>
  )
}
