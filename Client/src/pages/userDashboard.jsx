"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import {
  Activity,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Zap,
} from "lucide-react"

import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { MouseFollower } from "../components/mouse-follower"
import { ScrollProgress } from "../components/scroll-progress"
import { useToast } from "../hooks/use-toast"
import UserNavbar from "../components/UserNavbar"
import { motion, AnimatePresence } from "framer-motion"

export default function Dashboard() {
  const [userStats, setUserStats] = useState(null)
  const [userProgress, setUserProgress] = useState([])
  const [pendingChallenges, setPendingChallenges] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [userBadges, setUserBadges] = useState([])
  const [leaderboardPosition, setLeaderboardPosition] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Proof submission state
  const [showProofModal, setShowProofModal] = useState(false)
  const [selectedChallengeForProof, setSelectedChallengeForProof] = useState(null)
  const [proofText, setProofText] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [proofSubmitting, setProofSubmitting] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  
  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin")
    }
  }, [user, navigate])

  useEffect(() => {
    if (user) {
      loadUserDashboardData()
    }
  }, [user])

  const loadUserDashboardData = async () => {
    try {
      setIsLoading(true)

      const [
        statsResponse,
        progressResponse,
        spinStatusResponse,
        activityResponse,
        badgesResponse,
        leaderboardResponse
      ] = await Promise.all([
        ApiService.getUserStats(),
        ApiService.getUserProgress(user._id),
        ApiService.getSpinStatus(),
        ApiService.getMyActivityLogs({ limit: 10 }),
        ApiService.getUserBadges(user._id),
        ApiService.getLeaderboard()
      ])

      console.log('📊 Dashboard data loaded:', {
        stats: statsResponse,
        progress: progressResponse,
        activities: activityResponse,
        badges: badgesResponse
      })

      setUserStats(statsResponse)
      setUserProgress(progressResponse.progress || [])
      setPendingChallenges(spinStatusResponse.pendingChallenges || [])
      setRecentActivity(activityResponse.logs || [])
      setUserBadges(badgesResponse.badges || [])

      // Find user's position in leaderboard
      const leaderboard = Array.isArray(leaderboardResponse) ? leaderboardResponse : (leaderboardResponse.leaderboard || [])
      const userPosition = leaderboard.findIndex(u => u._id === user._id)
      setLeaderboardPosition(userPosition >= 0 ? userPosition + 1 : null)

    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getProgressPercentage = () => {
    if (!user || !user.totalPoints) return 0
    const pointsForNextLevel = (user.level || 1) * 100
    const pointsInCurrentLevel = user.totalPoints % 100
    return Math.min(100, (pointsInCurrentLevel / 100) * 100)
  }

  const getNextLevelPoints = () => {
    if (!user) return 100
    const currentLevelPoints = user.totalPoints % 100
    return 100 - currentLevelPoints
  }

  // Proof submission handlers
  const handleOpenProofModal = (challenge) => {
    setSelectedChallengeForProof(challenge)
    setShowProofModal(true)
  }

  const handleSubmitProof = async () => {
    if (!proofText.trim() && !proofFile) {
      toast({
        title: "Proof Required",
        description: "Please provide either text description or upload a file",
        variant: "destructive",
      })
      return
    }

    try {
      setProofSubmitting(true)
      const formData = new FormData()
      formData.append('challengeId', selectedChallengeForProof._id)
      formData.append('description', proofText)

      if (proofFile) {
        formData.append('proofFile', proofFile)
      }

      await ApiService.submitChallengeProof(formData)
      
      toast({
        title: "Proof Submitted! 📤",
        description: "Your proof is pending admin verification",
      })
      
      // Reset form and close modal
      setProofText('')
      setProofFile(null)
      setShowProofModal(false)
      setSelectedChallengeForProof(null)
      
      // Refresh dashboard data
      loadUserDashboardData()
    } catch (error) {
      console.error("Proof submission error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof",
        variant: "destructive",
      })
    } finally {
      setProofSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <UserNavbar />

      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600 mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-zinc-400">Track your sustainability journey and impact</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Points */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium text-zinc-300">Total Points</span>
                </div>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                  Level {user?.level || 1}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Points</span>
                  <span className="text-white">{user?.totalPoints || 0}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-zinc-500">{getNextLevelPoints()} points to next level</p>
              </div>
            </div>

            {/* Active Challenges */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-zinc-300">Active Challenges</span>
                </div>
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  {pendingChallenges.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">In Progress</span>
                  <span className="text-white">{pendingChallenges.filter(c => c.status === 'PENDING').length}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (pendingChallenges.length / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Leaderboard Position */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-medium text-zinc-300">Leaderboard Rank</span>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  #{leaderboardPosition || 'N/A'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Global Position</span>
                  <span className="text-white">#{leaderboardPosition || 'Unranked'}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${leaderboardPosition ? Math.max(10, 100 - (leaderboardPosition * 2)) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* SDG Impact */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-zinc-300">SDG Impact</span>
                </div>
                <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                  {userProgress.length} SDGs
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total Impact</span>
                  <span className="text-white">{userProgress.reduce((sum, p) => sum + (p.points || 0), 0)} pts</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (userProgress.length / 17) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content - Full width layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main dashboard - Takes up most of the space */}
            <div className="lg:col-span-3">
              <div className="grid gap-6">
                {/* User Activity Overview - Updated with glassmorphic design */}
                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative">
                    <div className="border-b border-zinc-700/50 p-6 pb-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center">
                          <Activity className="mr-2 h-5 w-5 text-purple-500" />
                          Your Sustainability Journey
                        </h2>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="bg-zinc-800/50 text-purple-400 border-purple-500/50 text-xs"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1 animate-pulse"></div>
                            LIVE
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={loadUserDashboardData}>
                            <Activity className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <UserMetricCard
                          title="Completed Challenges"
                          value={userStats?.completedChallenges || 0}
                          icon={CheckCircle}
                          trend="up"
                          color="purple"
                          detail="This month"
                        />
                        <UserMetricCard
                          title="SDGs Contributed"
                          value={userProgress.length}
                          icon={Globe}
                          trend="stable"
                          color="pink"
                          detail="Total goals"
                        />
                        <UserMetricCard
                          title="Community Rank"
                          value={leaderboardPosition || 0}
                          icon={Trophy}
                          trend="up"
                          color="blue"
                          detail="Global position"
                        />
                      </div>

                      <div className="mt-8">
                        <Tabs defaultValue="challenges" className="w-full">
                          <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-zinc-800/50 p-1">
                              <TabsTrigger
                                value="challenges"
                                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-purple-400"
                              >
                                Active Challenges
                              </TabsTrigger>
                              <TabsTrigger
                                value="progress"
                                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-purple-400"
                              >
                                SDG Progress
                              </TabsTrigger>
                              <TabsTrigger
                                value="activity"
                                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-purple-400"
                              >
                                Recent Activity
                              </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center space-x-2 text-xs text-zinc-400">
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
                                Challenges
                              </div>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-pink-500 mr-1"></div>
                                SDGs
                              </div>
                              <div className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                                Activity
                              </div>
                            </div>
                          </div>

                          <TabsContent value="challenges" className="mt-0">
                            <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/50 overflow-hidden">
                              {pendingChallenges.length > 0 ? (
                                <div className="divide-y divide-zinc-700/30">
                                  {pendingChallenges.slice(0, 5).map((challenge) => (
                                    <div key={challenge._id} className="p-4 hover:bg-zinc-800/50">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-white">{challenge.challenge?.title}</h4>
                                          <p className="text-sm text-zinc-400 mt-1">
                                            {challenge.challenge?.description?.substring(0, 80)}...
                                          </p>
                                          <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className={
                                              challenge.status === 'PENDING' ? 'text-yellow-400 border-yellow-400/50' :
                                              challenge.status === 'PROOF_SUBMITTED' ? 'text-blue-400 border-blue-400/50' :
                                              challenge.status === 'VERIFIED' ? 'text-green-400 border-green-400/50' :
                                              'text-red-400 border-red-400/50'
                                            }>
                                              {challenge.status === 'PENDING' ? 'In Progress' :
                                               challenge.status === 'PROOF_SUBMITTED' ? 'Under Review' :
                                               challenge.status === 'VERIFIED' ? 'Approved' : 'Rejected'}
                                            </Badge>
                                            <span className="text-xs text-zinc-500">
                                              {challenge.challenge?.points} points
                                            </span>
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          {challenge.status === 'PENDING' && (
                                            <Button 
                                              size="sm" 
                                              onClick={() => handleOpenProofModal(challenge)}
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              <Upload className="h-4 w-4 mr-2" />
                                              Submit Proof
                                            </Button>
                                          )}
                                          {challenge.status === 'PROOF_SUBMITTED' && (
                                            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                                              Under Review
                                            </Badge>
                                          )}
                                          {challenge.status === 'VERIFIED' && (
                                            <Badge variant="outline" className="text-green-400 border-green-400/50">
                                              ✅ Approved
                                            </Badge>
                                          )}
                                          {challenge.status === 'REJECTED' && (
                                            <Badge variant="outline" className="text-red-400 border-red-400/50">
                                              ❌ Rejected
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <Target className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No Active Challenges</h3>
                                  <p className="text-zinc-500 mb-4">Start your sustainability journey by spinning the wheel!</p>
                                  <Button onClick={() => navigate('/wheel')}>
                                    Spin the Wheel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="progress" className="mt-0">
                            <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/50 overflow-hidden p-6">
                              {userProgress.length > 0 ? (
                                <div className="space-y-4">
                                  {userProgress.slice(0, 5).map((progress) => (
                                    <div key={progress._id} className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-white">
                                          SDG {progress.odd?.number}: {progress.odd?.title}
                                        </span>
                                        <span className="text-sm text-zinc-400">{progress.points} points</span>
                                      </div>
                                      <div className="w-full bg-zinc-800 rounded-full h-2">
                                        <div
                                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${Math.min(100, (progress.points / 100) * 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Globe className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No SDG Progress Yet</h3>
                                  <p className="text-zinc-500">Complete challenges to start contributing to SDGs!</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="activity" className="mt-0">
                            <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/50 overflow-hidden">
                              {recentActivity.length > 0 ? (
                                <div className="divide-y divide-zinc-700/30">
                                  {recentActivity.slice(0, 5).map((activity) => (
                                    <div key={activity._id} className="p-4 hover:bg-zinc-800/50">
                                      <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-white font-medium">{activity.action}</p>
                                          <p className="text-xs text-zinc-400 mt-1">{activity.details}</p>
                                          <p className="text-xs text-zinc-500 mt-1">
                                            {new Date(activity.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No Recent Activity</h3>
                                  <p className="text-zinc-500">Your activity will appear here as you engage with challenges!</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                    <div className="relative p-6">
                      <h3 className="text-lg font-bold text-white flex items-center mb-4">
                        <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                        Quick Actions
                      </h3>

                      <div className="space-y-3">
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigate('/wheel')}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Spin the Wheel
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigate('/leaderboard')}
                        >
                          <Trophy className="h-4 w-4 mr-2" />
                          View Leaderboard
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigate('/profile')}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                    <div className="relative p-6">
                      <h3 className="text-lg font-bold text-white flex items-center mb-4">
                        <Award className="mr-2 h-5 w-5 text-purple-500" />
                        Your Achievements
                      </h3>

                      {userBadges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {userBadges.slice(0, 4).map((badge) => (
                            <div key={badge._id} className="text-center p-3 bg-zinc-800/50 rounded-lg">
                              <div className="text-2xl mb-2">{badge.badge?.icon || '🏆'}</div>
                              <p className="text-xs text-white font-medium">{badge.badge?.name}</p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {new Date(badge.awardedAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Award className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                          <p className="text-sm text-zinc-400">No badges earned yet</p>
                          <p className="text-xs text-zinc-500 mt-1">Complete challenges to earn badges!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar - Updated with glassmorphic design */}
            <div className="lg:col-span-1">
              <div className="grid gap-6">
                {/* User Progress Summary */}
                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative">
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 border-b border-zinc-700/50">
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1 font-mono">YOUR LEVEL</div>
                        <div className="text-3xl font-mono text-purple-400 mb-1">{user?.level || 1}</div>
                        <div className="text-sm text-zinc-400">{user?.totalPoints || 0} total points</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
                          <div className="text-xs text-zinc-500 mb-1">Challenges</div>
                          <div className="text-sm font-mono text-zinc-200">{userStats?.completedChallenges || 0}</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
                          <div className="text-xs text-zinc-500 mb-1">SDGs</div>
                          <div className="text-sm font-mono text-zinc-200">{userProgress.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ActionButton icon={Target} label="Spin Wheel" onClick={() => navigate('/wheel')} />
                      <ActionButton icon={Trophy} label="Leaderboard" onClick={() => navigate('/leaderboard')} />
                      <ActionButton icon={Globe} label="SDGs" onClick={() => navigate('/sdgs')} />
                      <ActionButton icon={Users} label="Profile" onClick={() => navigate('/profile')} />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentActivity.length > 0 ? (
                        recentActivity.slice(0, 3).map((activity) => (
                          <div key={activity._id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium">{activity.action}</p>
                              <p className="text-xs text-zinc-400 mt-1">{activity.details}</p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <Activity className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                          <p className="text-sm text-zinc-400">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-300 hover:border-purple-500/50">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>

                  <div className="relative p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
                    {userBadges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {userBadges.slice(0, 4).map((badge) => (
                          <div key={badge._id} className="text-center p-3 bg-zinc-800/50 rounded-lg">
                            <div className="text-2xl mb-2">{badge.badge?.icon || '🏆'}</div>
                            <p className="text-xs text-white font-medium">{badge.badge?.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {new Date(badge.awardedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Award className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">No achievements yet</p>
                        <p className="text-xs text-zinc-500 mt-1">Complete challenges to earn badges!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Submission Modal */}
      <AnimatePresence>
        {showProofModal && selectedChallengeForProof && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-800 rounded-xl border border-zinc-700 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">Submit Challenge Proof</h3>
              
              <div className="mb-4 p-3 bg-zinc-700/50 rounded-lg">
                <h4 className="font-semibold text-zinc-200">
                  {selectedChallengeForProof.challenge?.title || "Challenge"}
                </h4>
                <p className="text-sm text-zinc-400 mt-1">
                  {selectedChallengeForProof.challenge?.description || "Complete this challenge and provide proof"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description of your completion
                  </label>
                  <textarea
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Describe how you completed this challenge..."
                    className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-md p-3 min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Upload Photo/Video (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setProofFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="proof-file-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-700 transition-colors duration-200"
                      onClick={() => document.getElementById('proof-file-input').click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {proofFile ? 'Change File' : 'Choose File'}
                    </Button>
                  </div>
                  {proofFile && (
                    <p className="text-sm text-green-400 mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      File selected: {proofFile.name}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSubmitProof}
                    disabled={proofSubmitting || (!proofText.trim() && !proofFile)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {proofSubmitting ? "Submitting..." : "Submit Proof"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProofModal(false)
                      setProofText('')
                      setProofFile(null)
                      setSelectedChallengeForProof(null)
                    }}
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Component for user metric cards
function UserMetricCard({ title, value, icon: Icon, trend, color, detail }) {
  const getColor = () => {
    switch (color) {
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      case "pink":
        return "from-pink-500 to-purple-500 border-pink-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      default:
        return "from-purple-500 to-pink-500 border-purple-500/30"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
      case "stable":
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className={`bg-zinc-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-zinc-400">{title}</div>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-white to-zinc-300">
        {value}
      </div>
      <div className="text-xs text-zinc-500">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">{getTrendIcon()}</div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-purple-500 to-pink-500"></div>
    </div>
  )
}

// Action button component
function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-auto py-3 px-3 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 flex flex-col items-center justify-center space-y-1 w-full"
    >
      <Icon className="h-5 w-5 text-purple-500" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}
