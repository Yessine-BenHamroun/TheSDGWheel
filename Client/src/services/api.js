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
      // Only set default headers if custom headers aren't provided
      headers: options.headers || this.getAuthHeaders(),
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

  async getUserStats() {
    return this.request('/users/stats');
  }

  async spinWheel() {
    return this.request('/odds/spin', { method: 'POST' });
  }

  async getSpinStatus() {
    return this.request('/odds/spin/status');
  }

  async submitQuizAnswer(answer) {
    return this.request('/odds/quiz/answer', {
      method: 'POST',
      body: JSON.stringify({ answer })
    });
  }

  async acceptChallenge() {
    return this.request('/odds/challenge/accept', { method: 'POST' });
  }

  async declineChallenge() {
    return this.request('/odds/challenge/decline', { method: 'POST' });
  }

  async getLastWheelSpin() {
    return this.request('/activity-logs/last-wheel-spin');
  }

  // Notification endpoints
  async getUserNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadNotificationsCount() {
    return this.request('/notifications/unread/count');
  }

  async getUnreadNotifications() {
    return this.request('/notifications/unread');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
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

  // Challenge proof management
  async submitChallengeProof(formData) {
    // For FormData, we need to handle headers differently
    const token = localStorage.getItem("token")
    
    return this.request('/challenges/proof/submit', {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    });
  }

  async getPendingChallenges() {
    return this.request('/challenges/pending');
  }

  // Admin proof verification
  async getPendingProofs() {
    return this.request('/challenges/proofs/pending');
  }

  async verifyProof(proofId, isApproved, adminNotes) {
    // Use the direct proof status update endpoint
    const status = isApproved ? 'APPROVED' : 'REJECTED';
    const requestData = {
      status,
      rejectionReason: adminNotes
    };

    console.log("🔗 [API SERVICE] Sending proof verification request:", {
      proofId,
      isApproved,
      status,
      adminNotes,
      endpoint: `/proofs/${proofId}/status`,
      method: 'PUT',
      requestData,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await this.request(`/proofs/${proofId}/status`, {
        method: 'PUT',
        body: JSON.stringify(requestData)
      });

      console.log("✅ [API SERVICE] Proof verification successful:", {
        proofId,
        status,
        response,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error("❌ [API SERVICE] Proof verification failed:", {
        proofId,
        status,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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

  async getSDGSpinStats() {
    return this.request("/odds/spin-stats")
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

  // Quiz endpoints
  async getAllQuizzes(language = 'en') {
    return this.request(`/quizzes?language=${language}`)
  }
  async getQuizById(id, language = 'en') {
    return this.request(`/quizzes/${id}?language=${language}`)
  }
  async createQuiz(quizData) {
    return this.request("/quizzes", {
      method: "POST",
      body: JSON.stringify(quizData),
    })
  }
  async updateQuiz(id, quizData) {
    return this.request(`/quizzes/${id}`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    })
  }
  async deleteQuiz(id) {
    return this.request(`/quizzes/${id}`, {
      method: "DELETE",
    })
  }

  // Activity Log endpoints
  async getActivityLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/activity-logs${query ? '?' + query : ''}`);
  }

  async getMyActivityLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/activity-logs/my-logs${query ? '?' + query : ''}`);
  }

  async createActivityLog(logData) {
    return this.request("/activity-logs", {
      method: "POST",
      body: JSON.stringify(logData),
    });
  }
}

export default new ApiService()
