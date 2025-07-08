import React, { createContext, useContext, useState, useEffect } from 'react'
import ApiService from '@/services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = ApiService.getAuthToken()
    const userData = ApiService.getUserData()
    
    if (token && userData) {
      setUser(userData)
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await ApiService.login(credentials)
      
      // Store token and user data
      ApiService.setAuthToken(response.token)
      ApiService.setUserData(response.user)
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await ApiService.register(userData)
      
      // Store token and user data
      ApiService.setAuthToken(response.token)
      ApiService.setUserData(response.user)
      
      setUser(response.user)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    ApiService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(userData)
    ApiService.setUserData(userData)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
