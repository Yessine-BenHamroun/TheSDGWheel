"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ApiService from "../services/api"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem("token")
    if (token) {
      try {
        // Decode JWT token (simple base64 decode for demo)
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.exp > Date.now() / 1000) {
          // Token is still valid, get user profile
          loadUserProfile()
        } else {
          localStorage.removeItem("token")
          setLoading(false)
        }
      } catch (error) {
        console.error("Invalid token:", error)
        localStorage.removeItem("token")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }

    // Listen for authentication errors from API calls
    const handleAuthError = (event) => {
      console.log('🔐 [AUTH CONTEXT] Authentication error detected:', event.detail)
      if (event.detail.logout) {
        logout()
      }
    }

    // Add event listener for auth errors
    window.addEventListener('authError', handleAuthError)

    // Cleanup event listener
    return () => {
      window.removeEventListener('authError', handleAuthError)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const profile = await ApiService.getProfile()
      // Handle different response structures
      let userData
      if (profile.data) {
        userData = profile.data
      } else if (profile.user) {
        userData = profile.user
      } else {
        userData = profile
      }
      setUser(userData)
    } catch (error) {
      console.error("Failed to load user profile:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const refreshUserProfile = async () => {
    try {
      console.log('🔄 [AUTH CONTEXT] Refreshing user profile...')
      const profile = await ApiService.getProfile()
      // Handle different response structures
      let userData
      if (profile.data) {
        userData = profile.data
      } else if (profile.user) {
        userData = profile.user
      } else {
        userData = profile
      }
      setUser(userData)
      console.log('✅ [AUTH CONTEXT] User profile refreshed successfully')
      return userData
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Failed to refresh user profile:", error)
      throw error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await ApiService.login(credentials)
      const { token, user: userData } = response

      localStorage.setItem("token", token)
      setUser(userData)

      return { success: true, user: userData }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await ApiService.register(userData)
      const { token, user: newUser } = response

      localStorage.setItem("token", token)
      setUser(newUser)

      return { success: true, user: newUser }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async (logoutAll = false) => {
    try {
      // Call backend logout to blacklist token
      if (logoutAll) {
        await ApiService.logoutAllSessions()
      } else {
        await ApiService.logout()
      }
    } catch (error) {
      console.error("Logout API call failed:", error)
      // Continue with local logout even if API call fails
    } finally {
      // Always clean up local state
      localStorage.removeItem("token")
      setUser(null)
      navigate("/login")
    }
  }

  const refreshToken = async () => {
    try {
      const response = await ApiService.refreshToken()
      const { token } = response
      localStorage.setItem("token", token)
      return { success: true }
    } catch (error) {
      console.error("Token refresh error:", error)
      logout()
      throw error
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const value = {
    user,
    login,
    register,
    logout,
    refreshToken,
    refreshUserProfile,
    loading,
    getAuthHeaders,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
