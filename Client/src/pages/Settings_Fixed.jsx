"use client"

import { useState, useEffect } from "react"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import UserNavbar from "@/components/UserNavbar"
import { Camera, Save, User, Mail, MapPin, Shield, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react"
import api from "@/services/api"

export default function Settings() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar: '',
    country: '',
    level: 'BEGINNER',
    totalPoints: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState('')
  
  // Email change state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
    currentPassword: ''
  })
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [updatingEmail, setUpdatingEmail] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.getProfile()
      setProfile(response.data || {})
      // Construct full avatar URL if it exists
      const avatarUrl = response.data?.avatar 
        ? response.data.avatar.startsWith('http') 
          ? response.data.avatar 
          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${response.data.avatar}`
        : ''
      setPreviewAvatar(avatarUrl)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' })
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewAvatar(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })

      // Validate required fields
      if (!profile.username?.trim()) {
        setMessage({ type: 'error', text: 'Username is required' })
        return
      }

      // Prepare update data - only include fields that are actually set
      const updateData = {}
      
      if (profile.username?.trim()) {
        updateData.username = profile.username.trim()
      }
      
      if (profile.country?.trim()) {
        updateData.country = profile.country.trim()
      }

      // Check if there are any changes to make
      if (Object.keys(updateData).length === 0 && !avatarFile) {
        setMessage({ type: 'error', text: 'No changes to save' })
        return
      }

      let response
      // Handle avatar upload if changed
      if (avatarFile) {
        response = await api.updateProfileWithAvatar(updateData, avatarFile)
      } else {
        response = await api.updateProfile(updateData)
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Update profile with response data
      if (response?.data) {
        setProfile(prev => ({ ...prev, ...response.data }))
        if (response.data.avatar) {
          const avatarUrl = response.data.avatar.startsWith('http') 
            ? response.data.avatar 
            : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${response.data.avatar}`
          setPreviewAvatar(avatarUrl)
        }
      }
      
      // Clear avatar file after successful update
      setAvatarFile(null)
      
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to update profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEmailChange = async () => {
    try {
      setUpdatingEmail(true)
      setMessage({ type: '', text: '' })

      // Validate email form
      if (!emailForm.newEmail?.trim()) {
        setMessage({ type: 'error', text: 'New email is required' })
        return
      }

      if (emailForm.newEmail.toLowerCase().trim() === profile.email?.toLowerCase().trim()) {
        setMessage({ type: 'error', text: 'New email must be different from current email' })
        return
      }

      if (emailForm.newEmail !== emailForm.confirmEmail) {
        setMessage({ type: 'error', text: 'Email addresses do not match' })
        return
      }

      if (!emailForm.currentPassword?.trim()) {
        setMessage({ type: 'error', text: 'Current password is required' })
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailForm.newEmail)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address' })
        return
      }

      const response = await api.requestEmailChange({
        newEmail: emailForm.newEmail.trim(),
        currentPassword: emailForm.currentPassword
      })

      setEmailVerificationSent(true)
      setMessage({ 
        type: 'success', 
        text: 'Verification email sent to your new email address. Please check your inbox and click the verification link to complete the email change.' 
      })
      setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' })

    } catch (error) {
      console.error('Failed to request email change:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to request email change' 
      })
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      setUpdatingPassword(true)
      setMessage({ type: '', text: '' })

      // Validate password form
      if (!passwordForm.currentPassword?.trim()) {
        setMessage({ type: 'error', text: 'Current password is required' })
        return
      }

      if (!passwordForm.newPassword?.trim()) {
        setMessage({ type: 'error', text: 'New password is required' })
        return
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' })
        return
      }

      if (passwordForm.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters long' })
        return
      }

      await api.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setShowPasswordForm(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })

    } catch (error) {
      console.error('Failed to update password:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to update password' 
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'ADVANCED':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'INTERMEDIATE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/50'
    }
  }

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 
    'Belgium', 'Brazil', 'Canada', 'China', 'Denmark', 'Egypt', 'Finland', 'France', 
    'Germany', 'India', 'Indonesia', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'Norway', 
    'Pakistan', 'Poland', 'Russia', 'South Africa', 'Spain', 'Sweden', 'Switzerland', 
    'Tunisia', 'Turkey', 'United Kingdom', 'United States', 'Other'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />
      <UserNavbar />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              Profile Settings
            </h1>
            <p className="text-zinc-400">Manage your account and preferences</p>
          </div>

          {/* Message */}
          {message.text && (
            <Card className={`mb-6 border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50' 
                : 'bg-red-500/10 border-red-500/50'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                    {message.text}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {/* Profile Overview */}
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Profile Overview</CardTitle>
                <CardDescription>Your current level and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={previewAvatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                      {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{profile.username}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className={getLevelColor(profile.level)}>
                        {profile.level}
                      </Badge>
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                        {profile.totalPoints || 0} points
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile */}
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-purple-400">Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label className="text-white">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={previewAvatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                        {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Camera className="h-4 w-4 mr-2" />
                            Change Photo
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="username"
                      value={profile.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-600 text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                {/* Email Display with Change Button */}
                <div className="space-y-2">
                  <Label className="text-white">Email Address</Label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input
                        value={profile.email || ''}
                        className="pl-10 bg-zinc-800 border-zinc-600 text-white"
                        placeholder="No email set"
                        readOnly
                      />
                      {profile.isVerified !== undefined && (
                        <div className="absolute right-3 top-3">
                          {profile.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-400" title="Email verified" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-400" title="Email not verified" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      Change Email
                    </Button>
                  </div>
                  {profile.isVerified === false && (
                    <p className="text-sm text-yellow-400 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Email verification pending</span>
                    </p>
                  )}
                  
                  {/* Email Change Form */}
                  {showEmailForm && (
                    <Card className="bg-zinc-800/50 border-zinc-600 mt-4">
                      <CardContent className="pt-6 space-y-4">
                        {emailVerificationSent ? (
                          <div className="text-center py-4">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Verification Email Sent!</h3>
                            <p className="text-zinc-300 mb-4">
                              We've sent a verification link to your new email address. Please check your inbox and click the link to complete the email change.
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowEmailForm(false)
                                setEmailVerificationSent(false)
                                setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' })
                              }}
                              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                            >
                              Close
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="newEmail" className="text-white">New Email</Label>
                              <Input
                                id="newEmail"
                                type="email"
                                value={emailForm.newEmail}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                                className="bg-zinc-700 border-zinc-600 text-white"
                                placeholder="Enter new email"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="confirmEmail" className="text-white">Confirm New Email</Label>
                              <Input
                                id="confirmEmail"
                                type="email"
                                value={emailForm.confirmEmail}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
                                className="bg-zinc-700 border-zinc-600 text-white"
                                placeholder="Confirm new email"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="emailPassword" className="text-white">Current Password</Label>
                              <Input
                                id="emailPassword"
                                type="password"
                                value={emailForm.currentPassword}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="bg-zinc-700 border-zinc-600 text-white"
                                placeholder="Enter current password"
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleEmailChange}
                                disabled={updatingEmail}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {updatingEmail ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                  </>
                                ) : (
                                  'Send Verification Email'
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowEmailForm(false)
                                  setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' })
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-white">Country</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <select
                      id="country"
                      value={profile.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Select your country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="space-y-2">
                  <Label className="text-white">Password</Label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        value="••••••••••••"
                        className="bg-zinc-800 border-zinc-600 text-white"
                        readOnly
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      Change Password
                    </Button>
                  </div>
                  
                  {/* Password Change Form */}
                  {showPasswordForm && (
                    <Card className="bg-zinc-800/50 border-zinc-600 mt-4">
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                              id="currentPassword"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-white">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={handlePasswordChange}
                            disabled={updatingPassword}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {updatingPassword ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                              </>
                            ) : (
                              'Update Password'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordForm(false)
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                              setShowPasswords({ current: false, new: false, confirm: false })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
