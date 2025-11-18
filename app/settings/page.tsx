'use client'

// Fix import paths to use relative imports
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { useAuth } from '../../lib/auth-context'
import { useTheme } from '../../lib/theme-context'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Trash2, Shield, Bell, Globe } from 'lucide-react'
import { getUserData } from '../../lib/db-service'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState(true) // NEW: Handle profile visibility
  const [loading, setLoading] = useState(false)

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid)
          if (userData?.settings) {
            setNotifications(userData.settings.emailNotifications ?? true)
            setProfileVisibility(userData.settings.profileVisibility ?? true)
          }
        } catch (error) {
          console.error('Error loading settings:', error)
        }
      }
    }
    
    loadSettings()
  }, [user])

  const handleNotificationsChange = async (enabled: boolean) => {
    if (!user) return
    
    try {
      setLoading(true)
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        'settings.emailNotifications': enabled,
        updatedAt: new Date()
      })
      setNotifications(enabled)
    } catch (error) {
      console.error('Error updating notifications:', error)
      alert('Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileVisibilityChange = async (isPublic: boolean) => {
    if (!user) return
    
    try {
      setLoading(true)
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        'settings.profileVisibility': isPublic,
        updatedAt: new Date()
      })
      setProfileVisibility(isPublic)
    } catch (error) {
      console.error('Error updating profile visibility:', error)
      alert('Failed to update profile visibility settings')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    
    try {
      // Add actual account deletion logic here
      console.log('Deleting account...')
      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-2 sm:mt-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2 sm:mb-3 text-center sm:text-left">
            Settings
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg text-center sm:text-left">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Email notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => handleNotificationsChange(e.target.checked)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Profile visibility
                </label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="public"
                      name="profileVisibility"
                      checked={profileVisibility === true}
                      onChange={() => handleProfileVisibilityChange(true)}
                      disabled={loading}
                      className="mt-0.5"
                    />
                    <div>
                      <label htmlFor="public" className="text-sm font-medium text-foreground cursor-pointer">
                        Public
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Anyone can view your profile details, college, course, location, LinkedIn, etc.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      id="private"
                      name="profileVisibility"
                      checked={profileVisibility === false}
                      onChange={() => handleProfileVisibilityChange(false)}
                      disabled={loading}
                      className="mt-0.5"
                    />
                    <div>
                      <label htmlFor="private" className="text-sm font-medium text-foreground cursor-pointer">
                        Private
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Only your name and bio are visible to others. College, location, LinkedIn and other details are hidden.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <div className="card-elevated p-6 border-danger">
            <h2 className="text-xl font-semibold text-danger mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h2>
            
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
              <h3 className="font-medium text-danger mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. This will permanently delete your profile, polls, and all associated data.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Type "DELETE" to confirm account deletion:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                      placeholder="Type DELETE here"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                      className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
