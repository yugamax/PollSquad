'use client'

import { useState } from 'react'
import { 
  fetchAllUsersJSON, 
  fetchUserByIdJSON, 
  fetchUsersWithFiltersJSON,
  downloadUsersAsJSON,
  getUserStatsJSON,
  UserDataJSON 
} from '../../lib/user-data-service'

export function UserDataPanel() {
  const [users, setUsers] = useState<UserDataJSON[]>([])
  const [loading, setLoading] = useState(false)
  const [searchUid, setSearchUid] = useState('')
  const [stats, setStats] = useState<any>(null)

  const handleFetchAllUsers = async () => {
    setLoading(true)
    try {
      const allUsers = await fetchAllUsersJSON()
      setUsers(allUsers)
      console.log('📋 All users:', allUsers)
    } catch (error) {
      alert('Error fetching users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchSingleUser = async () => {
    if (!searchUid) return
    
    setLoading(true)
    try {
      const user = await fetchUserByIdJSON(searchUid)
      if (user) {
        setUsers([user])
        console.log('👤 Single user:', user)
      } else {
        alert('User not found')
        setUsers([])
      }
    } catch (error) {
      alert('Error fetching user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchTopUsers = async () => {
    setLoading(true)
    try {
      const topUsers = await fetchUsersWithFiltersJSON({
        orderByField: 'points',
        orderDirection: 'desc',
        limit: 10
      })
      setUsers(topUsers)
      console.log('🏆 Top users:', topUsers)
    } catch (error) {
      alert('Error fetching top users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadJSON = () => {
    if (users.length === 0) {
      alert('No users to download')
      return
    }
    downloadUsersAsJSON(users, `users-export-${new Date().toISOString().split('T')[0]}.json`)
  }

  const handleFetchStats = async () => {
    setLoading(true)
    try {
      const userStats = await getUserStatsJSON()
      setStats(userStats)
      console.log('📊 User stats:', userStats)
    } catch (error) {
      alert('Error fetching stats: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6">User Data Management</h2>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleFetchAllUsers}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch All Users'}
        </button>
        
        <button
          onClick={handleFetchTopUsers}
          disabled={loading}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
        >
          Top 10 Users
        </button>
        
        <button
          onClick={handleFetchStats}
          disabled={loading}
          className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50"
        >
          Get Statistics
        </button>
        
        <button
          onClick={handleDownloadJSON}
          disabled={users.length === 0}
          className="px-4 py-2 bg-warning text-black rounded-lg hover:bg-warning/90 disabled:opacity-50"
        >
          Download JSON ({users.length} users)
        </button>
      </div>

      {/* Search Single User */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter User ID"
          value={searchUid}
          onChange={(e) => setSearchUid(e.target.value)}
          className="flex-1 px-3 py-2 border border-border rounded-lg"
        />
        <button
          onClick={handleFetchSingleUser}
          disabled={loading || !searchUid}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50"
        >
          Search User
        </button>
      </div>

      {/* Statistics Display */}
      {stats && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-bold mb-2">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>Total Users: <strong>{stats.totalUsers}</strong></div>
            <div>Total Points: <strong>{stats.totalPoints}</strong></div>
            <div>Average Points: <strong>{stats.averagePoints}</strong></div>
            <div>Data Updated: <strong>{new Date().toLocaleString()}</strong></div>
          </div>
        </div>
      )}

      {/* Users Display */}
      {users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Points</th>
                <th className="text-left p-2">Completed Polls</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.uid} className="border-b hover:bg-muted/20">
                  <td className="p-2">{user.displayName}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2"><strong>{user.points}</strong></td>
                  <td className="p-2">{user.completedPolls.length}</td>
                  <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON Preview */}
      {users.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-bold">View JSON Data</summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(users, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
