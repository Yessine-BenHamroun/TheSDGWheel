"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import { FileCheck, Target, TrendingUp, AlertCircle, Check, X, Plus, Edit, Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({})
  const [pendingProofs, setPendingProofs] = useState([])
  const [challenges, setChallenges] = useState([])
  const [odds, setOdds] = useState([])

  // Rejection dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedProofForRejection, setSelectedProofForRejection] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false)

  // Media modal state
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard")
      return
    }
  }, [isAdmin, navigate])

  // Load initial data
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log("📊 [ADMIN DASHBOARD] Loading dashboard data...")

      const [proofsData, challengesData, oddsData] = await Promise.all([
        ApiService.getPendingProofs(),
        ApiService.getAllChallenges(),
        ApiService.getAllODDs(),
      ])

      console.log("📊 [ADMIN DASHBOARD] Raw API responses:", {
        proofsData,
        challengesData,
        oddsData,
        timestamp: new Date().toISOString()
      })

      const proofs = proofsData.proofs || []
      const challenges = challengesData.challenges || []
      const odds = oddsData.odds || []

      setPendingProofs(proofs)
      setChallenges(challenges)
      setOdds(odds)

      // Calculate statistics
      const stats = {
        totalChallenges: challenges.length,
        pendingProofs: proofs.length,
        totalODDs: odds.length,
        climateFocusedODDs: odds.filter((odd) => odd.isClimateFocus).length,
      }

      setStatistics(stats)

      console.log("📊 [ADMIN DASHBOARD] Dashboard data loaded successfully:", {
        statistics: stats,
        proofIds: proofs.map(p => p._id),
        challengeIds: challenges.map(c => c._id),
        oddIds: odds.map(o => o._id),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error("❌ [ADMIN DASHBOARD] Error loading dashboard data:", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveProof = async (proof) => {
    console.log("🔍 [ADMIN DASHBOARD] Starting proof approval process:", {
      proofId: proof._id,
      userId: proof.user?._id,
      username: proof.user?.username,
      challengeId: proof.challenge?._id,
      challengeTitle: proof.challenge?.title,
      challengePoints: proof.challenge?.points,
      mediaType: proof.mediaType,
      currentStatus: proof.status,
      timestamp: new Date().toISOString()
    })

    try {
      console.log("📤 [ADMIN DASHBOARD] Sending approval request to API...")
      const response = await ApiService.verifyProof(proof._id, true, "")

      console.log("✅ [ADMIN DASHBOARD] Proof approved successfully:", {
        proofId: proof._id,
        response: response,
        timestamp: new Date().toISOString()
      })

      setPendingProofs((prev) => prev.filter((p) => p._id !== proof._id))

      toast({
        title: "Proof Approved",
        description: `${proof.user?.username} will receive ${proof.challenge?.points || 20} points and a notification`,
      })

      console.log("🎉 [ADMIN DASHBOARD] Approval process completed successfully")
    } catch (error) {
      console.error("❌ [ADMIN DASHBOARD] Approve proof error:", {
        proofId: proof._id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })

      toast({
        title: "Error",
        description: error.message || "Failed to approve proof",
        variant: "destructive",
      })
    }
  }

  const handleRejectProof = (proof) => {
    setSelectedProofForRejection(proof)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  const getMediaUrl = (url) => {
    if (!url) return "/placeholder.svg"
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
  }

  const handleMediaClick = (proof) => {
    setSelectedMedia(proof)
    setShowMediaModal(true)
  }

  const closeMediaModal = () => {
    setShowMediaModal(false)
    setSelectedMedia(null)
  }

  const handleSubmitRejection = async () => {
    if (!selectedProofForRejection || !rejectionReason.trim()) {
      console.log("⚠️ [ADMIN DASHBOARD] Rejection validation failed:", {
        hasProof: !!selectedProofForRejection,
        hasReason: !!rejectionReason.trim(),
        reasonLength: rejectionReason.length
      })

      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    console.log("🔍 [ADMIN DASHBOARD] Starting proof rejection process:", {
      proofId: selectedProofForRejection._id,
      userId: selectedProofForRejection.user?._id,
      username: selectedProofForRejection.user?.username,
      challengeId: selectedProofForRejection.challenge?._id,
      challengeTitle: selectedProofForRejection.challenge?.title,
      rejectionReason: rejectionReason.trim(),
      reasonLength: rejectionReason.trim().length,
      currentStatus: selectedProofForRejection.status,
      timestamp: new Date().toISOString()
    })

    try {
      setIsSubmittingRejection(true)

      console.log("📤 [ADMIN DASHBOARD] Sending rejection request to API...")
      const response = await ApiService.verifyProof(selectedProofForRejection._id, false, rejectionReason.trim())

      console.log("✅ [ADMIN DASHBOARD] Proof rejected successfully:", {
        proofId: selectedProofForRejection._id,
        response: response,
        timestamp: new Date().toISOString()
      })

      setPendingProofs((prev) => prev.filter((p) => p._id !== selectedProofForRejection._id))

      toast({
        title: "Proof Rejected",
        description: `${selectedProofForRejection.user?.username} will receive a notification with your feedback`,
      })

      // Close dialog
      setShowRejectDialog(false)
      setSelectedProofForRejection(null)
      setRejectionReason("")

      console.log("🎯 [ADMIN DASHBOARD] Rejection process completed successfully")
    } catch (error) {
      console.error("❌ [ADMIN DASHBOARD] Reject proof error:", {
        proofId: selectedProofForRejection._id,
        error: error.message,
        stack: error.stack,
        rejectionReason: rejectionReason.trim(),
        timestamp: new Date().toISOString()
      })

      toast({
        title: "Error",
        description: error.message || "Failed to reject proof",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingRejection(false)
    }
  }

  const handleDeleteChallenge = async (challengeId) => {
    try {
      await ApiService.deleteChallenge(challengeId)
      setChallenges((prev) => prev.filter((challenge) => challenge._id !== challengeId))
      toast({
        title: "Challenge deleted",
        description: "Challenge has been deleted successfully",
      })
    } catch (error) {
      console.error("Delete challenge error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete challenge",
        variant: "destructive",
      })
    }
  }

  const handleSeedODDs = async () => {
    try {
      await ApiService.seedDefaultODDs()
      loadDashboardData()
      toast({
        title: "ODDs seeded",
        description: "Default ODDs have been created successfully",
      })
    } catch (error) {
      console.error("Seed ODDs error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to seed ODDs",
        variant: "destructive",
      })
    }
  }

  const handleResetODDs = async () => {
    try {
      await ApiService.resetODDs()
      loadDashboardData()
      toast({
        title: "ODDs reset",
        description: "All ODDs have been reset successfully",
      })
    } catch (error) {
      console.error("Reset ODDs error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reset ODDs",
        variant: "destructive",
      })
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <AdminSidebar />

      <div className="flex-1 relative z-10">
        {/* Main Content */}
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400">Manage your sustainability platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-blue-400"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="proofs"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-400"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Proofs
              </TabsTrigger>
              <TabsTrigger
                value="challenges"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-green-400"
              >
                <Target className="h-4 w-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger
                value="odds"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                SDGs
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Challenges"
                  value={statistics.totalChallenges || 0}
                  icon={Target}
                  color="green"
                  trend="+12% this month"
                />
                <StatCard
                  title="Pending Proofs"
                  value={statistics.pendingProofs || 0}
                  icon={AlertCircle}
                  color="orange"
                  trend="Needs attention"
                />
                <StatCard
                  title="Total SDGs"
                  value={statistics.totalODDs || 0}
                  icon={TrendingUp}
                  color="blue"
                  trend="All configured"
                />
                <StatCard
                  title="Climate Focus SDGs"
                  value={statistics.climateFocusedODDs || 0}
                  icon={FileCheck}
                  color="purple"
                  trend="Priority items"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard
                  title="Moderate Proofs"
                  description="Review and validate user submissions"
                  count={statistics.pendingProofs || 0}
                  color="orange"
                  onClick={() => navigate('/admin/proof-moderation')}
                />
                <QuickActionCard
                  title="Manage Challenges"
                  description="Create and edit platform challenges"
                  count={statistics.totalChallenges || 0}
                  color="green"
                  onClick={() => setActiveTab("challenges")}
                />
                <QuickActionCard
                  title="Configure SDGs"
                  description="Set up and manage SDGs"
                  count={statistics.totalODDs || 0}
                  color="purple"
                  onClick={() => setActiveTab("odds")}
                />
              </div>
            </TabsContent>

            {/* Proofs Tab */}
            <TabsContent value="proofs" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Proof Validation</h2>
                  <p className="text-zinc-400">Review and moderate user submissions</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                    {pendingProofs.length} Pending
                  </Badge>
                  <Button
                    onClick={() => navigate('/admin/proof-moderation')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Proofs
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingProofs.map((proof) => (
                  <Card
                    key={proof._id}
                    className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm hover:bg-zinc-800/70 transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-lg">{proof.challenge?.title}</CardTitle>
                          <CardDescription>
                            By {proof.user?.username} • {new Date(proof.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          {proof.mediaType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div
                        className="aspect-video bg-zinc-700 rounded-lg overflow-hidden cursor-pointer hover:bg-zinc-600 transition-colors"
                        onClick={() => handleMediaClick(proof)}
                      >
                        {proof.mediaType === "IMAGE" && proof.url ? (
                          <img
                            src={getMediaUrl(proof.url)}
                            alt="Proof"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                        ) : proof.mediaType === "VIDEO" && proof.url ? (
                          <div className="relative w-full h-full">
                            <video
                              src={getMediaUrl(proof.url)}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">{proof.mediaType === "VIDEO" ? "🎥" : "📄"}</div>
                              <p className="text-sm text-zinc-400">{proof.mediaType} Proof</p>
                              {proof.description && (
                                <p className="text-xs text-zinc-500 mt-2 max-w-xs">
                                  {proof.description.substring(0, 100)}...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          onClick={() => handleApproveProof(proof)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleRejectProof(proof)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pendingProofs.length === 0 && (
                <div className="text-center py-16">
<div className="flex justify-center mb-4">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#22c55e"
                        strokeWidth="6"
                        fill="#22c55e22"
                        className="animate-pulse"
                      />
                      <path
                        d="M20 34L29 43L44 25"
                        stroke="#22c55e"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        style={{
                          strokeDasharray: 40,
                          strokeDashoffset: 0,
                          animation: 'dash 1s ease-in-out forwards'
                        }}
                      />
                      <style>{`
                        @keyframes dash {
                          from { stroke-dashoffset: 40; }
                          to { stroke-dashoffset: 0; }
                        }
                      `}</style>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
                  <p className="text-zinc-400">No pending proofs to review</p>
                </div>
              )}
            </TabsContent>

            {/* Challenges Tab
            <TabsContent value="challenges" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Challenge Management</h2>
                  <p className="text-zinc-400">Create and manage platform challenges</p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/adminSection/QuizzChallenge")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Challenges
                </Button>
              </div>

              <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-700/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Challenge
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Difficulty
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-700">
                        {challenges.slice(0, 5).map((challenge) => (
                          <tr key={challenge._id} className="hover:bg-zinc-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white">{challenge.title}</div>
                                <div className="text-sm text-zinc-400 truncate max-w-xs">{challenge.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className="bg-purple-500/20 text-purple-400 border-purple-500/50"
                              >
                                {challenge.type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                              {challenge.difficulty}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{challenge.points}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteChallenge(challenge._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}

            {/* ODDs Tab */}
            <TabsContent value="odds" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">SDG Management</h2>
                  <p className="text-zinc-400">Configure and manage Sustainable Development Goals</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSeedODDs} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Seed Default SDGs
                  </Button>
                  <Button onClick={handleResetODDs} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset SDGs
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {odds.map((odd) => (
                  <Card
                    key={odd._id}
                    className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm hover:bg-zinc-800/70 transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">SDG {odd.oddId}</CardTitle>
                          <CardDescription className="line-clamp-2">{odd.name.en}</CardDescription>
                        </div>
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: odd.color }}
                        ></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">Weight:</span>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                            {odd.weight}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">Climate Focus:</span>
                          <Badge
                            variant="outline"
                            className={
                              odd.isClimateFocus
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : "bg-zinc-500/20 text-zinc-400 border-zinc-500/50"
                            }
                          >
                            {odd.isClimateFocus ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rejection Reason Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Reject Proof Submission
            </h3>

            {selectedProofForRejection && (
              <div className="mb-4 p-3 bg-zinc-700/50 rounded-lg">
                <p className="text-sm text-zinc-300">
                  <strong>Challenge:</strong> {selectedProofForRejection.challenge?.title}
                </p>
                <p className="text-sm text-zinc-300">
                  <strong>User:</strong> {selectedProofForRejection.user?.username}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Reason for rejection <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason why this proof doesn't meet the requirements..."
                className="w-full h-24 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-zinc-400 mt-1">
                {rejectionReason.length}/500 characters
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setSelectedProofForRejection(null)
                  setRejectionReason("")
                }}
                className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                disabled={isSubmittingRejection}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmitRejection}
                className="flex-1"
                disabled={isSubmittingRejection || !rejectionReason.trim()}
              >
                {isSubmittingRejection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject Proof
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeMediaModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Media content */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedMedia.mediaType === "IMAGE" && selectedMedia.url ? (
                <img
                  src={getMediaUrl(selectedMedia.url)}
                  alt="Proof"
                  className="max-w-full max-h-full object-contain"
                  style={{ maxWidth: '720px', maxHeight: '990px' }}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />
              ) : selectedMedia.mediaType === "VIDEO" && selectedMedia.url ? (
                <video
                  src={getMediaUrl(selectedMedia.url)}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxWidth: '720px', maxHeight: '990px' }}
                  controls
                  autoPlay
                />
              ) : (
                <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">{selectedMedia.mediaType === "VIDEO" ? "🎥" : "📄"}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedMedia.mediaType} Proof</h3>
                  {selectedMedia.description && (
                    <p className="text-zinc-400">{selectedMedia.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Media info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-md">
              <h3 className="font-semibold mb-1">{selectedMedia.challenge?.title || 'Unknown Challenge'}</h3>
              <p className="text-sm text-zinc-300 mb-2">By {selectedMedia.user?.username || 'Unknown User'}</p>
              {selectedMedia.description && (
                <p className="text-sm text-zinc-400">{selectedMedia.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: "bg-zinc-900 border-blue-900/60 text-blue-400",
    green: "bg-zinc-900 border-green-900/60 text-green-400",
    orange: "bg-zinc-900 border-orange-900/60 text-orange-400",
    purple: "bg-zinc-900 border-purple-900/60 text-purple-400",
  }

  return (
    <Card
      className={`${colorClasses[color]} border backdrop-blur-sm hover:scale-105 transition-all duration-200`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
            {trend && <p className="text-xs text-white/60 mt-1">{trend}</p>}
          </div>
          <Icon className="h-8 w-8 text-white/80" />
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Action Card Component
function QuickActionCard({ title, description, count, color, onClick }) {
  const colorClasses = {
    orange: "bg-zinc-900 border-orange-900/60 hover:bg-orange-900/30",
    green: "bg-zinc-900 border-green-900/60 hover:bg-green-900/30",
    purple: "bg-zinc-900 border-purple-900/60 hover:bg-purple-900/30",
  }

  return (
    <Card
      className={`${colorClasses[color]} border backdrop-blur-sm cursor-pointer transition-all duration-200 hover:scale-105`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {count}
          </Badge>
        </div>
        <p className="text-sm text-white/70">{description}</p>
        <Button variant="ghost" className="mt-4 p-0 h-auto text-white/80 hover:text-white">
          View Details →
        </Button>
      </CardContent>
    </Card>
  )
}
