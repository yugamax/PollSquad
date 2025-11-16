'use client'

import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Settings, User, Database, Send, Moon, Sun, Home } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'

const menuItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: User, label: 'Profile Settings', href: '/profile' },
  { icon: Database, label: 'Dataset Collection', href: '/datasets' },
  { icon: Send, label: 'Requests', href: '/requests' },
]

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void
  isHomePage?: boolean
}

export const Sidebar = forwardRef<{ toggleSidebar: () => void }, SidebarProps>(
  ({ onToggle, isHomePage = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()

    const toggleSidebar = () => {
      const newState = !isOpen
      setIsOpen(newState)
      onToggle?.(newState)
    }

    useImperativeHandle(ref, () => ({
      toggleSidebar
    }))

    const handleNavigation = (href: string) => {
      router.push(href)
      const newState = false
      setIsOpen(newState)
      onToggle?.(newState)
    }

    return (
      <>
        {/* Sidebar Toggle Button - Hide on mobile homepage */}
        <button
          onClick={toggleSidebar}
          className={`fixed z-30 p-2 sm:p-3 bg-card/90 backdrop-blur-xl rounded-xl shadow-lg border border-border/30 text-foreground hover:bg-muted/70 transition-all hover:scale-105 w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] flex items-center justify-center ${
            isHomePage 
              ? 'hidden sm:block top-6 sm:left-6' 
              : 'top-6 left-4 sm:left-6'
          }`}
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Sidebar - Responsive width */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 border-r border-border/20 transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{
            backgroundImage: 'url(/sidebar.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Reduced overlay for better text readability */}
          <div className="absolute inset-0 bg-card/40 backdrop-blur-none"></div>
          
          <div className="relative z-10">
            {/* Header - Responsive padding */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12">
                  <ProfilePictureUpload showCamera={false} size="sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground drop-shadow-sm text-sm sm:text-base">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-xs text-muted-foreground drop-shadow-sm">Member</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onToggle?.(false)
                }}
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Navigation - Responsive padding and spacing */}
            <nav className="p-4 sm:p-6 space-y-1 sm:space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-left transition-all drop-shadow-sm text-sm sm:text-base ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}

              {/* Theme Toggle - Responsive */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-left transition-all text-foreground hover:bg-card/50 mt-4 sm:mt-6 drop-shadow-sm text-sm sm:text-base"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            onClick={() => {
              setIsOpen(false)
              onToggle?.(false)
            }}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </>
    )
  }
)

Sidebar.displayName = 'Sidebar'
