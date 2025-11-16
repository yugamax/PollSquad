'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface ProfilePictureUploadProps {
  showCamera?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProfilePictureUpload({ showCamera = true, size = 'md' }: ProfilePictureUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Use Gmail profile picture if available, otherwise check for uploaded image
    const savedImage = localStorage.getItem(`profileImage_${user?.uid}`)
    if (savedImage) {
      setProfileImage(savedImage)
    } else if (user?.photoURL) {
      setProfileImage(user.photoURL)
    }
  }, [user])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileImage(result)
        // Save to localStorage
        localStorage.setItem(`profileImage_${user.uid}`, result)
        console.log('Profile picture updated')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16 md:w-20 md:h-20',
    lg: 'w-24 h-24 md:w-32 md:h-32'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const cameraSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const cameraButtonSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  }

  return (
    <div className="relative group">
      <div className={`relative ${sizeClasses[size]} transition-all group-hover:scale-105`}>
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-border transition-all group-hover:border-primary/50"
          />
        ) : (
          <div className="w-full h-full bg-muted rounded-full flex items-center justify-center border-2 border-border transition-all group-hover:border-primary/50">
            <User className={iconSizes[size] + ' text-muted-foreground'} />
          </div>
        )}
        
        {showCamera && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 ${cameraButtonSizes[size]} bg-primary text-white rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 hover:-translate-y-0.5 touch-manipulation`}
          >
            <Camera className={cameraSizes[size]} />
          </button>
        )}
      </div>

      {showCamera && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      )}
    </div>
  )
}

// Usage example with size prop fixed
<ProfilePictureUpload showCamera={false} size="sm" />
