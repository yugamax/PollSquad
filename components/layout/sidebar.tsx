'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Settings, User, Database, Send, Moon, Sun, Home } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import Image from 'next/image'

const menuItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: User, label: 'Profile Settings', href: '/profile' },
  { icon: Database, label: 'Dataset Collection', href: '/datasets' },
  { icon: Send, label: 'Requests', href: '/requests' },
]

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void
}

export function Sidebar({ onToggle }: SidebarProps) {
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

  const handleNavigation = (href: string) => {
    router.push(href)
    const newState = false
    setIsOpen(newState)
    onToggle?.(newState)
  }

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-30 p-3 bg-card/90 backdrop-blur-xl rounded-xl shadow-lg border border-border/30 text-foreground hover:bg-muted/70 transition-all hover:scale-105 w-[52px] h-[52px] flex items-center justify-center"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border/20 transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12">
                <ProfilePictureUpload showCamera={false} size="sm" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground drop-shadow-sm">
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
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all drop-shadow-sm ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-foreground hover:bg-card/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-foreground hover:bg-card/50 mt-6 drop-shadow-sm"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
