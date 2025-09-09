"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import { motion } from "framer-motion"
import { ThumbsUp, Eye, Search, Heart } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Input } from "../components/ui/input"
import { MouseFollower } from "../components/mouse-follower"
import { ScrollProgress } from "../components/scroll-progress"
import { useToast } from "../hooks/use-toast"

export default function CommunityVoting() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [validatedProofs, setValidatedProofs] = useState([])
  const [userVotes, setUserVotes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadValidatedProofs()
  }, [])

  const loadValidatedProofs = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getAllProofs()
      // Filter only approved proofs
      const approvedProofs = data.filter((proof) => proof.status === "APPROVED")
      setValidatedProofs(approvedProofs)
    } catch (error) {
      console.error("Error loading proofs:", error)
      toast({
        title: "Error",
        description: "Failed to load community proofs",
        variant: "destructive",
      })
      // Fallback to mock data
      setValidatedProofs([])
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proofId) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to vote for community proofs",
        variant: "destructive",
      })
      return
    }

    if (userVotes.has(proofId)) {
      toast({
        title: "Already Voted",
        description: "You have already voted for this proof this month",
        variant: "destructive",
      })
      return
    }

    try {
      await ApiService.voteForProof(proofId)

      setValidatedProofs((prev) =>
        prev.map((proof) =>
          proof._id === proofId ? { ...proof, votes: (proof.votes || 0) + 1, hasVoted: true } : proof,
        ),
      )

      setUserVotes((prev) => new Set([...prev, proofId]))

      toast({
        title: "Vote Submitted!",
        description: "Thank you for supporting community efforts!",
      })
    } catch (error) {
      console.error("Vote error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      })
    }
  }

  const filteredProofs = validatedProofs.filter((proof) => {
    const matchesSearch =
      proof.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.challenge?.title?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "recent")
      return matchesSearch && new Date(proof.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (filter === "popular") return matchesSearch && (proof.votes || 0) > 5

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
              Community Voting
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Vote for the most inspiring sustainable actions from our community members
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search proofs, users, or challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-purple-600" : "border-zinc-700"}
            >
              All
            </Button>
            <Button
              variant={filter === "recent" ? "default" : "outline"}
              onClick={() => setFilter("recent")}
              className={filter === "recent" ? "bg-purple-600" : "border-zinc-700"}
            >
              Recent
            </Button>
            <Button
              variant={filter === "popular" ? "default" : "outline"}
              onClick={() => setFilter("popular")}
              className={filter === "popular" ? "bg-purple-600" : "border-zinc-700"}
            >
              Popular
            </Button>
          </div>
        </div>

        {/* Voting Instructions */}
        <Card className="bg-gradient-to-r from-blue-500/20 to-green-500/20 border-blue-500/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">How Community Voting Works</h3>
                <p className="text-zinc-300">
                  Vote for the most impactful and inspiring sustainable actions. Each user can vote once per proof per
                  month. Top voted proofs receive bonus points and recognition in our Wall of Eco Heroes!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proof Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProofs.map((proof, index) => (
            <motion.div
              key={proof._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-zinc-800/50 border-zinc-700 overflow-hidden hover:border-zinc-600 transition-colors h-full">
                {/* Proof Image/Video */}
                <div className="aspect-video bg-zinc-700 overflow-hidden relative">
                  {proof.mediaType === "IMAGE" ? (
                    <img src={proof.url || "/placeholder.svg"} alt="Proof" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{proof.mediaType === "VIDEO" ? "🎥" : "📄"}</div>
                        <p className="text-sm text-zinc-400">{proof.mediaType} Proof</p>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={proof.user?.avatar ? (
                          proof.user.avatar.startsWith('http') 
                            ? proof.user.avatar 
                            : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${proof.user.avatar}`
                        ) : "/placeholder.svg"} 
                        alt={proof.user?.username} 
                      />
                      <AvatarFallback className="bg-zinc-600">
                        {proof.user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{proof.user?.username}</h3>
                      <p className="text-sm text-zinc-400">{proof.user?.country}</p>
                    </div>
                    <div className="text-xs text-zinc-500">{new Date(proof.createdAt).toLocaleDateString()}</div>
                  </div>

                  {/* Challenge Title */}
                  <h4 className="text-lg font-bold text-white mb-2">{proof.challenge?.title}</h4>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-700 mt-auto">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-bold">{proof.votes || 0}</span>
                      <span className="text-zinc-400 text-sm">votes</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-600 text-zinc-300 hover:text-white bg-transparent"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleVote(proof._id)}
                        disabled={proof.hasVoted || userVotes.has(proof._id)}
                        className={
                          proof.hasVoted || userVotes.has(proof._id)
                            ? "bg-zinc-600 text-zinc-400"
                            : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        }
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {proof.hasVoted || userVotes.has(proof._id) ? "Voted" : "Vote"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProofs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No proofs found</h3>
            <p className="text-zinc-400">
              {validatedProofs.length === 0
                ? "No community proofs available yet. Be the first to submit one!"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}

        {/* Monthly Voting Info */}
        <Card className="bg-zinc-800/50 border-zinc-700 mt-12">
          <CardHeader>
            <CardTitle className="text-white">Monthly Voting Period</CardTitle>
            <CardDescription>Current Community Voting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{filteredProofs.length}</div>
                <div className="text-sm text-zinc-400">Total Proofs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {filteredProofs.reduce((sum, proof) => sum + (proof.votes || 0), 0)}
                </div>
                <div className="text-sm text-zinc-400">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">∞</div>
                <div className="text-sm text-zinc-400">Always Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
