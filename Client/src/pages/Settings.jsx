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
import { getAvatarUrl } from "@/utils/avatarUtils"
import { useAuth } from "@/contexts/AuthContext"
import AlertService from "@/services/alertService"
import { useTranslation } from "react-i18next"

// Password strength calculation
const getPasswordStrength = (password, t) => {
  if (!password) return { score: 0, label: '', color: '' }
  
  let score = 0
  let feedback = []
  
  // Length check
  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  // Return strength assessment
  if (score < 2) return { score, label: t('settings.passwordStrength.weak'), color: 'red' }
  if (score < 4) return { score, label: t('settings.passwordStrength.fair'), color: 'yellow' }
  if (score < 6) return { score, label: t('settings.passwordStrength.good'), color: 'blue' }
  return { score, label: t('settings.passwordStrength.strong'), color: 'green' }
}

export default function Settings() {
  const { refreshUserProfile, logout } = useAuth()
  const { t } = useTranslation()
  
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

  // Update preview avatar when profile avatar changes
  useEffect(() => {
    if (profile.avatar && !avatarFile) {
      const avatarUrl = getAvatarUrl(profile.avatar)
      setPreviewAvatar(avatarUrl)
    }
  }, [profile.avatar, avatarFile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 [FRONTEND] Fetching user profile...')
      
      const response = await api.getProfile()
      console.log('📥 [FRONTEND] Profile response received:', response)
      
      // Handle different response structures
      let userData
      if (response.data) {
        userData = response.data
      } else if (response.user) {
        userData = response.user
      } else {
        userData = response
      }
      
      console.log('👤 [FRONTEND] User data extracted:', userData)
      
      if (!userData || !userData.username) {
        throw new Error('Invalid user data received from server')
      }
      
      const avatarUrl = getAvatarUrl(userData.avatar)
      console.log('🖼️ [FRONTEND] Avatar URL:', avatarUrl)
      
      setProfile(userData)
      setPreviewAvatar(avatarUrl)
      
      console.log('✅ [FRONTEND] Profile loaded successfully:', {
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        country: userData.country
      })
    } catch (error) {
      console.error('❌ [FRONTEND] Failed to fetch profile:', error)
      AlertService.error("settings.alerts.profileLoadFailed", `settings.alerts.profileLoadError: ${error.message}`);
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
        AlertService.warning("settings.alerts.invalidFileType", "settings.alerts.invalidFileTypeDesc");
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        AlertService.warning("settings.alerts.fileTooLarge", "settings.alerts.fileTooLargeDesc");
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

      console.log('💾 [SAVE PROFILE] Starting profile update...')
      console.log('💾 [SAVE PROFILE] Current profile data:', profile)
      console.log('💾 [SAVE PROFILE] Avatar file:', avatarFile)

      // Prepare update data - only include fields that are actually set and changed
      const updateData = {}
      if (profile.username?.trim()) {
        updateData.username = profile.username.trim()
      }
      if (profile.country?.trim()) {
        updateData.country = profile.country.trim()
      }

      console.log('💾 [SAVE PROFILE] Update data to send:', updateData)

      // If nothing changed and no avatar, show error
      if (Object.keys(updateData).length === 0 && !avatarFile) {
        AlertService.info("settings.alerts.noChanges", "settings.alerts.noChangesDesc");
        setSaving(false)
        return
      }

      AlertService.loading("settings.alerts.savingProfile", "settings.alerts.savingProfileDesc");

      let response
      // Handle avatar upload if changed
      if (avatarFile) {
        console.log('📷 [SAVE PROFILE] Updating profile with avatar...')
        response = await api.updateProfileWithAvatar(updateData, avatarFile)
      } else {
        console.log('📝 [SAVE PROFILE] Updating profile without avatar...')
        response = await api.updateProfile(updateData)
      }

      console.log('✅ [SAVE PROFILE] Response received:', response)

      AlertService.close();
      AlertService.success("settings.alerts.profileUpdated", "settings.alerts.profileUpdatedDesc")
      
      // Update profile with response data
      if (response?.data) {
        console.log('🔄 [SAVE PROFILE] Updating local profile with new data')
        setProfile(prev => ({ ...prev, ...response.data }))
        if (response.data.avatar) {
          const newAvatarUrl = getAvatarUrl(response.data.avatar)
          console.log('🖼️ [SAVE PROFILE] New avatar URL:', newAvatarUrl)
          setPreviewAvatar(newAvatarUrl)
        }
      }
      
      // Refresh user profile in AuthContext to update navbar
      try {
        console.log('🔄 [SAVE PROFILE] Refreshing auth context user profile...')
        await refreshUserProfile()
        console.log('✅ [SAVE PROFILE] Auth context refreshed successfully')
      } catch (error) {
        console.warn('⚠️ [SAVE PROFILE] Failed to refresh auth context:', error)
        // Don't fail the whole operation if auth refresh fails
      }
      
      // Clear avatar file after successful update
      setAvatarFile(null)
      
    } catch (error) {
      console.error('❌ [SAVE PROFILE] Failed to update profile:', error)
      console.error('❌ [SAVE PROFILE] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      AlertService.close();
      AlertService.error("settings.alerts.profileUpdateFailed", error.response?.data?.error || error.response?.data?.message || error.message || 'settings.alerts.profileUpdateFailedDesc');
    } finally {
      setSaving(false)
    }
  }

  const handleEmailChange = async () => {
    try {
      setUpdatingEmail(true)
      setMessage({ type: '', text: '' })

      console.log('📧 [EMAIL CHANGE] Starting email change request...')

      // Validate email form
      if (!emailForm.newEmail?.trim()) {
        AlertService.warning("settings.alerts.emailRequired", "settings.alerts.emailRequiredDesc");
        return
      }

      if (emailForm.newEmail.toLowerCase().trim() === profile.email?.toLowerCase().trim()) {
        AlertService.warning("settings.alerts.sameEmail", "settings.alerts.sameEmailDesc");
        return
      }

      if (emailForm.newEmail !== emailForm.confirmEmail) {
        AlertService.warning("settings.alerts.emailMismatch", "settings.alerts.emailMismatchDesc");
        return
      }

      if (!emailForm.currentPassword?.trim()) {
        AlertService.warning("settings.alerts.passwordRequired", "settings.alerts.passwordRequiredDesc");
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailForm.newEmail)) {
        AlertService.warning("settings.alerts.invalidEmail", "settings.alerts.invalidEmailDesc");
        return
      }

      const emailData = {
        newEmail: emailForm.newEmail.trim(),
        currentPassword: emailForm.currentPassword
      }

      AlertService.loading("settings.alerts.updatingEmail", "settings.alerts.updatingEmailDesc");

      console.log('📧 [EMAIL CHANGE] Sending email change request...')
      const response = await api.requestEmailChange(emailData)
      console.log('✅ [EMAIL CHANGE] Email change response:', response)

      setEmailVerificationSent(true)
      AlertService.close();
      AlertService.success("settings.alerts.verificationEmailSent", `settings.alerts.verificationEmailSentDesc`);
      setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' })

    } catch (error) {
      console.error('Failed to request email change:', error)
      AlertService.close();
      
      if (error.message.includes('password') || error.message.includes('401')) {
        AlertService.error("settings.alerts.invalidPassword", "settings.alerts.invalidPasswordDesc");
      } else if (error.message.includes('email') && error.message.includes('exists')) {
        AlertService.error("settings.alerts.emailAlreadyExists", "settings.alerts.emailAlreadyExistsDesc");
      } else {
        AlertService.error("settings.alerts.emailChangeFailed", error.response?.data?.message || error.message || 'settings.alerts.emailChangeFailedDesc');
      }
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      setUpdatingPassword(true)

      console.log('🔐 [PASSWORD CHANGE] Starting password update...')

      // Validate password form
      if (!passwordForm.currentPassword?.trim()) {
        AlertService.warning("settings.alerts.currentPasswordRequired", "settings.alerts.currentPasswordRequiredDesc");
        return
      }

      if (!passwordForm.newPassword?.trim()) {
        AlertService.warning("settings.alerts.newPasswordRequired", "settings.alerts.newPasswordRequiredDesc");
        return
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        AlertService.warning("settings.alerts.passwordsDontMatch", "settings.alerts.passwordsDontMatchDesc");
        return
      }

      if (passwordForm.newPassword.length < 6) {
        AlertService.warning("settings.alerts.passwordTooShort", "settings.alerts.passwordTooShortDesc");
        return
      }

      const passwordData = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }

      AlertService.loading("settings.alerts.updatingPassword", "settings.alerts.updatingPasswordDesc");

      console.log('🔐 [PASSWORD CHANGE] Sending password update request...')
      const response = await api.updatePassword(passwordData)
      console.log('✅ [PASSWORD CHANGE] Password update response:', response)

      AlertService.close();

      // Check if re-authentication is required
      if (response.requiresReauth) {
        AlertService.success("settings.alerts.passwordUpdated", "settings.alerts.passwordUpdatedDesc")
          .then(() => {
            logout()
          });
      } else {
        AlertService.success("settings.alerts.passwordUpdated", "settings.alerts.passwordUpdatedDesc");
      }
      
      setShowPasswordForm(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })

    } catch (error) {
      console.error('❌ [PASSWORD CHANGE] Failed to update password:', error)
      console.error('❌ [PASSWORD CHANGE] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      AlertService.close();

      if (error.message.includes('current password') || error.message.includes('incorrect') || error.response?.status === 401) {
        AlertService.error("settings.alerts.incorrectCurrentPassword", "settings.alerts.incorrectCurrentPasswordDesc");
      } else if (error.message.includes('same password') || error.message.includes('identical')) {
        AlertService.warning("settings.alerts.samePassword", "settings.alerts.samePasswordDesc");
      } else {
        AlertService.error("settings.alerts.passwordUpdateFailed", error.response?.data?.error || error.response?.data?.message || error.message || 'settings.alerts.passwordUpdateFailedDesc');
      }
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
              {t('settings.title')}
            </h1>
            <p className="text-zinc-400">{t('settings.subtitle')}</p>
          </div>          {/* Message */}
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
                <CardTitle className="text-blue-400">{t('settings.profileOverview.title')}</CardTitle>
                <CardDescription>{t('settings.profileOverview.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage 
                      src={previewAvatar || getAvatarUrl(profile.avatar)} 
                      onError={(e) => {
                        console.error('Failed to load avatar in profile overview:', e.target.src)
                      }}
                    />
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
                <CardTitle className="text-purple-400">{t('settings.editProfile.title')}</CardTitle>
                <CardDescription>{t('settings.editProfile.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label className="text-white">{t('settings.editProfile.profilePicture')}</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={previewAvatar || getAvatarUrl(profile.avatar)} 
                        onError={(e) => {
                          console.error('Failed to load avatar in edit section:', e.target.src)
                        }}
                      />
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
                  <Label htmlFor="username" className="text-white">{t('settings.editProfile.username')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="username"
                      value={profile.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-600 text-white"
                      placeholder={t('settings.placeholders.enterUsername')}
                    />
                  </div>
                </div>

                {/* Email Display with Change Button */}
                <div className="space-y-2">
                  <Label className="text-white">{t('settings.editProfile.emailAddress')}</Label>
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
                      {t('settings.editProfile.changeEmail')}
                    </Button>
                  </div>
                  {profile.isVerified === false && (
                    <p className="text-sm text-yellow-400 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{t('settings.emailChange.emailVerificationPending')}</span>
                    </p>
                  )}
                  
                  {/* Email Change Form */}
                  {showEmailForm && (
                    <Card className="bg-zinc-800/50 border-zinc-600 mt-4">
                      <CardContent className="pt-6 space-y-4">
                        {emailVerificationSent ? (
                          <div className="text-center py-4">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">{t('settings.emailChange.verificationEmailSent')}</h3>
                            <p className="text-zinc-300 mb-4">
                              {t('settings.emailChange.checkInbox')}
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
                              {t('settings.buttons.close')}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="newEmail" className="text-white">{t('settings.emailChange.newEmail')}</Label>
                              <Input
                                id="newEmail"
                                type="email"
                                value={emailForm.newEmail}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                                className="bg-zinc-700 border-zinc-600 text-white"
                                placeholder={t('settings.placeholders.enterNewEmail')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="confirmEmail" className="text-white">{t('settings.emailChange.confirmEmail')}</Label>
                              <Input
                                id="confirmEmail"
                                type="email"
                                value={emailForm.confirmEmail}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
                                className="bg-zinc-700 border-zinc-600 text-white"
                                placeholder={t('settings.placeholders.confirmNewEmail')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="emailPassword" className="text-white">{t('settings.emailChange.currentPassword')}</Label>
                              <Input
                                id="emailPassword"
                                type="password"
                                value={emailForm.currentPassword}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="bg-zinc-700 border-zinc-600 text-white"
                                placeholder={t('settings.placeholders.enterCurrentPassword')}
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
                                    {t('settings.buttons.saving')}
                                  </>
                                ) : (
                                  t('settings.emailChange.updateEmail')
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowEmailForm(false)
                                  setEmailForm({ newEmail: '', confirmEmail: '', currentPassword: '' })
                                }}
                              >
                                {t('settings.emailChange.cancel')}
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Country
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-white">{t('settings.editProfile.country')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <select
                      id="country"
                      value={profile.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">{t('settings.editProfile.selectCountry')}</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div> */}

                {/* Password Change Section */}
                <div className="space-y-2">
                  <Label className="text-white">{t('settings.editProfile.password')}</Label>
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
                      {t('settings.editProfile.changePassword')}
                    </Button>
                  </div>
                  
                  {/* Password Change Form */}
                  {showPasswordForm && (
                    <Card className="bg-zinc-800/50 border-zinc-600 mt-4">
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-white">{t('settings.passwordChange.currentPassword')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                              id="currentPassword"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white"
                              placeholder={t('settings.placeholders.enterCurrentPassword')}
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
                          <Label htmlFor="newPassword" className="text-white">{t('settings.passwordChange.newPassword')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                              placeholder={t('settings.placeholders.enterNewPassword')}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {passwordForm.newPassword && passwordForm.newPassword.length < 6 && (
                            <p className="text-red-400 text-sm">{t('settings.passwordChange.passwordMinLength')}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmNewPassword" className="text-white">{t('settings.passwordChange.confirmNewPassword')}</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                              id="confirmNewPassword"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                              placeholder={t('settings.placeholders.confirmNewPassword')}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {passwordForm.confirmPassword && passwordForm.newPassword && (
                            <>
                              {passwordForm.newPassword === passwordForm.confirmPassword ? (
                                <p className="text-green-400 text-sm flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {t('settings.passwordChange.passwordsMatch')}
                                </p>
                              ) : (
                                <p className="text-red-400 text-sm flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {t('settings.passwordChange.passwordsDoNotMatch')}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={handlePasswordChange}
                            disabled={
                              updatingPassword || 
                              !passwordForm.currentPassword || 
                              !passwordForm.newPassword || 
                              !passwordForm.confirmPassword ||
                              passwordForm.newPassword !== passwordForm.confirmPassword ||
                              passwordForm.newPassword.length < 6
                            }
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingPassword ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {t('settings.buttons.updating')}
                              </>
                            ) : (
                              t('settings.passwordChange.updatePassword')
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
                            {t('settings.passwordChange.cancel')}
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
                      {t('settings.buttons.saving')}...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('settings.buttons.saveProfile')}
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
