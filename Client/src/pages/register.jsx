"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Upload, MapPin, Check } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../hooks/use-toast"
import { MouseFollower } from "../components/mouse-follower"
import { ScrollProgress } from "../components/scroll-progress"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import { sendVerificationEmail } from "../services/emailService"

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Tunisia",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Venezuela",
  "Vietnam",
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  })
  const { toast } = useToast()
  const navigate = useNavigate()
  const { register } = useAuth()
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Real-time validation
    if (name === "email") {
      setEmailError(emailPattern.test(value) ? "" : "Invalid email address");
    }
    if (name === "password") {
      setPasswordError(
        passwordPattern.test(value)
          ? ""
          : "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()

    if (!emailPattern.test(formData.email)) {
      setEmailError("Invalid email address");
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    if (!passwordPattern.test(formData.password)) {
      setPasswordError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      toast({
        title: "Weak Password",
        description:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
        variant: "destructive",
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please make sure your passwords match.",
      })
      return
    }

    setCurrentStep(2)
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()

    if (!formData.country) {
      toast({
        title: "Country required",
        description: "Please select your country.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare data for API
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        avatar: avatarPreview || null // Send the base64 avatar if available
      }

      console.log('Sending registration data:', { ...registrationData, password: '[HIDDEN]' })

      // Call the registration API using AuthContext
      const response = await register(registrationData)

      console.log('Registration successful:', response)
      console.log('Response structure:', response)

      // Send verification email using EmailJS
      try {
        const verificationToken = response.verificationToken || response.user?.verificationToken
        console.log('Using verification token:', verificationToken)
        
        if (!verificationToken) {
          console.error('No verification token found in response')
          throw new Error('No verification token received from server')
        }
        
        await sendVerificationEmail(formData.email, verificationToken)
        console.log('Verification email sent successfully')
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Don't block registration if email fails
      }

      toast({
        title: "Account created successfully!",
        description: `Welcome, ${formData.username}! Please check your email to verify your account before logging in.`,
      })

      navigate("/verify-notice")

    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white overflow-hidden">
      {/* <MouseFollower /> */}
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="container flex justify-between items-center">
          <Link to="/" className="font-bold text-2xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">The SDG</span>
            <span className="text-white">Wheel</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Already have an account?</span>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Register Card */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-8 transition-all duration-300 hover:border-purple-500/50">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

            <div className="relative">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      currentStep >= 1 ? "bg-purple-500 border-purple-500 text-white" : "border-zinc-600 text-zinc-400"
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <div
                    className={`w-12 h-0.5 transition-colors ${currentStep > 1 ? "bg-purple-500" : "bg-zinc-600"}`}
                  ></div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      currentStep >= 2 ? "bg-purple-500 border-purple-500 text-white" : "border-zinc-600 text-zinc-400"
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="inline-block">
                    <div className="relative px-3 py-1 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                      <span className="relative z-10">
                        {currentStep === 1 ? "Join Us Today" : "Complete Your Profile"}
                      </span>
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></span>
                    </div>
                  </div>
                </motion.div>

                <motion.h1
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {currentStep === 1 ? "Create Account" : "Profile Setup"}
                </motion.h1>
                <motion.p
                  className="text-zinc-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {currentStep === 1
                    ? "Fill in your basic information to get started"
                    : "Add your location and avatar to complete your profile"}
                </motion.p>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.form
                    key="step1"
                    onSubmit={handleStep1Submit}
                    className="space-y-6"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {/* Username Field */}
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium text-zinc-300">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          placeholder="Choose a username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                          required
                        />
                      </div>
                      {emailError && (
                        <span className="text-xs text-red-500">{emailError}</span>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordError && (
                        <span className="text-xs text-red-500">{passwordError}</span>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 mt-1 rounded border-zinc-700 bg-zinc-900/50 text-purple-500 focus:ring-purple-500/20"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-zinc-400 leading-relaxed">
                        I agree to the{" "}
                        <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    {/* Next Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 border-0 text-white font-medium"
                    >
                      <div className="flex items-center gap-2">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Button>
                  </motion.form>
                )}

                {currentStep === 2 && (
                  <motion.form
                    key="step2"
                    onSubmit={handleFinalSubmit}
                    className="space-y-6"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {/* Avatar Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Profile Avatar (Optional)</label>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview || "/placeholder.svg"}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-zinc-400" />
                            )}
                          </div>
                          <label
                            htmlFor="avatar"
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors"
                          >
                            <Upload className="w-4 h-4 text-white" />
                          </label>
                          <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-zinc-500 text-center">Click the + button to upload your avatar</p>
                      </div>
                    </div>

                    {/* Country Selection */}
                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium text-zinc-300">
                        Country
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 h-12 bg-zinc-900/50 border border-zinc-700 rounded-md text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none appearance-none"
                          required
                        >
                          <option value="" className="bg-zinc-800">
                            Select your country
                          </option>
                          {countries.map((country) => (
                            <option key={country} value={country} className="bg-zinc-800">
                              {country}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                        className="flex-1 h-12 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </div>
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 border-0 text-white font-medium"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Create Account
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Divider - Only show on step 1 */}
              {currentStep === 1 && (
                <>
                  <div className="my-8 flex items-center">
                    <div className="flex-1 border-t border-zinc-700"></div>
                    <span className="px-4 text-sm text-zinc-500">Or sign up with</span>
                    <div className="flex-1 border-t border-zinc-700"></div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      className="h-12 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <span className="w-5 h-5 mr-2 text-black rounded-full flex items-center justify-center text-sm font-bold">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          ></path>
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          ></path>
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          ></path>
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          ></path>
                        </svg>
                      </span>
                      Google
                    </Button>
                  </div>
                </>
              )}

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <span className="text-zinc-400">Already have an account? </span>
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
