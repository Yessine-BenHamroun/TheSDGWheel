"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import api from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

// Password strength calculation
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  
  let score = 0
  
  // Length check
  if (password.length >= 6) score += 1
  if (password.length >= 8) score += 1
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  // Return strength assessment
  if (score < 2) return { score, label: 'Weak', color: 'red' }
  if (score < 4) return { score, label: 'Fair', color: 'yellow' }
  if (score < 6) return { score, label: 'Good', color: 'blue' }
  return { score, label: 'Strong', color: 'green' }
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: loginUser } = useAuth()
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })

  useEffect(() => {
    // Get data from navigation state or redirect
    const { email: emailFromState, resetToken: tokenFromState } = location.state || {}
    
    if (!emailFromState || !tokenFromState) {
      navigate('/forgot-password')
      return
    }
    
    setEmail(emailFromState)
    setResetToken(tokenFromState)
  }, [location.state, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.newPassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter a new password' })
      return
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      return
    }

    if (!formData.confirmPassword.trim()) {
      setMessage({ type: 'error', text: 'Please confirm your password' })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      console.log('🔐 [RESET PASSWORD] Resetting password for:', email)
      const response = await api.resetPassword(resetToken, formData.newPassword, formData.confirmPassword)
      
      console.log('✅ [RESET PASSWORD] Response:', response)
      setMessage({ type: 'success', text: response.message })
      
      // Login the user automatically with the new token
      if (response.token && response.user) {
        localStorage.setItem('token', response.token)
        loginUser(response.user)
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
      
    } catch (error) {
      console.error('❌ [RESET PASSWORD] Error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to reset password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <MouseFollower />
      <ScrollProgress />
      
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/80 border-zinc-700 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Set New Password
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Choose a strong password for {email}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-600 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.color === 'red' ? 'bg-red-500' :
                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                            passwordStrength.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${
                        passwordStrength.color === 'red' ? 'text-red-400' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                        passwordStrength.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.newPassword && (
                  <>
                    {passwordsMatch ? (
                      <p className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Passwords match
                      </p>
                    ) : (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Passwords do not match
                      </p>
                    )}
                  </>
                )}
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
                disabled={
                  loading || 
                  !formData.newPassword || 
                  !formData.confirmPassword || 
                  formData.newPassword !== formData.confirmPassword ||
                  formData.newPassword.length < 6
                }
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password & Login'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
