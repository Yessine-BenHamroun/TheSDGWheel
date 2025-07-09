class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
  }

  getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Health check
  async healthCheck() {
    return this.request("/health")
  }

  // Auth endpoints
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async createAdmin(adminData) {
    return this.request("/auth/create-admin", {
      method: "POST",
      body: JSON.stringify(adminData),
    })
  }

  async refreshToken() {
    return this.request("/auth/refresh", {
      method: "POST",
    })
  }

  // User endpoints
  async getProfile() {
    return this.request("/users/profile")
  }

  async updateProfile(profileData) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async getLeaderboard() {
    return this.request("/users/leaderboard")
  }

  async getUserProgress(userId) {
    return this.request(`/users/${userId}/progress`)
  }

  async spinWheel() {
    return this.request("/users/spin-wheel", {
      method: "POST",
    })
  }

  // Challenge endpoints
  async getAllChallenges() {
    return this.request("/challenges")
  }

  async getChallengeById(id) {
    return this.request(`/challenges/${id}`)
  }

  async createChallenge(challengeData) {
    return this.request("/challenges", {
      method: "POST",
      body: JSON.stringify(challengeData),
    })
  }

  async updateChallenge(id, challengeData) {
    return this.request(`/challenges/${id}`, {
      method: "PUT",
      body: JSON.stringify(challengeData),
    })
  }

  async deleteChallenge(id) {
    return this.request(`/challenges/${id}`, {
      method: "DELETE",
    })
  }

  async getChallengeProofs(id) {
    return this.request(`/challenges/${id}/proofs`)
  }

  // Proof endpoints
  async getAllProofs() {
    return this.request("/proofs")
  }

  async getProofById(id) {
    return this.request(`/proofs/${id}`)
  }

  async createProof(proofData) {
    return this.request("/proofs", {
      method: "POST",
      body: JSON.stringify(proofData),
    })
  }

  async updateProofStatus(id, statusData) {
    return this.request(`/proofs/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    })
  }

  async getPendingProofs() {
    return this.request("/proofs/pending/all")
  }

  async voteForProof(id) {
    return this.request(`/proofs/${id}/vote`, {
      method: "POST",
    })
  }

  async getUserProofs(userId) {
    return this.request(`/proofs/user/${userId}`)
  }

  // Badge endpoints
  async getAllBadges() {
    return this.request("/badges")
  }

  async getBadgeById(id) {
    return this.request(`/badges/${id}`)
  }

  async getBadgesByODD(oddId) {
    return this.request(`/badges/odd/${oddId}`)
  }

  async createBadge(badgeData) {
    return this.request("/badges", {
      method: "POST",
      body: JSON.stringify(badgeData),
    })
  }

  async checkBadgeEligibility(oddId) {
    return this.request(`/badges/eligibility/${oddId}`)
  }

  async awardBadge(awardData) {
    return this.request("/badges/award", {
      method: "POST",
      body: JSON.stringify(awardData),
    })
  }

  async getUserBadges(userId) {
    return this.request(`/badges/user/${userId}`)
  }

  // ODD (SDG) endpoints
  async getAllODDs() {
    return this.request("/odds")
  }

  async getClimateFocusedODDs() {
    return this.request("/odds/climate-focus")
  }

  async getWeightedRandomODD() {
    return this.request("/odds/random")
  }

  async seedDefaultODDs() {
    return this.request("/odds/seed", {
      method: "POST",
    })
  }

  async resetODDs() {
    return this.request("/odds/seed", {
      method: "DELETE",
    })
  }

  async createMultipleODDs(oddsData) {
    return this.request("/odds/bulk", {
      method: "POST",
      body: JSON.stringify(oddsData),
    })
  }

  async getODDById(id) {
    return this.request(`/odds/${id}`)
  }

  async createODD(oddData) {
    return this.request("/odds", {
      method: "POST",
      body: JSON.stringify(oddData),
    })
  }

  async updateODD(id, oddData) {
    return this.request(`/odds/${id}`, {
      method: "PUT",
      body: JSON.stringify(oddData),
    })
  }

  async deleteODD(id) {
    return this.request(`/odds/${id}`, {
      method: "DELETE",
    })
  }

  async getODDChallenges(id) {
    return this.request(`/odds/${id}/challenges`)
  }
}

export default new ApiService()
