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
import UserNavbar from "../components/UserNavbar"

export default function Leaderboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leaderboardData, setLeaderboardData] = useState([])
  const [sdgData, setSdgData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboardData()
  }, [])

  // Helper function to extract text from multilingual objects
  const getLocalizedText = (textObj, fallback = '') => {
    if (typeof textObj === 'string') return textObj
    if (typeof textObj === 'object' && textObj !== null) {
      return textObj.en || textObj.fr || Object.values(textObj)[0] || fallback
    }
    return fallback
  }

  const loadLeaderboardData = async () => {
    try {
      setLoading(true)
      const [leaderboardResponse, sdgSpinStatsResponse] = await Promise.all([
        ApiService.getLeaderboard(),
        ApiService.getSDGSpinStats()
      ])

      // Ensure data is an array, or use the data property if it's wrapped
      const leaderboardArray = Array.isArray(leaderboardResponse) ? leaderboardResponse : (leaderboardResponse.data || leaderboardResponse.users || [])

      // Sort leaderboard to show users with points first, then by points, but include all users
      const sortedLeaderboard = leaderboardArray.sort((a, b) => {
        // First sort by total points (descending)
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints
        }
        // If points are equal, sort by username alphabetically
        return a.username.localeCompare(b.username)
      })

      setLeaderboardData(sortedLeaderboard)

      // Process SDG spin statistics data
      const sdgStats = sdgSpinStatsResponse.data || []
      console.log('SDG Spin Stats:', sdgStats) // Debug log

      // Process and clean the SDG data
      const processedSdgs = sdgStats.map(sdg => ({
        ...sdg,
        title: getLocalizedText(sdg.title, 'Sustainable Development Goal'),
        description: getLocalizedText(sdg.description, 'Working towards a sustainable future'),
        challengeCount: sdg.spinCount // Use spinCount as challengeCount for display
      }))

      setSdgData(processedSdgs.slice(0, 6))
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
      <UserNavbar />

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
        <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
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

            {/* Champions Podium */}
            <div className="relative max-w-5xl mx-auto mb-12">
              <div className="flex items-end justify-center gap-4 md:gap-8">

                {/* Second Place (Left) */}
                {Array.isArray(leaderboardData) && leaderboardData[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    {/* User Card */}
                    <Card className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 border-gray-400/50 mb-4 w-48 relative overflow-hidden">
                      <div className="absolute top-2 right-2">
                        <div className="bg-gray-400/30 text-gray-200 px-2 py-1 rounded-full text-xs font-bold">
                          🥈 2nd
                        </div>
                      </div>
                      <CardContent className="pt-6 pb-4">
                        <div className="text-center">
                          <Avatar className="h-16 w-16 mx-auto mb-3 ring-4 ring-gray-400/30">
                            <AvatarImage src={leaderboardData[1].avatar || "/placeholder.svg"} alt={leaderboardData[1].username} />
                            <AvatarFallback className="bg-zinc-700 text-lg">
                              {leaderboardData[1].username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-lg font-bold text-white mb-1">{leaderboardData[1].username}</h3>
                          <p className="text-zinc-400 text-xs mb-2">{leaderboardData[1].country}</p>
                          <div className="text-center">
                            <span className="text-xl font-bold text-gray-300">{leaderboardData[1].totalPoints.toLocaleString()}</span>
                            <p className="text-xs text-zinc-400">points</p>
                          </div>
                          <Badge variant="outline" className="text-gray-300 border-gray-400/50 text-xs mt-2">
                            {leaderboardData[1].level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Podium Base */}
                    <div className="bg-gradient-to-t from-gray-600/40 to-gray-400/40 border border-gray-400/30 rounded-t-lg w-32 h-20 flex items-center justify-center">
                      <span className="text-gray-200 font-bold text-lg">2</span>
                    </div>
                  </motion.div>
                )}

                {/* First Place (Center) */}
                {Array.isArray(leaderboardData) && leaderboardData[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    {/* Crown */}
                    <div className="text-4xl mb-2 animate-bounce">👑</div>
                    {/* User Card */}
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 mb-4 w-52 relative overflow-hidden">
                      <div className="absolute top-2 right-2">
                        <div className="bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full text-xs font-bold">
                          🥇 1st
                        </div>
                      </div>
                      <CardContent className="pt-6 pb-4">
                        <div className="text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-yellow-500/50">
                            <AvatarImage src={leaderboardData[0].avatar || "/placeholder.svg"} alt={leaderboardData[0].username} />
                            <AvatarFallback className="bg-zinc-700 text-xl">
                              {leaderboardData[0].username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-xl font-bold text-white mb-1">{leaderboardData[0].username}</h3>
                          <p className="text-zinc-400 text-sm mb-2">{leaderboardData[0].country}</p>
                          <div className="text-center">
                            <span className="text-2xl font-bold text-yellow-300">{leaderboardData[0].totalPoints.toLocaleString()}</span>
                            <p className="text-sm text-zinc-400">points</p>
                          </div>
                          <Badge variant="outline" className="text-yellow-300 border-yellow-500/50 text-sm mt-2">
                            {leaderboardData[0].level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Podium Base */}
                    <div className="bg-gradient-to-t from-yellow-600/40 to-yellow-400/40 border border-yellow-500/50 rounded-t-lg w-36 h-28 flex items-center justify-center">
                      <span className="text-yellow-200 font-bold text-xl">1</span>
                    </div>
                  </motion.div>
                )}

                {/* Third Place (Right) */}
                {Array.isArray(leaderboardData) && leaderboardData[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    {/* User Card */}
                    <Card className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-600/50 mb-4 w-44 relative overflow-hidden">
                      <div className="absolute top-2 right-2">
                        <div className="bg-amber-600/30 text-amber-200 px-2 py-1 rounded-full text-xs font-bold">
                          🥉 3rd
                        </div>
                      </div>
                      <CardContent className="pt-6 pb-4">
                        <div className="text-center">
                          <Avatar className="h-14 w-14 mx-auto mb-3 ring-4 ring-amber-600/30">
                            <AvatarImage src={leaderboardData[2].avatar || "/placeholder.svg"} alt={leaderboardData[2].username} />
                            <AvatarFallback className="bg-zinc-700 text-base">
                              {leaderboardData[2].username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-base font-bold text-white mb-1">{leaderboardData[2].username}</h3>
                          <p className="text-zinc-400 text-xs mb-2">{leaderboardData[2].country}</p>
                          <div className="text-center">
                            <span className="text-lg font-bold text-amber-300">{leaderboardData[2].totalPoints.toLocaleString()}</span>
                            <p className="text-xs text-zinc-400">points</p>
                          </div>
                          <Badge variant="outline" className="text-amber-300 border-amber-600/50 text-xs mt-2">
                            {leaderboardData[2].level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Podium Base */}
                    <div className="bg-gradient-to-t from-amber-700/40 to-amber-600/40 border border-amber-600/30 rounded-t-lg w-28 h-16 flex items-center justify-center">
                      <span className="text-amber-200 font-bold text-base">3</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Podium Base Platform */}
              <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 border border-zinc-600/30 rounded-lg h-8 mt-0 mx-8"></div>
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
                Discover the most popular Sustainable Development Goals our community is passionate about
              </p>
            </div>

            {/* Most Chosen SDGs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sdgData.map((sdg, index) => (
                <motion.div
                  key={sdg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-900/50 border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="text-center">
                        {/* SDG Icon/Number */}
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                          <span className="text-2xl font-bold text-purple-300">
                            {sdg.number || index + 1}
                          </span>
                        </div>

                        {/* SDG Title */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {sdg.title}
                        </h3>

                        {/* SDG Description */}
                        <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                          {sdg.description}
                        </p>

                        {/* Stats */}
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-center">
                            <div className="text-purple-400 font-bold">
                              {sdg.spinCount || 0}
                            </div>
                            <div className="text-zinc-500">wheel spins</div>
                          </div>

                          {sdg.isClimateFocus && (
                            <Badge className="bg-green-600/20 text-green-300 border-green-600/50">
                              🌱 Climate Focus
                            </Badge>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, ((sdg.spinCount || 0) / Math.max(...sdgData.map(s => s.spinCount || 0), 1)) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">
                            {sdgData.length > 0 ? ((sdg.spinCount || 0) / Math.max(...sdgData.map(s => s.spinCount || 0), 1) * 100).toFixed(0) : 0}% of total spins
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {sdgData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">�</div>
                <h3 className="text-2xl font-bold text-white mb-2">Building Our Impact</h3>
                <p className="text-zinc-400">SDG popularity data will appear as our community grows</p>
              </div>
            )}
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
            <Card className="bg-zinc-900/50 border-zinc-700/50 backdrop-blur-sm">
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
