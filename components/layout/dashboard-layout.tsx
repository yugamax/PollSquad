'use client'

import { Sidebar } from './sidebar'
import { PlusCircle, Coins } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import Image from 'next/image'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const isHomePage = pathname === '/dashboard'
  const [userPoints, setUserPoints] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadUserPoints = async () => {
      if (!user) return
      
      try {
        setUserPoints(234)
      } catch (error) {
        console.error('Error loading user points:', error)
      }
    }

    if (isHomePage) {
      loadUserPoints()
    }
  }, [user, isHomePage])

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Abstract Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-warning/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar onToggle={setSidebarOpen} />
      
      {/* Profile Picture - Only on homepage, properly spaced and clickable */}
      {isHomePage && (
        <div 
          className={`fixed top-6 left-[85px] z-20 transition-opacity duration-300 cursor-pointer ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onClick={handleProfileClick}
        >
          <div className="w-[52px] h-[52px] bg-card/90 backdrop-blur-xl rounded-xl border border-border/20 shadow-lg p-1 hover:shadow-xl transition-all hover:scale-105">
            <ProfilePictureUpload showCamera={false} size="sm" />
          </div>
        </div>
      )}
      
      {/* Points Display - Only on homepage, properly spaced after profile */}
      {isHomePage && (
        <div className={`fixed top-6 left-[144px] z-20 transition-opacity duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xl rounded-xl px-3 py-3 border border-border/20 shadow-lg h-[52px]">
            <div className="relative">
              <Coins className="w-4 h-4 text-warning" />
              <div className="absolute inset-0 w-4 h-4 bg-warning/20 rounded-full blur-sm"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs text-muted-foreground font-medium leading-tight">Points</span>
              <span className="text-sm font-bold text-foreground leading-tight">{userPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-xl border-b border-border/20 px-6 py-5">
          <div className="flex items-center justify-center max-w-7xl mx-auto relative">
            {/* Centered Website Logo - Only on home page */}
            {isHomePage && (
              <div className="flex items-center justify-center">
                <Image
                  src="/pollsqd.png"
                  alt="PollSquad"
                  width={300}
                  height={100}
                />
              </div>
            )}
            
            {/* Create Poll Button - Only on home page, positioned absolute */}
            {isHomePage && (
              <button
                onClick={() => router.push('/create-poll')}
                className="absolute right-0 flex items-center gap-2 btn-primary hover:scale-105 transition-transform"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Create Poll</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className={`p-6 ${isHomePage ? 'pt-6' : 'pt-8'} ${!isHomePage ? 'ml-16' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
