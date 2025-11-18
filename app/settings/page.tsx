'use client'

// Fix import paths to use relative imports
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { useAuth } from '../../lib/auth-context'
import { useTheme } from '../../lib/theme-context'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Trash2, Shield, Bell, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState('public')

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
                    onChange={(e) => setNotifications(e.target.checked)}
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile visibility
                </label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-card text-foreground"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends only</option>
                </select>
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
