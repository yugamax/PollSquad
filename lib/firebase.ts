import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Comprehensive configuration logging
console.log('🔥 Firebase Configuration Check:')
console.log('================================')
Object.entries(firebaseConfig).forEach(([key, value]) => {
  const displayValue = value ? `${value.substring(0, 20)}${value.length > 20 ? '...' : ''}` : '❌ MISSING'
  console.log(`${key}: ${displayValue}`)
})
console.log('================================')

// Validate required config
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingConfig.length > 0) {
  console.error('❌ Missing Firebase configuration:')
  missingConfig.forEach(key => console.error(`  - ${key}`))
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`)
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
console.log('✅ Firebase app initialized:', app.name)
console.log('   Project ID:', app.options.projectId)

// Initialize Firestore
export const db = getFirestore(app)
console.log('✅ Firestore initialized')
console.log('   Firestore app:', db.app.name)

// Initialize Auth
export const auth = getAuth(app)
console.log('✅ Auth initialized')
console.log('   Auth app:', auth.app.name)

// Optional: Enable Firestore debug logging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🐛 Development mode - enabling detailed Firestore logging')
  // @ts-ignore
  if (window.FIREBASE_APPCHECK_DEBUG_TOKEN) {
    console.log('App Check debug token is set')
  }
}
