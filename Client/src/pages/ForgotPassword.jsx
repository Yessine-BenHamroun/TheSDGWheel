"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from "lucide-react"
import api from "@/services/api"
import { sendPasswordResetEmail } from "@/services/emailService"
import AlertService from "@/services/alertService"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      AlertService.warning("Email Required", "Please enter your email address to continue.");
      return
    }

    if (!email.includes('@')) {
      AlertService.warning("Invalid Email", "Please enter a valid email address.");
      return
    }

    try {
      setLoading(true)
      AlertService.loading("Sending Reset Link", "Please wait while we send you a password reset link...");
      
      console.log('🔐 [FORGOT PASSWORD] Sending reset request for:', email)
      const response = await api.forgotPassword(email)
      
      console.log('✅ [FORGOT PASSWORD] Response:', response)
      
      // Send email if we got a reset token
      if (response.resetToken && response.email) {
        try {
          console.log('📧 [EMAIL] Sending password reset email...')
          const userName = response.userName || email.split('@')[0]
          await sendPasswordResetEmail(response.email, response.resetToken, userName)
          console.log('✅ [EMAIL] Password reset email sent successfully')
        } catch (emailError) {
          console.error('❌ [EMAIL] Failed to send password reset email:', emailError)
          AlertService.close();
          AlertService.error("Email Failed", "Failed to send reset email. Please try again or contact support.");
          return
        }
      }
      
      AlertService.close();
      setEmailSent(true)
      AlertService.success("Reset Link Sent!", `We've sent a password reset link to ${email}. Please check your inbox and click the link to reset your password.`);
      
    } catch (error) {
      console.error('❌ [FORGOT PASSWORD] Error:', error)
      AlertService.close();
      
      if (error.message.includes('not found') || error.message.includes('No user')) {
        AlertService.error("User Not Found", "No account found with this email address. Please check your email or register for a new account.");
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        AlertService.networkError();
      } else {
        AlertService.error("Reset Failed", error.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <MouseFollower />
      <ScrollProgress />
      
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/80 border-zinc-700 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {emailSent ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {emailSent 
                ? 'We\'ve sent a reset code to your email address'
                : 'Enter your email address and we\'ll send you a reset code'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-zinc-700 border-zinc-600 text-white focus:border-purple-500"
                      placeholder="Enter your email"
                      disabled={loading}
                      autoFocus
                    />
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
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {message.text && (
                  <div className="p-3 rounded-lg flex items-center gap-2 bg-green-500/20 text-green-400">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <p className="text-zinc-400 text-sm">
                    Check your email and click the reset link
                  </p>
                  <p className="text-zinc-500 text-xs">
                    The code will expire in 5 minutes
                  </p>
                </div>
                
                <Button 
                  onClick={() => navigate('/verify-reset-code', { state: { email } })}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  I Have the Code
                </Button>
              </div>
            )}
            
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
