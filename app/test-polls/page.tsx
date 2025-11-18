'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function TestPollsPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDirectly = async () => {
      try {
        console.log('🔍 Direct Firestore Test Starting...')
        
        const pollsRef = collection(db, 'polls')
        const snapshot = await getDocs(pollsRef)
        
        console.log('📊 Raw Firestore Response:', snapshot.size, 'documents')
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        console.log('📦 Extracted Data:', data)
        
        setRawData(data)
        setLoading(false)
      } catch (err) {
        console.error('❌ Direct Fetch Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    fetchDirectly()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium">Testing Firestore Connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Connection Error</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">🔍 Firestore Direct Test</h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Documents Found</p>
              <p className="text-3xl font-bold text-blue-600">{rawData.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Collection</p>
              <p className="text-xl font-bold text-green-600">polls</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-xl font-bold text-purple-600">✅ Connected</p>
            </div>
          </div>
        </div>

        {rawData.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-2xl mb-2">⚠️ No Documents Found</p>
            <p className="text-gray-600">The 'polls' collection is empty in Firestore</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Raw Data ({rawData.length} documents)</h2>
            {rawData.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Poll #{idx + 1}</h3>
                    <p className="text-sm text-gray-500 font-mono">{item.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.visible !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.visible !== false ? '✓ Visible' : '✗ Hidden'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-semibold">{item.title || '(no title)'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-semibold">{item.ownerName || item.creator || '(no owner)'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="font-semibold">{item.questions?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Votes</p>
                    <p className="font-semibold">{item.totalVotes || 0}</p>
                  </div>
                </div>

                {item.questions && item.questions.length > 0 && (
                  <div className="bg-gray-50 rounded p-4">
                    <p className="font-semibold mb-2">Questions:</p>
                    {item.questions.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="mb-3 last:mb-0">
                        <p className="text-sm font-medium">Q{qIdx + 1}: {q.question}</p>
                        <p className="text-xs text-gray-500">
                          Options: {q.options?.length || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    Show Raw JSON
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-semibold mb-2">Next Steps:</p>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>✓ If you see data here, Firestore connection works</li>
            <li>✓ Check if polls have 'visible: true'</li>
            <li>✓ Verify questions array structure</li>
            <li>✓ Go back to <a href="/dashboard" className="text-blue-600 underline">Dashboard</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
