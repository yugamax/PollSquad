'use client'

import { Sidebar } from './sidebar'
import { PlusCircle, Coins, LogIn, Lock } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import { useState, useEffect, useRef } from 'react'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { PointsInfoModal } from '../ui/points-info-modal'
import Image from 'next/image'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  console.log('🏗️ DashboardLayout function called')
  
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, initializing, userPoints, refreshUserData } = useAuth()
  const isHomePage = pathname === '/dashboard'
  const [displayPoints, setDisplayPoints] = useState(0) // Changed from userPoints to displayPoints
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const sidebarRef = useRef<{ toggleSidebar: () => void }>(null)

  useEffect(() => {
    const loadUserPoints = async () => {
      if (!user) return
      
      try {
        // FIXED: Use actual points from auth context instead of hardcoded 234
        console.log('🔄 DashboardLayout: Loading user points from auth context:', userPoints)
        setDisplayPoints(userPoints)
        
        // Also force refresh from database
        await refreshUserData()
      } catch (error) {
        console.error('Error loading user points:', error)
      }
    }

    if (isHomePage) {
      loadUserPoints()
    }
  }, [user, userPoints, isHomePage, refreshUserData])

  // Listen for points updates from auth context
  useEffect(() => {
    console.log('📊 DashboardLayout: Auth context points changed to:', userPoints)
    setDisplayPoints(userPoints)
  }, [userPoints])

  const handleProfileClick = () => {
    router.push('/profile')
  }

  const handleMobileSidebarToggle = () => {
    sidebarRef.current?.toggleSidebar()
  }

  const handleSignInClick = () => {
    setShowSignInModal(true)
  }

  const handleSignInSuccess = () => {
    setShowSignInModal(false)
  }

  const handleLockedFeatureClick = () => {
    setShowSignInModal(true)
  }

  const handlePointsClick = () => {
    console.log('🔄 DashboardLayout: Points clicked, opening info modal')
    setShowPointsModal(true)
  }

  // Don't render until we know the auth state
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    )
  }

  console.log('🏗️ DashboardLayout render, user:', user?.email || 'none', 'loading:', loading)

  if (loading) {
    console.log('🏗️ DashboardLayout showing loading state')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  console.log('🏗️ DashboardLayout rendering main content')
  
  return (
    <div className="min-h-screen">
      {user && <Sidebar ref={sidebarRef} onToggle={setSidebarOpen} isHomePage={isHomePage} />}
      
      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)}
        onSuccess={handleSignInSuccess}
      />

      {/* Points Info Modal */}
      <PointsInfoModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        currentPoints={displayPoints}
      />
      
      {/* Profile Picture - Desktop only, for homepage, only when authenticated */}
      {isHomePage && user && (
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
      
      {/* Points Display - Desktop only, for homepage, only when authenticated */}
      {isHomePage && user && (
        <div className={`hidden sm:block fixed top-6 left-36 z-20 transition-all duration-300 transform ${sidebarOpen ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <div 
            className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-3 border border-border/30 shadow-lg h-[52px] cursor-pointer hover:bg-card/95 hover:shadow-xl transition-all hover:scale-105"
            onClick={handlePointsClick}
            title="Click to view points information"
          >
            <div className="relative">
              <Coins className="w-4 h-4 text-warning" />
              <div className="absolute inset-0 w-4 h-4 bg-warning/20 rounded-full blur-sm"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs text-muted-foreground font-medium leading-tight">Points</span>
              <span className="text-sm font-bold text-foreground leading-tight">{displayPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="min-h-screen">
        {/* Header - Show on homepage for both authenticated and unauthenticated users */}
        {isHomePage && (
          <header className="bg-card/80 backdrop-blur-md border-b border-border/30 px-4 sm:px-6 py-6 sm:py-3">
            <div className="flex flex-col items-center justify-center max-w-7xl mx-auto relative">
              {/* Centered Website Logo */}
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
              
              {/* Mobile Controls Row - Show for both authenticated and unauthenticated */}
              <div className="flex sm:hidden items-center justify-center gap-4 w-full animate-in slide-in-from-top-2">
                {user ? (
                  <>
                    {/* Authenticated user controls */}
                    <button
                      onClick={handleMobileSidebarToggle}
                      className="p-2 bg-card/90 backdrop-blur-xl rounded-xl shadow-lg border border-border/30 text-foreground hover:bg-muted/70 transition-all hover:scale-105 w-[48px] h-[48px] flex items-center justify-center"
                      aria-label="Toggle sidebar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
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
                    
                    <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/30 shadow-lg h-[48px] cursor-pointer hover:bg-card/95 hover:shadow-xl transition-all hover:scale-105">
                      <div className="relative">
                        <Coins className="w-4 h-4 text-warning" />
                        <div className="absolute inset-0 w-4 h-4 bg-warning/20 rounded-full blur-sm"></div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-bold text-foreground leading-tight">{displayPoints.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push('/create-poll')}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 text-sm h-[48px]"
                      aria-label="Create poll"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Unauthenticated user controls - locked features */}
                    <button
                      onClick={handleLockedFeatureClick}
                      className="p-2 bg-muted/50 backdrop-blur-xl rounded-xl shadow-lg border border-border/30 text-muted-foreground cursor-not-allowed w-[48px] h-[48px] flex items-center justify-center relative"
                      aria-label="Menu (Sign in required)"
                      disabled
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <Lock className="w-3 h-3 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />
                    </button>
                    
                    <button
                      onClick={handleLockedFeatureClick}
                      className="w-[48px] h-[48px] bg-muted/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-lg p-1 cursor-not-allowed relative flex items-center justify-center"
                      aria-label="Profile (Sign in required)"
                      disabled
                    >
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <Lock className="w-3 h-3 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />
                    </button>
                    
                    <button
                      onClick={handleLockedFeatureClick}
                      className="flex items-center gap-2 bg-muted/50 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/30 shadow-lg h-[48px] cursor-not-allowed relative text-muted-foreground"
                      aria-label="Points (Sign in required)"
                      disabled
                    >
                      <Coins className="w-4 h-4" />
                      <span className="text-xs font-bold leading-tight">---</span>
                      <Lock className="w-3 h-3 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />
                    </button>

                    <button
                      onClick={handleSignInClick}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 text-sm h-[48px] disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                      }}
                      aria-label="Sign in"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop Buttons - Show for both authenticated and unauthenticated */}
              <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-3">
                {user ? (
                  <button
                    onClick={() => router.push('/create-poll')}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                    aria-label="Create poll"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Poll</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleLockedFeatureClick}
                      className="flex items-center gap-2 bg-muted/50 text-muted-foreground px-6 py-3 rounded-xl font-semibold cursor-not-allowed relative"
                      aria-label="Create poll (Sign in required)"
                      disabled
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Poll</span>
                      <Lock className="w-4 h-4 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />
                    </button>
                    
                    <button
                      onClick={handleSignInClick}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                      }}
                      aria-label="Sign in"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Page Content - Adjust padding based on whether header exists */}
        <main className={`p-3 sm:p-6 ${isHomePage ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-12'} ${!isHomePage && user ? 'ml-0 sm:ml-16' : ''}`}>
          <div className="max-w-7xl mx-auto" key={refreshKey}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
