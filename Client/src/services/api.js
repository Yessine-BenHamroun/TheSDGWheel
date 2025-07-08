const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Add authorization token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Check if the response is ok
      if (!response.ok) {
        // Try to parse JSON error message if available
        let errorMessage = 'API request failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        return data
      } else {
        throw new Error('Server did not return JSON response')
      }

    } catch (error) {
      console.error('API Request Error:', error)
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the server is running.')
      }
      
      throw error
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async refreshToken() {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
    })
  }

  // User endpoints
  async getUserProfile() {
    return this.makeRequest('/users/profile')
  }

  async updateUserProfile(userData) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Utility methods
  setAuthToken(token) {
    localStorage.setItem('authToken', token)
  }

  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  removeAuthToken() {
    localStorage.removeItem('authToken')
  }

  setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  getUserData() {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  }

  removeUserData() {
    localStorage.removeItem('userData')
  }

  isAuthenticated() {
    return !!this.getAuthToken()
  }

  logout() {
    this.removeAuthToken()
    this.removeUserData()
  }
}

export default new ApiService()
