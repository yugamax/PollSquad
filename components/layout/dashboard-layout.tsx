'use client'

import { Sidebar } from './sidebar'
import { PlusCircle, Coins } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useState, useEffect, useRef } from 'react'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import Image from 'next/image'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const isHomePage = pathname === '/dashboard'
  const [userPoints, setUserPoints] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<{ toggleSidebar: () => void }>(null)

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

  const handleMobileSidebarToggle = () => {
    sidebarRef.current?.toggleSidebar()
  }

  return (
    <div className="min-h-screen relative">
      <Sidebar ref={sidebarRef} onToggle={setSidebarOpen} isHomePage={isHomePage} />
      
      {/* Profile Picture - Desktop only, for homepage */}
      {isHomePage && (
        <div 
          className={`hidden sm:block fixed top-6 left-21 z-20 transition-all duration-300 transform ${sidebarOpen ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}
          onClick={handleProfileClick}
          role="button"
          aria-label="Open profile"
        >
          <div className="w-[52px] h-[52px] bg-card/90 backdrop-blur-sm rounded-xl border border-border/30 shadow-lg p-1 hover:shadow-xl transition-all hover:scale-105">
            <ProfilePictureUpload showCamera={false} size="m" />
          </div>
        </div>
      )}
      
      {/* Points Display - Desktop only, for homepage */}
      {isHomePage && (
        <div className={`hidden sm:block fixed top-6 left-36 z-20 transition-all duration-300 transform ${sidebarOpen ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-3 border border-border/30 shadow-lg h-[52px]">
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
        {/* Header - Only show on homepage */}
        {isHomePage && (
          <header className="bg-card/70 backdrop-blur-sm border-b border-border/30 px-4 sm:px-6 py-6 sm:py-3">
            <div className="flex flex-col items-center justify-center max-w-7xl mx-auto relative">
              {/* Centered Website Logo - Use fixed height, keep aspect ratio to avoid stretching */}
              <div className="flex items-center justify-center mb-6 sm:mb-0">
                <Image
                  src="/pollsqd.png"
                  alt="PollSquad"
                  width={300}
                  height={100}
                  className="h-16 sm:h-20 w-auto object-contain"
                  priority
                />
              </div>
              
              {/* Mobile Controls Row - Only for homepage */}
              <div className="flex sm:hidden items-center justify-center gap-4 w-full animate-in slide-in-from-top-2">
                {/* Sidebar Button - Mobile Homepage */}
                <button
                  onClick={handleMobileSidebarToggle}
                  className="p-2 bg-card/90 backdrop-blur-xl rounded-xl shadow-lg border border-border/30 text-foreground hover:bg-muted/70 transition-all hover:scale-105 w-[48px] h-[48px] flex items-center justify-center"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Profile Picture - Mobile */}
                <div 
                  className="cursor-pointer"
                  onClick={handleProfileClick}
                  role="button"
                  aria-label="Open profile"
                >
                  <div className="w-[48px] h-[48px] bg-card/90 backdrop-blur-sm rounded-xl border border-border/30 shadow-lg p-1 hover:shadow-xl transition-all hover:scale-105">
                    <ProfilePictureUpload showCamera={false} size="sm" />
                  </div>
                </div>
                
                {/* Points Display - Mobile */}
                <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/30 shadow-lg h-[48px]">
                  <div className="relative">
                    <Coins className="w-4 h-4 text-warning" />
                    <div className="absolute inset-0 w-4 h-4 bg-warning/20 rounded-full blur-sm"></div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-foreground leading-tight">{userPoints.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Create Poll Button - Mobile */}
                <button
                  onClick={() => router.push('/create-poll')}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 text-sm h-[48px]"
                  aria-label="Create poll"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
              
              {/* Desktop Create Poll Button - Only visible on desktop */}
              <button
                onClick={() => router.push('/create-poll')}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                aria-label="Create poll"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Poll</span>
              </button>
            </div>
          </header>
        )}

        {/* Page Content - Adjust padding based on whether header exists */}
        <main className={`p-3 sm:p-6 ${isHomePage ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-12'} ${!isHomePage ? 'ml-0 sm:ml-16' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
