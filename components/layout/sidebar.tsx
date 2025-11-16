'use client'

import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Settings,
  User,
  Database,
  Send,
  Moon,
  Sun,
  Home
} from 'lucide-react'
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
      const next = !isOpen
      setIsOpen(next)
      onToggle?.(next)
    }

    useImperativeHandle(ref, () => ({ toggleSidebar }))

    const closeSidebar = () => {
      setIsOpen(false)
      onToggle?.(false)
    }

    const handleNavigation = (href: string) => {
      router.push(href)
      closeSidebar()
    }

    return (
      <>
        {/* Toggle button */}
        <button
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={toggleSidebar}
          className={`
            fixed z-30 rounded-xl shadow-lg border border-border/30 bg-card/90 backdrop-blur-xl
            w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center text-foreground
            hover:bg-muted/70 transition-transform active:scale-95
            ${isHomePage ? 'hidden sm:block top-6 sm:left-6' : 'top-6 left-4 sm:left-6'}
          `}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Smooth icon transition between Menu and X */}
          <span className="relative w-6 h-6 inline-flex">
            <MenuIcon
              className={`absolute inset-0 m-auto transition-transform duration-200 ${
                isOpen ? 'scale-75 opacity-0 -translate-y-1' : 'scale-100 opacity-100 translate-y-0'
              }`}
            />
            <CloseIcon
              className={`absolute inset-0 m-auto transition-transform duration-200 ${
                isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-1'
              }`}
            />
          </span>
        </button>

        {/* Sidebar panel */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 sm:w-72 transform transition-transform duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
        >
          {/* Background image & overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/sidebar.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-card/40"></div>

          {/* Content container */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12">
                  <ProfilePictureUpload showCamera={false} size="sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Member</p>
                </div>
              </div>

              <button
                onClick={closeSidebar}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close sidebar"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 sm:p-6 space-y-1 sm:space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-left transition-all
                      ${isActive ? 'bg-primary text-white shadow-lg' : 'text-foreground hover:bg-card/50'}
                    `}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                )
              })}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-left transition-all text-foreground hover:bg-card/50 mt-4 sm:mt-6"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                )}
                <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </nav>

            {/* Footer actions (optional) */}
            <div className="mt-auto p-4 sm:p-6 border-t border-border/30">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    router.push('/profile')
                    closeSidebar()
                  }}
                  className="flex-1 text-sm px-3 py-2 rounded-lg bg-transparent hover:bg-card/50 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    router.push('/create-poll')
                    closeSidebar()
                  }}
                  className="flex-1 text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-95 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop overlay for mobile / when open */}
        <div
          onClick={closeSidebar}
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isOpen}
        />
      </>
    )
  }
)

Sidebar.displayName = 'Sidebar'
