"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import ApiService from "../services/api"
import { motion } from "framer-motion"
import { Trophy, Medal, Award, Star, Calendar, Filter } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { MouseFollower } from "../components/mouse-follower"
import { ScrollProgress } from "../components/scroll-progress"
import { useToast } from "../hooks/use-toast"

export default function Leaderboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboardData()
  }, [])

  const loadLeaderboardData = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getLeaderboard()
      // Ensure data is an array, or use the data property if it's wrapped
      const leaderboardArray = Array.isArray(data) ? data : (data.data || data.users || [])
      setLeaderboardData(leaderboardArray)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      })
      // Fallback to mock data
      setLeaderboardData([
        {
          _id: "1",
          username: "climate_champion",
          avatar: "/placeholder.svg",
          country: "France",
          totalPoints: 1250,
          badges: [],
          level: "SDG Ambassador",
          rank: 1,
        },
        {
          _id: "2",
          username: "eco_warrior",
          avatar: "/placeholder.svg",
          country: "Germany",
          totalPoints: 1180,
          badges: [],
          level: "Engaged Actor",
          rank: 2,
        },
        {
          _id: "3",
          username: "green_guardian",
          avatar: "/placeholder.svg",
          country: "Spain",
          totalPoints: 1050,
          badges: [],
          level: "Engaged Actor",
          rank: 3,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-zinc-400">#{rank}</span>
    }
  }

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/50"
      default:
        return "bg-zinc-800/50 border-zinc-700"
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case "SDG Ambassador":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      case "Engaged Actor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "Explorer":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <MouseFollower />
      <ScrollProgress />

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading leaderboard...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-purple-600">
              Leaderboard
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Celebrate the champions making a real difference in sustainable development
          </p>
        </div>

        <Tabs defaultValue="monthly" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              Current Leaders
            </TabsTrigger>
            <TabsTrigger value="heroes" className="data-[state=active]:bg-purple-600">
              <Star className="h-4 w-4 mr-2" />
              Eco Heroes
            </TabsTrigger>
          </TabsList>

          {/* Current Leaders */}
          <TabsContent value="monthly" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Current Champions</h2>
              <Button variant="outline" className="border-zinc-700 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Country
              </Button>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.isArray(leaderboardData) && leaderboardData.slice(0, 3).map((leader, index) => (
                <motion.div
                  key={leader._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative ${index === 0 ? "md:order-2" : index === 1 ? "md:order-1" : "md:order-3"}`}
                >
                  <Card className={`${getRankBg(leader.rank || index + 1)} border relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-2">{getRankIcon(leader.rank || index + 1)}</div>
                    <CardContent className="p-6 text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-white/20">
                        <AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.username} />
                        <AvatarFallback className="bg-zinc-700 text-lg">
                          {leader.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-bold text-white mb-2">{leader.username}</h3>
                      <p className="text-sm text-zinc-400 mb-3">{leader.country}</p>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-white">{leader.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-zinc-400">points</div>
                        <Badge variant="outline" className={getLevelColor(leader.level)}>
                          {leader.level}
                        </Badge>
                      </div>
                      <div className="flex justify-center space-x-4 mt-4 text-sm">
                        <div className="text-center">
                          <div className="text-purple-400 font-bold">{leader.badges?.length || 0}</div>
                          <div className="text-zinc-500">badges</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Remaining Leaders */}
            <div className="space-y-4">
              {Array.isArray(leaderboardData) && leaderboardData.slice(3).map((leader, index) => (
                <motion.div
                  key={leader._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-700">
                          {getRankIcon(leader.rank || index + 4)}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={leader.avatar || "/placeholder.svg"} alt={leader.username} />
                          <AvatarFallback className="bg-zinc-600">
                            {leader.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{leader.username}</h3>
                          <p className="text-sm text-zinc-400">{leader.country}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">{leader.totalPoints.toLocaleString()}</div>
                          <div className="text-sm text-zinc-400">points</div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <Badge variant="outline" className={getLevelColor(leader.level)}>
                            {leader.level}
                          </Badge>
                          <div className="flex space-x-2 text-xs">
                            <span className="text-purple-400">{leader.badges?.length || 0} badges</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {(!Array.isArray(leaderboardData) || leaderboardData.length === 0) && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-white mb-2">No leaders yet</h3>
                <p className="text-zinc-400">Be the first to make an impact!</p>
              </div>
            )}
          </TabsContent>

          {/* Eco Heroes Wall */}
          <TabsContent value="heroes" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Wall of Eco Heroes</h2>
              <p className="text-zinc-400">
                Celebrating the most impactful and inspiring sustainable actions from our community
              </p>
            </div>

            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-zinc-400">The Wall of Eco Heroes will showcase the most voted community proofs</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* User's Current Position */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white">Your Current Standing</CardTitle>
                <CardDescription>Keep climbing the leaderboard!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="bg-zinc-700 text-lg">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{user.username}</h3>
                    <p className="text-zinc-400">{user.country}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{user.totalPoints || 0}</div>
                    <div className="text-sm text-zinc-400">points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-zinc-300">#--</div>
                    <div className="text-sm text-zinc-400">rank</div>
                  </div>
                  <Badge variant="outline" className={getLevelColor(user.level || "Explorer")}>
                    {user.level || "Explorer"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        </div>
      )}
    </div>
  )
}
