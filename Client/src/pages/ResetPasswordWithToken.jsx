"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, ArrowLeft } from "lucide-react"
import api from "@/services/api"

export default function ResetPasswordWithToken() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset link' })
      setVerifying(false)
      return
    }

    try {
      console.log('🔐 [VERIFY TOKEN] Checking token validity:', token)
      const response = await api.verifyResetToken(token)
      
      if (response.success) {
        setTokenValid(true)
        setUserInfo(response)
        console.log('✅ [VERIFY TOKEN] Token is valid for:', response.email)
      } else {
        setMessage({ type: 'error', text: response.error || 'Invalid or expired reset link' })
      }
    } catch (error) {
      console.error('❌ [VERIFY TOKEN] Error:', error)
      setMessage({ type: 'error', text: error.message || 'Invalid or expired reset link' })
    } finally {
      setVerifying(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const validateForm = () => {
    if (!formData.newPassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter a new password' })
      return false
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return false
    }

    if (!formData.confirmPassword.trim()) {
      setMessage({ type: 'error', text: 'Please confirm your password' })
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      console.log('🔐 [RESET PASSWORD] Attempting password reset with token:', token)
      
      const response = await api.resetPasswordWithToken({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      
      if (response.success) {
        console.log('✅ [RESET PASSWORD] Password reset successfully')
        
        // Store the auth token for automatic login
        if (response.token) {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        setMessage({ type: 'success', text: 'Password reset successfully! Redirecting to dashboard...' })
        
        // Redirect to dashboard after success
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to reset password' })
      }
      
    } catch (error) {
      console.error('❌ [RESET PASSWORD] Error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to reset password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <MouseFollower />
        <ScrollProgress />
        
        <Card className="bg-zinc-900/80 border-zinc-700 backdrop-blur-xl w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-zinc-400">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <MouseFollower />
        <ScrollProgress />
        
        <Card className="bg-zinc-900/80 border-zinc-700 backdrop-blur-xl w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Invalid Link</CardTitle>
            <CardDescription className="text-zinc-400">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message.text && (
              <div className="p-3 rounded-lg flex items-center gap-2 bg-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{message.text}</span>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Request New Reset Link
              </Button>
              
              <Link to="/login">
                <Button variant="outline" className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <MouseFollower />
      <ScrollProgress />
      
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/80 border-zinc-700 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Reset Your Password</CardTitle>
            <CardDescription className="text-zinc-400">
              {userInfo?.userName && `Welcome back, ${userInfo.userName}! `}
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-zinc-200">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                    placeholder="Enter new password"
                    disabled={loading}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-200">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-400" />
                    )}
                  </Button>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                <ArrowLeft className="inline mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
