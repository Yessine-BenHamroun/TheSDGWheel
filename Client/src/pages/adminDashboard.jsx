"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import {
  FileCheck,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Target,
  TrendingUp,
  AlertCircle,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({})
  const [pendingProofs, setPendingProofs] = useState([])
  const [challenges, setChallenges] = useState([])
  const [odds, setOdds] = useState([])

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
      const [proofsData, challengesData, oddsData] = await Promise.all([
        ApiService.getPendingProofs(),
        ApiService.getAllChallenges(),
        ApiService.getAllODDs(),
      ])

      setPendingProofs(proofsData)
      setChallenges(challengesData)
      setOdds(oddsData)

      // Calculate statistics
      setStatistics({
        totalChallenges: challengesData.length,
        pendingProofs: proofsData.length,
        totalODDs: oddsData.length,
        climateFocusedODDs: oddsData.filter((odd) => odd.isClimateFocus).length,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleValidateProof = async (proofId, status, rejectionReason = "") => {
    try {
      await ApiService.updateProofStatus(proofId, { status, rejectionReason })
      setPendingProofs((prev) => prev.filter((proof) => proof._id !== proofId))
      toast({
        title: "Proof validated",
        description: `Proof has been ${status.toLowerCase()}`,
      })
    } catch (error) {
      console.error("Validate proof error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to validate proof",
        variant: "destructive",
      })
    }
  }

  const handleCreateChallenge = async (challengeData) => {
    try {
      await ApiService.createChallenge(challengeData)
      loadDashboardData() // Reload data
      toast({
        title: "Challenge created",
        description: "New challenge has been created successfully",
      })
    } catch (error) {
      console.error("Create challenge error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create challenge",
        variant: "destructive",
      })
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
      loadDashboardData() // Reload data
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
      loadDashboardData() // Reload data
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

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
                    Admin Dashboard
                  </span>
                </h1>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Administrator
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                    <AvatarFallback className="bg-zinc-700 text-purple-400">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-zinc-300">{user?.username}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-800/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="proofs" className="data-[state=active]:bg-purple-600">
                <FileCheck className="h-4 w-4 mr-2" />
                Proofs
              </TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-600">
                <Target className="h-4 w-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="odds" className="data-[state=active]:bg-purple-600">
                <Settings className="h-4 w-4 mr-2" />
                ODDs
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Challenges"
                  value={statistics.totalChallenges || 0}
                  icon={Target}
                  color="green"
                />
                <StatCard
                  title="Pending Proofs"
                  value={statistics.pendingProofs || 0}
                  icon={AlertCircle}
                  color="orange"
                />
                <StatCard title="Total ODDs" value={statistics.totalODDs || 0} icon={BarChart3} color="blue" />
                <StatCard
                  title="Climate Focus ODDs"
                  value={statistics.climateFocusedODDs || 0}
                  icon={TrendingUp}
                  color="purple"
                />
              </div>
            </TabsContent>

            {/* Proofs Tab */}
            <TabsContent value="proofs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Proof Validation</h2>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                  {pendingProofs.length} Pending
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingProofs.map((proof) => (
                  <Card key={proof._id} className="bg-zinc-800/50 border-zinc-700">
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
                      <div className="aspect-video bg-zinc-700 rounded-lg overflow-hidden">
                        {proof.mediaType === "IMAGE" ? (
                          <img
                            src={proof.url || "/placeholder.svg"}
                            alt="Proof"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">{proof.mediaType === "VIDEO" ? "🎥" : "📄"}</div>
                              <p className="text-sm text-zinc-400">{proof.mediaType} Proof</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleValidateProof(proof._id, "APPROVED")}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleValidateProof(proof._id, "REJECTED", "Does not meet requirements")}
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
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
                  <p className="text-zinc-400">No pending proofs to review</p>
                </div>
              )}
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Challenge Management</h2>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Challenge
                </Button>
              </div>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Challenge
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Difficulty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-700">
                        {challenges.map((challenge) => (
                          <tr key={challenge._id} className="hover:bg-zinc-700/30">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white">{challenge.title}</div>
                                <div className="text-sm text-zinc-400">{challenge.description}</div>
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
            </TabsContent>

            {/* ODDs Tab */}
            <TabsContent value="odds" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">ODD Management</h2>
                <div className="flex space-x-2">
                  <Button onClick={handleSeedODDs} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Seed Default ODDs
                  </Button>
                  <Button onClick={handleResetODDs} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset ODDs
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {odds.map((odd) => (
                  <Card key={odd._id} className="bg-zinc-800/50 border-zinc-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">ODD {odd.oddId}</CardTitle>
                          <CardDescription>{odd.name.en}</CardDescription>
                        </div>
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: odd.color }}></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-zinc-400">Weight:</span>
                          <span className="text-sm text-white">{odd.weight}</span>
                        </div>
                        <div className="flex justify-between">
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
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 border-blue-500/50",
    green: "from-green-500 to-green-600 border-green-500/50",
    orange: "from-orange-500 to-orange-600 border-orange-500/50",
    purple: "from-purple-500 to-purple-600 border-purple-500/50",
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
          <Icon className="h-8 w-8 text-white/80" />
        </div>
      </CardContent>
    </Card>
  )
}
