"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Shield, ArrowLeft, Clock } from "lucide-react"
import api from "@/services/api"

export default function VerifyResetCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

  useEffect(() => {
    // Get email from navigation state or redirect to forgot password
    const emailFromState = location.state?.email
    if (!emailFromState) {
      navigate('/forgot-password')
      return
    }
    setEmail(emailFromState)
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setMessage({ type: 'error', text: 'Reset code has expired. Please request a new one.' })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [location.state, navigate])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter the reset code' })
      return
    }

    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'Reset code must be 6 digits' })
      return
    }

    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      console.log('🔐 [VERIFY CODE] Verifying reset code for:', email)
      const response = await api.verifyResetCode(email, code)
      
      console.log('✅ [VERIFY CODE] Response:', response)
      setMessage({ type: 'success', text: response.message })
      
      // Navigate to reset password page with token
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email, 
            resetToken: response.resetToken 
          } 
        })
      }, 1000)
      
    } catch (error) {
      console.error('❌ [VERIFY CODE] Error:', error)
      setMessage({ type: 'error', text: error.message || 'Invalid or expired reset code' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setLoading(true)
      await api.forgotPassword(email)
      setMessage({ type: 'success', text: 'A new reset code has been sent to your email' })
      setTimeLeft(300) // Reset timer
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend code. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6) // Only digits, max 6
    setCode(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <MouseFollower />
      <ScrollProgress />
      
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/80 border-zinc-700 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Enter Reset Code
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">Reset Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  className="text-center text-2xl font-mono bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                  placeholder="000000"
                  disabled={loading || timeLeft <= 0}
                  autoFocus
                  maxLength={6}
                />
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Code expires in: {formatTime(timeLeft)}
                </span>
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
                disabled={loading || code.length !== 6 || timeLeft <= 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
              
              {timeLeft <= 0 && (
                <Button 
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  Resend Code
                </Button>
              )}
            </form>
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-zinc-500 text-xs">
                Didn't receive the code? Check your spam folder
              </p>
              <Link 
                to="/forgot-password" 
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Email Entry
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
